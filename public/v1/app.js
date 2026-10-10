/* MTG Companion v1 — client (tablet table, phone seat, TV display) */
import { html, render, useState, useEffect, useRef } from './vendor/preact-htm.js';

const MTG = window.MTG;
const PREVIEW = !!window.MTG_PREVIEW;
const IS_TV = !!window.MTG_TV;

// ---------- storage (never trusted, may be unavailable) ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem('mtg1.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('mtg1.' + k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem('mtg1.' + k); } catch {} },
};
const clientId = store.get('clientId', null) || (() => { const id = 'c' + Math.random().toString(36).slice(2, 12); store.set('clientId', id); return id; })();

// ---------- tiny global store ----------
const S = {
  route: '',
  settings: MTG.normSettings(store.get('settings', { players: 4, life: 40, timerOn: false, mins: 2, commander: true })),
  game: null,
  role: null,          // 'local' | 'host' | 'player' | 'spectator' | 'tv'
  seat: -1,            // my seat when role === 'player'
  hostToken: null,
  conn: false,
  clockOffset: 0,
  toast: '',
  tvMirror: false,     // preview: show the TV view of the local game
};
const subs = new Set();
const set = (patch) => { Object.assign(S, patch); subs.forEach((f) => f()); };
function useStore() {
  const [, force] = useState(0);
  useEffect(() => { const f = () => force((n) => n + 1); subs.add(f); return () => subs.delete(f); }, []);
  return S;
}
let toastT;
function toast(msg) { set({ toast: msg }); clearTimeout(toastT); toastT = setTimeout(() => set({ toast: '' }), 2600); }

// ---------- routing ----------
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [name, arg] = h.split('/');
  return { name: name || (IS_TV ? 'tv' : 'setup'), arg: arg || '' };
}
const go = (r) => { location.hash = '#/' + r; };
addEventListener('hashchange', () => set({ route: parseHash() }));
S.route = parseHash();

// ---------- network ----------
const net = {
  ws: null, wanted: false, delay: 600, pending: [], waiters: [],
  start() {
    if (PREVIEW || this.ws) return;
    this.wanted = true;
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    let ws;
    try { ws = new WebSocket(`${proto}://${location.host}/v1/ws`); } catch { return; }
    this.ws = ws;
    ws.onopen = () => {
      this.delay = 600;
      set({ conn: true });
      this.rejoin();
      const q = this.pending; this.pending = [];
      q.forEach((m) => ws.send(JSON.stringify(m)));
    };
    ws.onclose = () => {
      this.ws = null;
      set({ conn: false });
      if (this.wanted) { setTimeout(() => this.start(), this.delay); this.delay = Math.min(this.delay * 2, 5000); }
    };
    ws.onerror = () => {};
    ws.onmessage = (ev) => { let m; try { m = JSON.parse(ev.data); } catch { return; } onServer(m); };
  },
  send(m) {
    if (PREVIEW) return false;
    if (this.ws && this.ws.readyState === 1) { this.ws.send(JSON.stringify(m)); return true; }
    this.pending.push(m); this.start(); return false;
  },
  // ask and wait for one reply of the given types
  ask(m, types, ms = 6000) {
    return new Promise((res) => {
      if (PREVIEW) return res({ t: 'error', error: 'offline' });
      const w = { types, res };
      this.waiters.push(w);
      setTimeout(() => { const i = this.waiters.indexOf(w); if (i >= 0) { this.waiters.splice(i, 1); res({ t: 'error', error: 'timeout' }); } }, ms);
      this.send(m);
    });
  },
  // after a reconnect, re-attach to whatever game this device is part of
  rejoin() {
    const g = S.game;
    if (!g || !g.code) return;
    if ((S.role === 'host' || S.role === 'local') && S.hostToken) {
      this.ws.send(JSON.stringify({ t: 'host', code: g.code, hostToken: S.hostToken }));
      if (S.role === 'local') this.ws.send(JSON.stringify({ t: 'sync', game: g }));
    } else if (S.role === 'player' || S.role === 'spectator' || S.role === 'tv') {
      this.ws.send(JSON.stringify({ t: 'join', code: g.code, as: S.role, clientId, password: store.get('pw.' + g.code, '') }));
    }
  },
};

function onServer(m) {
  for (const w of net.waiters.slice()) {
    if (w.types.includes(m.t) || m.t === 'error') { net.waiters.splice(net.waiters.indexOf(w), 1); w.res(m); return; }
  }
  if (m.t === 'state' && m.game) {
    if (typeof m.now === 'number') S.clockOffset = m.now - Date.now();
    if (S.role === 'local') return; // the tablet is the authority for local games
    const patch = { game: m.game };
    if (typeof m.seat === 'number') patch.seat = m.seat;
    set(patch);
  } else if (m.t === 'kicked') {
    toast(m.error || 'The game ended');
    leaveGame();
  }
}

// ---------- game actions ----------
function saveLocal() {
  if (S.role === 'local' || S.role === 'host') store.set('game', { game: S.game, role: S.role, hostToken: S.hostToken });
}
function dispatch(a) {
  if (!S.game || S.role === 'spectator' || S.role === 'tv') return;
  if (S.role === 'player' && a.seat !== undefined && a.seat !== S.seat) return;
  const next = MTG.apply(S.game, a);
  if (!next) return;
  set({ game: next });
  if (S.role === 'local') { saveLocal(); if (S.hostToken) net.send({ t: 'sync', game: next }); }
  else { net.send({ t: 'act', a }); if (S.role === 'host') saveLocal(); }
}
function startLocal() {
  const game = MTG.newGame(S.settings, { mode: 'local' });
  set({ game, role: 'local', seat: -1, hostToken: null });
  saveLocal();
  go('game');
  // register with the server so a TV can mirror this table (works fine without it)
  net.ask({ t: 'create', mode: 'local', game }, ['created']).then((r) => {
    if (r.t !== 'created' || S.role !== 'local' || !S.game || S.game.startedAt !== game.startedAt) return;
    set({ game: { ...S.game, code: r.code }, hostToken: r.hostToken });
    saveLocal();
    net.send({ t: 'sync', game: S.game });
  });
}
async function createHosted(opts) {
  const game = MTG.newGame(S.settings, { mode: 'hosted', code: opts.code, locked: opts.locked, spectators: opts.spectators });
  const r = await net.ask({ t: 'create', mode: 'hosted', game, password: opts.locked ? opts.password : '' }, ['created']);
  if (r.t !== 'created') return r.error === 'offline' || r.error === 'timeout' ? "CAN'T REACH THE SERVER" : String(r.error || 'COULD NOT CREATE GAME').toUpperCase();
  set({ game: r.game, role: 'host', seat: -1, hostToken: r.hostToken });
  if (opts.locked) store.set('pw.' + r.code, opts.password);
  saveLocal();
  go('game');
  return '';
}
async function joinGame(code, password, as) {
  const r = await net.ask({ t: 'join', code, password, as, clientId }, ['joined']);
  if (r.t !== 'joined') return r.error === 'offline' || r.error === 'timeout' ? "CAN'T REACH THE SERVER" : String(r.error || 'COULD NOT JOIN').toUpperCase();
  store.set('pw.' + code, password || '');
  store.set('joined', { code, as });
  set({ game: r.game, role: r.role, seat: typeof r.seat === 'number' ? r.seat : -1, clockOffset: (r.now || Date.now()) - Date.now() });
  go(r.role === 'player' ? 'game' : 'watch');
  return '';
}
function leaveGame() {
  if (S.game && S.game.code && S.role !== 'local' && S.role !== 'host') net.send({ t: 'leave' });
  if (S.role === 'host' || S.role === 'local') net.send({ t: 'end' });
  store.del('game'); store.del('joined');
  set({ game: null, role: null, seat: -1, hostToken: null, tvMirror: false });
  go(IS_TV ? 'tv' : 'setup');
}

// resume a game after a reload
(() => {
  if (IS_TV) return;
  const saved = store.get('game', null);
  if (saved && saved.game && (saved.role === 'local' || saved.role === 'host')) {
    S.game = saved.game; S.role = saved.role; S.hostToken = saved.hostToken || null;
    if (S.game.code && S.hostToken) net.start();
    return;
  }
  const j = store.get('joined', null);
  if (j && j.code && !PREVIEW) joinGame(j.code, store.get('pw.' + j.code, ''), j.as);
})();

// ---------- stage scaling (same "fill the screen" approach as /tablet and /tv2) ----------
function useStageScale(w, h, mode) {
  const ref = useRef(null);
  useEffect(() => {
    const fit = () => {
      const el = ref.current; if (!el) return;
      const vw = (window.visualViewport && window.visualViewport.width) || innerWidth;
      const vh = (window.visualViewport && window.visualViewport.height) || innerHeight;
      let sx = vw / w, sy = vh / h;
      if (mode === 'contain') sx = sy = Math.min(sx, sy);
      el.style.width = w + 'px'; el.style.height = h + 'px';
      el.style.transform = `scale(${sx}, ${sy})`;
      el.style.left = (vw - w * sx) / 2 + 'px';
      el.style.top = (vh - h * sy) / 2 + 'px';
    };
    fit();
    addEventListener('resize', fit);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
    return () => { removeEventListener('resize', fit); if (window.visualViewport) window.visualViewport.removeEventListener('resize', fit); };
  }, [w, h, mode]);
  return ref;
}
function Stage({ w = 1586, h = 992, mode, children }) {
  const ref = useStageScale(w, h, mode);
  return html`<div id="stage" ref=${ref}>${children}</div>`;
}

// ---------- shared bits ----------
const Chevron = ({ left }) => html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${left ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}></path></svg>`;
const Switch = ({ on, onToggle, label }) => html`<button class="switch" role="switch" aria-checked=${on ? 'true' : 'false'} aria-label=${label} onClick=${onToggle}><span></span></button>`;
function Stepper({ value, onMinus, onPlus, label, small, disabled }) {
  return html`<div class="stepper" style=${{ opacity: disabled ? 0.35 : 1, marginRight: small ? '-14px' : 0 }}>
    <button class=${'stepBtn' + (small ? ' sm' : '')} aria-label=${'Decrease ' + label} disabled=${disabled} onClick=${onMinus}>−</button>
    <b class="stepVal" style=${small ? { width: '44px', fontSize: '28px', transform: 'none' } : null}>${value}</b>
    <button class=${'stepBtn' + (small ? ' sm' : '')} aria-label=${'Increase ' + label} disabled=${disabled} onClick=${onPlus}>+</button>
  </div>`;
}
function Title({ sub }) {
  return html`<div class="titleBlock"><h1>Magic: The Gathering</h1><div class="titleSub"><i></i>${sub}<i></i></div></div>`;
}
function QR({ text, size = 180 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.qrcode) return;
    try {
      const q = window.qrcode(0, 'M'); q.addData(text); q.make();
      ref.current.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
      const svg = ref.current.querySelector('svg'); if (svg) { svg.setAttribute('width', size); svg.setAttribute('height', size); }
    } catch {}
  }, [text, size]);
  return html`<div class="qrBox" ref=${ref}></div>`;
}
const joinUrl = (code) => `${location.origin}/v1/#/join/${code}`;
const tvUrl = (code) => `${location.origin}/v1/tv${code ? '#/tv/' + code : ''}`;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ---------- SETUP ----------
function Setup() {
  const s = useStore().settings;
  const upd = (p) => { const n = MTG.normSettings({ ...s, ...p }); store.set('settings', n); set({ settings: n }); };
  return html`<${Stage}><div class="tbl screen" style="width:1586px;height:992px">
    <div class="tblBlur" aria-hidden="true"></div>
    <${Title} sub="COMPANION APP" />
    <div class="card mgrCard frame9"><div class="cardBody">
      <div class="row"><span class="lbl">PLAYERS</span>
        <${Stepper} label="players" value=${s.players} onMinus=${() => upd({ players: clamp(s.players - 1, 1, 4) })} onPlus=${() => upd({ players: clamp(s.players + 1, 1, 4) })} /></div>
      <div class="row"><span class="lbl">STARTING LIFE</span>
        <${Stepper} label="starting life" value=${s.life} onMinus=${() => upd({ life: clamp(s.life - 5, 5, 200) })} onPlus=${() => upd({ life: clamp(s.life + 5, 5, 200) })} /></div>
      <div class="row">
        <div class="col" style="gap:14px"><span class="lbl">TURN TIMER</span><span class="sub" style=${{ opacity: s.timerOn ? 1 : 0.35 }}>MIN PER TURN</span></div>
        <div class="col" style="align-items:flex-end;gap:6px">
          <${Switch} label="Turn timer" on=${s.timerOn} onToggle=${() => upd({ timerOn: !s.timerOn })} />
          <${Stepper} small label="minutes" value=${s.mins} disabled=${!s.timerOn} onMinus=${() => upd({ mins: clamp(s.mins - 1, 1, 30) })} onPlus=${() => upd({ mins: clamp(s.mins + 1, 1, 30) })} />
        </div>
      </div>
      <div class="row"><div class="col"><span class="lbl">COMMANDER</span><span class="sub">DAMAGE & TAX</span></div>
        <${Switch} label="Commander" on=${s.commander} onToggle=${() => upd({ commander: !s.commander })} /></div>
      <div class="col" style="gap:18px;padding-top:22px">
        <div class="col" style="gap:0">
          <button class="flatLink ruled" onClick=${() => go('host')}><span class="col">HOST A GAME<span>PLAYERS JOIN FROM THEIR OWN PHONES</span></span><${Chevron} /></button>
          <button class="flatLink" onClick=${() => go('join')}><span class="col">JOIN A GAME<span>ENTER A HOST'S GAME CODE</span></span><${Chevron} /></button>
        </div>
        <button class="goldBtn goldTex" onClick=${startLocal}>START LOCAL GAME</button>
      </div>
    </div></div>
  </div><//>`;
}

// ---------- HOST ----------
function Host() {
  const [code, setCode] = useState(() => MTG.makeCode());
  const [locked, setLocked] = useState(false);
  const [spec, setSpec] = useState(true);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const create = async () => {
    if (locked && !pw.trim()) { setErr('SET A PASSWORD OR TURN IT OFF'); return; }
    setBusy(true); setErr('');
    const e = await createHosted({ code, locked, password: pw.trim(), spectators: spec });
    setBusy(false);
    if (e) setErr(PREVIEW ? 'ONLINE GAMES WORK ON THE LIVE APP, NOT IN THIS PREVIEW' : e);
  };
  return html`<${Stage}><div class="tbl screen" style="width:1586px;height:992px">
    <div class="tblBlur" aria-hidden="true"></div>
    <${Title} sub="HOST A GAME" />
    <div class="card mgrCard frame9"><div class="cardBody">
      <div class="row" style="padding:10px 0 20px">
        <div class="col" style="gap:6px"><span class="lbl">GAME CODE</span><span class="bigCode" style="font-size:58px;padding-left:0">${code}</span></div>
        <button class="iconBtn" style="width:76px;height:76px;color:var(--gold)" aria-label="Generate a new code" onClick=${() => setCode(MTG.makeCode())}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4v6h-6"></path><path d="M18.5 15a7 7 0 1 1-1.6-7.3L20 10"></path></svg></button>
      </div>
      <div class="row"><div class="col"><span class="lbl">PASSWORD</span><span class="sub">${locked ? 'REQUIRED TO JOIN' : 'ANYONE WITH THE CODE'}</span></div>
        <${Switch} label="Password" on=${locked} onToggle=${() => setLocked(!locked)} /></div>
      ${locked && html`<div class="ruled" style="padding:6px 0 18px"><input class="field text" type="password" aria-label="Game password" placeholder="Set a password" value=${pw} onInput=${(e) => setPw(e.target.value)} /></div>`}
      <div class="row"><div class="col"><span class="lbl">SPECTATORS</span><span class="sub">${spec ? 'CAN WATCH WITHOUT A SEAT' : 'PLAYERS ONLY'}</span></div>
        <${Switch} label="Allow spectators" on=${spec} onToggle=${() => setSpec(!spec)} /></div>
      <div class="hint" style="padding-top:6px">Players, life, turn timer and commander come from the setup screen.</div>
      <div class="err">${err}</div>
      <div class="col" style="gap:18px">
        <button class="goldBtn goldTex" disabled=${busy} onClick=${create}>${busy ? 'CREATING…' : 'CREATE GAME'}</button>
        <button class="flatLink back" onClick=${() => go('setup')}><${Chevron} left />BACK TO SETUP</button>
      </div>
    </div></div>
  </div><//>`;
}

// ---------- JOIN ----------
function Join({ initial }) {
  const [code, setCode] = useState((initial || '').toUpperCase().slice(0, 6));
  const [pw, setPw] = useState('');
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setInfo(null); setErr('');
    if (code.length !== 6 || PREVIEW) return;
    let live = true;
    net.ask({ t: 'peek', code }, ['peek']).then((r) => {
      if (!live) return;
      if (r.t === 'peek' && r.exists) setInfo(r);
      else setErr(r.error === 'timeout' ? "CAN'T REACH THE SERVER" : 'NO GAME WITH THAT CODE');
    });
    return () => { live = false; };
  }, [code]);
  const act = async (as) => {
    if (code.length !== 6) { setErr('ENTER THE 6-CHARACTER CODE'); return; }
    if (PREVIEW) { setErr('ONLINE GAMES WORK ON THE LIVE APP, NOT IN THIS PREVIEW'); return; }
    setBusy(true); setErr('');
    const e = await joinGame(code, pw, as);
    setBusy(false); if (e) setErr(e);
  };
  const locked = info ? info.locked : false;
  return html`<${Stage}><div class="tbl screen" style="width:1586px;height:992px">
    <div class="tblBlur" aria-hidden="true"></div>
    <${Title} sub="JOIN A GAME" />
    <div class="card mgrCard frame9"><div class="cardBody">
      <div class="col ruled" style="gap:14px;padding:14px 0 22px">
        <label class="lbl" for="code">GAME CODE</label>
        <input id="code" class="field code" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABC123" value=${code}
          onInput=${(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} />
        <span class="sub">${info ? `${info.open} OPEN SEAT${info.open === 1 ? '' : 'S'} · ${info.players} PLAYERS` : 'ASK THE HOST FOR THE 6-CHARACTER CODE'}</span>
      </div>
      ${locked && html`<div class="col ruled" style="gap:14px;padding:14px 0 22px">
        <div style="display:flex;align-items:center;gap:10px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 018 0v4"></path></svg><label class="lbl" for="pw">PASSWORD</label></div>
        <input id="pw" class="field text" type="password" placeholder="Enter password" value=${pw} onInput=${(e) => setPw(e.target.value)} />
        <span class="sub">THIS GAME IS PASSWORD LOCKED</span></div>`}
      <div class="err" style="padding-top:8px">${err}</div>
      <div class="col" style="gap:18px">
        <button class="goldBtn goldTex" disabled=${busy || (info && info.open === 0)} onClick=${() => act('player')}>JOIN GAME</button>
        <button class="goldBtn goldTex" disabled=${busy || (info && !info.spectators)} onClick=${() => act('spectator')}>SPECTATE</button>
        <button class="flatLink back" onClick=${() => go('setup')}><${Chevron} left />BACK TO SETUP</button>
      </div>
    </div></div>
  </div><//>`;
}

// ---------- seats ----------
const QUADS = {
  bl: { x: 20, y: 494, w: 766, h: 478, rot: 0 },
  br: { x: 804, y: 494, w: 762, h: 478, rot: 0 },
  tr: { x: 804, y: 20, w: 762, h: 457, rot: 180 },
  tl: { x: 20, y: 20, w: 766, h: 457, rot: 180 },
  bottom: { x: 20, y: 494, w: 1546, h: 478, rot: 0, wide: true },
  top: { x: 20, y: 20, w: 1546, h: 457, rot: 180, wide: true },
  solo: { x: 20, y: 20, w: 1546, h: 952, rot: 0, wide: true, solo: true },
};
// seat order runs clockwise around the table (Magic passes the turn to the left)
const LAYOUTS = { 1: ['solo'], 2: ['bottom', 'top'], 3: ['bottom', 'tl', 'tr'], 4: ['bl', 'tl', 'tr', 'br'] };
const quadsFor = (n) => (LAYOUTS[n] || LAYOUTS[4]).map((k) => QUADS[k]);

// running "+3 / −2" next to the life total, cleared after a pause
function useDelta(life) {
  const prev = useRef(life);
  const [delta, setDelta] = useState(0);
  const t = useRef(null);
  useEffect(() => {
    const d = life - prev.current;
    prev.current = life;
    if (!d) return;
    setDelta((x) => x + d);
    clearTimeout(t.current);
    t.current = setTimeout(() => setDelta(0), 1600);
  }, [life]);
  useEffect(() => () => clearTimeout(t.current), []);
  return delta;
}

function Seat({ g, i, q, onMenu, canEdit, showActive }) {
  const s = g.seats[i];
  const delta = useDelta(s.life);
  const [name, setName] = useState(s.name);
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setName(s.name); }, [s.name]);
  const d = (a) => canEdit && dispatch({ ...a, seat: i });
  const det = MTG.details(g, i);
  const n = MTG.activeCount(g, i);
  const centerPos = q.wide && !q.solo ? 'left: 60px; width: 520px' : (q.solo ? 'left: 0; right: 0' : 'left: 0; right: 0');
  const detPos = q.wide && !q.solo ? 'left: 60px; width: 520px' : 'left: 130px; right: 130px';
  const cmdr = g.settings.commander;
  const art = s.cmdrs[0] && (s.cmdrs[0].art || s.cmdrs[0].image);
  return html`<div class="seat" style=${`left:${q.x}px;top:${q.y}px;width:${q.w}px;height:${q.h}px`}>
    <div class="seatIn" style=${{ transform: q.rot ? 'rotate(180deg)' : 'none' }}>
      ${art && html`<div class="seatArt" aria-hidden="true" style=${{ backgroundImage: `url("${art}")` }}></div>`}
      <div class="seatShade" aria-hidden="true"></div>
      ${showActive && html`<div class="activeEdge" aria-hidden="true"></div>`}
      ${s.out && html`<div class="outVeil" aria-hidden="true">CONCEDED</div>`}
      <div style=${`position:absolute;top:40px;${centerPos};display:flex;justify-content:center;z-index:2`}>
        <input class="nameIn" type="text" aria-label="Player name" placeholder="Player Name" maxlength="24" value=${name} disabled=${!canEdit}
          onFocus=${() => { focused.current = true; }}
          onInput=${(e) => setName(e.target.value)}
          onBlur=${() => { focused.current = false; if (name !== s.name) d({ type: 'name', name }); }}
          onKeyDown=${(e) => { if (e.key === 'Enter') e.target.blur(); }} />
      </div>
      <div style=${`position:absolute;top:102px;${detPos};display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:none;z-index:2`}>
        ${det.map((x) => html`<div class="detLine"><b>${x.label}</b><span> ${x.text}</span></div>`)}
      </div>
      <button class="lifeZone" aria-label="Lose one life" style="left:0;padding:0 0 0 38px;text-align:left" onClick=${() => d({ type: 'life', d: -1 })}>−</button>
      <button class="lifeZone" aria-label="Gain one life" style="right:0;padding:0 38px 0 0;text-align:right" onClick=${() => d({ type: 'life', d: 1 })}>+</button>
      <div style="position:absolute;top:50%;left:0;right:0;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:2">
        <span class="lifeNum" aria-live="polite" style=${q.solo ? 'font-size:230px' : null}>${s.life}</span>
      </div>
      <div class="pete" style=${`position:absolute;top:calc(50% - ${q.solo ? 180 : 112}px);left:0;right:0;text-align:center;pointer-events:none;z-index:2;font-size:34px;color:${delta > 0 ? '#7FD08A' : '#E0715B'};text-shadow:0 2px 10px rgba(8,8,10,0.95)`}>${delta ? (delta > 0 ? '+' + delta : String(delta)) : ''}</div>
      <div style=${`position:absolute;top:calc(50% + ${q.solo ? 150 : 88}px);left:0;right:0;display:flex;justify-content:center;z-index:2`}>
        <button class="burger" aria-label="Menu" onClick=${() => onMenu(i)}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
          ${n > 0 && html`<span class="badge">${n}</span>`}
        </button>
      </div>
      ${cmdr && html`<div style="position:absolute;bottom:12px;left:130px;right:130px;display:flex;align-items:center;justify-content:center;gap:4px;z-index:2">
        <button class="taxBtn" aria-label="Remove commander tax" onClick=${() => d({ type: 'tax', d: -2 })}>−</button>
        <div style="min-width:96px;display:flex;align-items:baseline;justify-content:center;gap:8px;pointer-events:none"><span class="sub" style="letter-spacing:0.2em">TAX</span><b class="pete" style="font-size:32px;line-height:1;color:var(--bright)">${s.tax}</b></div>
        <button class="taxBtn" aria-label="Add commander tax" onClick=${() => d({ type: 'tax', d: 2 })}>+</button>
      </div>`}
      <button class="five" style="left:18px" onClick=${() => d({ type: 'life', d: -5 })}>−5</button>
      <button class="five" style="right:18px" onClick=${() => d({ type: 'life', d: 5 })}>+5</button>
    </div>
    <div class="seatFrame frame9" aria-hidden="true"></div>
  </div>`;
}

// ---------- turn clock ----------
function useNow(ms = 250) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}
function remaining(g, now) {
  if (!g.settings.timerOn) return null;
  const elapsed = (now + (S.role === 'local' ? 0 : S.clockOffset) - g.turnStartedAt) / 1000;
  return Math.ceil(g.settings.mins * 60 - elapsed);
}
const fmt = (s) => (s <= 0 ? 'TIME' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);

function EndTurn({ g, x, y, enabled }) {
  const now = useNow();
  const rem = remaining(g, now);
  const [pressed, setPressed] = useState(false);
  const who = MTG.seatLabel(g, g.active).toUpperCase() + "'S TURN";
  return html`<div style=${`position:absolute;left:${x}px;top:${y}px;width:300px;height:0;margin-left:-150px;z-index:12`}>
    <div style="position:absolute;left:0;right:0;top:-112px;height:224px;display:flex;justify-content:center">
      <button class=${'endTurn endTex endGlow' + (pressed ? ' pressed' : '')} aria-label="End turn" disabled=${!enabled}
        onPointerDown=${() => setPressed(true)} onPointerUp=${() => setPressed(false)} onPointerLeave=${() => setPressed(false)}
        onClick=${() => dispatch({ type: 'endTurn' })}>
        <span class="who">${who}</span>
        <span class="big">END<br />TURN</span>
        ${rem !== null && html`<span class=${'clock' + (rem <= 15 ? ' low' : '')}>${fmt(rem)}</span>`}
      </button>
    </div>
  </div>`;
}

// ---------- the table (tablet: every seat, rotated to face its player) ----------
function Table() {
  const st = useStore();
  const g = st.game;
  const [menu, setMenu] = useState(-1);
  const n = g.seats.length;
  const quads = quadsFor(n);
  const timerOn = g.settings.timerOn;
  return html`<${Stage}><div class="tbl" style="position:relative;width:1586px;height:992px;overflow:hidden">
    ${quads.map((q, i) => html`<${Seat} key=${i} g=${g} i=${i} q=${q} canEdit=${true} showActive=${n > 1 && g.active === i && !g.seats[i].out} onMenu=${setMenu} />`)}
    ${n > 1 && html`<${EndTurn} g=${g} x=${793} y=${488} enabled=${true} />`}
    ${n === 1 && timerOn && html`<${SoloClock} g=${g} />`}
    ${menu >= 0 && html`<${Menu} g=${g} i=${menu} rot=${quads[menu].rot} isHost=${true} onClose=${() => setMenu(-1)} />`}
    ${PREVIEW && html`<${PreviewBar} />`}
  </div><//>`;
}
function SoloClock({ g }) {
  const rem = remaining(g, useNow());
  return html`<div class="pete" style="position:absolute;top:40px;right:60px;z-index:6;font-size:40px;color:var(--gold)">${fmt(rem)}</div>`;
}

// ---------- phone: just my seat ----------
function PlayerView() {
  const st = useStore();
  const g = st.game;
  const i = st.seat;
  const [menu, setMenu] = useState(-1);
  const [portrait, setPortrait] = useState(innerHeight > innerWidth);
  useEffect(() => { const f = () => setPortrait(innerHeight > innerWidth); addEventListener('resize', f); return () => removeEventListener('resize', f); }, []);
  if (!g || i < 0 || !g.seats[i]) return html`<${Waiting} text="CONNECTING…" />`;
  const mine = g.active === i;
  return html`<${Stage}><div class="tbl" style="position:relative;width:1586px;height:992px;overflow:hidden">
    <${Seat} g=${g} i=${i} q=${QUADS.solo} canEdit=${true} showActive=${mine} onMenu=${setMenu} />
    ${mine ? html`<${EndTurn} g=${g} x=${1380} y=${270} enabled=${true} />`
      : html`<div class="sub" style="position:absolute;top:44px;right:60px;z-index:6;font-size:15px">${MTG.seatLabel(g, g.active).toUpperCase()}'S TURN</div>`}
    ${!st.conn && html`<div class="connDot" title="Reconnecting"></div>`}
    ${portrait && html`<div class="sub" style="position:absolute;bottom:90px;left:0;right:0;text-align:center;z-index:8">TURN YOUR PHONE SIDEWAYS</div>`}
    ${menu >= 0 && html`<${Menu} g=${g} i=${i} rot=${0} isHost=${false} onClose=${() => setMenu(-1)} />`}
  </div><//>`;
}
function Waiting({ text }) {
  return html`<${Stage}><div class="tbl screen" style="width:1586px;height:992px"><div class="tblBlur"></div><${Title} sub=${text} />
    <button class="flatLink back" style="width:auto;position:relative;z-index:1" onClick=${leaveGame}><${Chevron} left />BACK</button></div><//>`;
}

// ---------- menu ----------
const HEAD = { '': 'MENU', add: 'COMMANDER', search: 'COMMANDER', cmd: 'COMMANDER DAMAGE', ctr: 'COUNTERS', status: 'STATUS', timer: 'TURN TIMER', host: 'HOSTED GAME' };
function Menu({ g, i, rot, isHost, onClose }) {
  const st = useStore();
  const [tab, setTab] = useState('');
  const [pick, setPick] = useState(false);
  const [custom, setCustom] = useState('');
  const [confirm, setConfirm] = useState('');
  const [editIdx, setEditIdx] = useState(-1);
  const s = g.seats[i];
  const d = (a) => dispatch({ ...a, seat: i });
  const goTab = (t) => { setTab(t); setPick(false); setCustom(''); setConfirm(''); };
  const back = () => (pick ? setPick(false) : goTab(tab === 'search' ? 'add' : ''));
  const n = g.seats.length;
  const cmdMax = MTG.cmdMax(g, i);
  const ctrSum = MTG.counterKinds(s).filter((k) => (s.ctr[k.key] || 0) > 0).map((k) => k.chip + ' ' + s.ctr[k.key]).join(' · ');
  const statOn = MTG.statusKinds(s).filter((f) => MTG.hasFlag(g, i, f.key));
  const local = g.mode === 'local';
  const items = [];
  if (g.settings.commander) {
    items.push({ label: 'COMMANDER', summary: s.cmdrs.length ? s.cmdrs.map((c) => c.name).join(' · ').toUpperCase() : 'NONE YET', t: 'add' });
    if (n > 1) items.push({ label: 'COMMANDER DAMAGE', summary: cmdMax > 0 ? 'MAX ' + cmdMax : '', t: 'cmd' });
  }
  items.push({ label: 'COUNTERS', summary: ctrSum, t: 'ctr' });
  items.push({ label: 'STATUS', summary: statOn.map((f) => f.label).join(' · '), t: 'status' });
  if (isHost) {
    items.push({ label: 'TURN TIMER', summary: g.settings.timerOn ? g.settings.mins + ' MIN PER TURN' : 'OFF', t: 'timer' });
    items.push({ label: local ? 'TV DISPLAY' : 'HOSTED GAME', summary: g.code ? 'CODE ' + g.code + (g.locked ? ' · PASSWORD ON' : '') : (st.conn ? 'CONNECTING…' : 'OFFLINE'), t: 'host' });
  }

  const concede = () => {
    if (s.out) { d({ type: 'concede', out: false }); setConfirm(''); return; }
    if (confirm !== 'concede') { setConfirm('concede'); return; }
    d({ type: 'concede', out: true }); onClose();
  };
  const reset = () => {
    if (confirm !== 'reset') { setConfirm('reset'); return; }
    dispatch({ type: 'reset' }); onClose();
  };
  const exit = () => { if (confirm !== 'exit') { setConfirm('exit'); return; } leaveGame(); };

  return html`<div class="veil" onClick=${(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div class="menu mgrCard" style=${{ transform: rot ? 'rotate(180deg)' : 'none' }} role="dialog" aria-label=${HEAD[tab]}>
      <div class="menuHead">
        ${tab && html`<button class="iconBtn" aria-label="Back" onClick=${back}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"></path></svg></button>`}
        <div class="col" style="flex:1 1 0;gap:2px">
          <h2>${tab === 'host' && g.mode === 'local' ? 'TV DISPLAY' : HEAD[tab]}</h2>
          <div style="font-size:12px;letter-spacing:0.18em;color:var(--muted)">${MTG.seatLabel(g, i).toUpperCase()} · LIFE <span class="pete" style="font-size:20px;color:var(--white);letter-spacing:0">${s.life}</span></div>
        </div>
        <button class="iconBtn" aria-label="Close menu" onClick=${onClose}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>
      </div>

      ${tab === '' && html`
        <div class="col" style="align-items:flex-start;gap:12px;padding:12px 0 8px">
          ${items.map((it) => html`<button class="menuItem" onClick=${() => goTab(it.t)}><span>${it.label}<${Chevron} /></span><span class="subGold">${it.summary}</span></button>`)}
        </div>
        <div class="col" style="gap:8px;padding-top:16px;margin-top:auto">
          <button class=${'concede' + (confirm === 'concede' ? ' armed' : '') + (s.out ? ' rejoin' : '')} onClick=${concede}>${s.out ? 'REJOIN GAME' : confirm === 'concede' ? 'TAP AGAIN TO CONCEDE' : 'CONCEDE'}</button>
          <div style="display:flex;align-items:stretch">
            ${isHost && html`<button class=${'flatHalf' + (confirm === 'reset' ? ' armed' : '')} onClick=${reset}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v6h6"></path><path d="M5.5 15a7 7 0 1 0 1.6-7.3L4 10"></path></svg>${confirm === 'reset' ? 'CONFIRM RESET' : 'RESET GAME'}</button><span class="vRule" aria-hidden="true"></span>`}
            <button class=${'flatHalf' + (confirm === 'exit' ? ' armed' : '')} onClick=${exit}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4h4v16h-4"></path><path d="M10 8l-4 4 4 4"></path><path d="M6 12h10"></path></svg>${confirm === 'exit' ? 'CONFIRM EXIT' : isHost ? 'EXIT GAME' : 'LEAVE GAME'}</button>
          </div>
        </div>`}

      ${tab === 'add' && html`<div class="col" style="gap:30px;padding-top:56px">
        ${s.cmdrs.map((c, k) => html`<div class="ruled" style="padding-bottom:18px"><div style="min-height:72px;display:flex;align-items:center;gap:16px">
          <span class="art" style=${c.art ? { backgroundImage: `url("${c.art}")` } : null}>${c.art ? '' : 'ART'}</span>
          <span class="col" style="flex:1 1 0;min-width:0"><span style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:var(--gold-dim)">${k === 0 ? 'COMMANDER' : 'PARTNER'}</span><span style="font-size:17px;font-weight:700;letter-spacing:0.1em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name.toUpperCase()}</span></span>
          <button class="textBtn" onClick=${() => { setEditIdx(k); goTab('search'); }}>CHANGE</button>
        </div></div>`)}
        ${s.cmdrs.length < 2 && html`<button class="pickRow" style="min-height:84px" onClick=${() => { setEditIdx(-1); goTab('search'); }}>
          <span class="col"><span style="font-size:18px;letter-spacing:0.18em;color:var(--gold)">ADD COMMANDER</span><span>${s.cmdrs.length ? 'PARTNER · FRIENDS FOREVER · BACKGROUND' : 'NO COMMANDER SELECTED'}</span></span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>`}
      </div>`}

      ${tab === 'search' && html`<${CmdrSearch} onPick=${(c) => { d(editIdx >= 0 ? { type: 'setCmdr', idx: editIdx, cmdr: c } : { type: 'addCmdr', cmdr: c }); goTab('add'); }}
        onRemove=${editIdx >= 0 ? () => { d({ type: 'removeCmdr', idx: editIdx }); goTab('add'); } : null} />`}

      ${tab === 'cmd' && html`<div class="col" style="gap:36px;padding-top:20px">
        ${g.seats.map((o, j) => j === i ? null : html`<div class="ctrRow">
          <div class="name">FROM ${MTG.seatLabel(g, j).toUpperCase()}</div>
          <button class="stepBtn lg" aria-label="Remove one" onClick=${() => d({ type: 'cmd', from: j, d: -1 })}>−</button>
          <b class=${(s.cmd[j] || 0) >= 21 ? 'lethal' : ''}>${s.cmd[j] || 0}</b>
          <button class="stepBtn lg" aria-label="Add one" onClick=${() => d({ type: 'cmd', from: j, d: 1 })}>+</button>
        </div>`)}
        <div class="hint">Also comes off life. 21 from one commander is lethal.</div>
      </div>`}

      ${tab === 'ctr' && !pick && html`<div class="col" style="gap:24px;padding-top:20px">
        ${MTG.counterKinds(s).filter((k) => s.shown[k.key] || (s.ctr[k.key] || 0) > 0).map((k) => html`<div class="ctrRow">
          <div class="name">${k.label}</div>
          <button class="stepBtn lg" aria-label=${'Remove ' + k.label} onClick=${() => d({ type: 'ctr', key: k.key, d: -1 })}>−</button>
          <b class=${k.lethal && (s.ctr[k.key] || 0) >= k.lethal ? 'lethal' : ''}>${s.ctr[k.key] || 0}</b>
          <button class="stepBtn lg" aria-label=${'Add ' + k.label} onClick=${() => d({ type: 'ctr', key: k.key, d: 1 })}>+</button>
        </div>`)}
        ${!MTG.counterKinds(s).some((k) => s.shown[k.key] || (s.ctr[k.key] || 0) > 0) && html`<div class="hint">No counters yet.</div>`}
        <button class="pickRow" onClick=${() => setPick(true)}><span class="col"><span style="color:var(--gold)">ADD COUNTER</span><span>POISON · ENERGY · EXPERIENCE · RAD · CUSTOM</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>
      </div>`}
      ${tab === 'ctr' && pick && html`<div class="col" style="gap:10px;padding-top:10px">
        ${MTG.counterKinds(s).filter((k) => !(s.shown[k.key] || (s.ctr[k.key] || 0) > 0)).map((k) => html`<button class="pickRow" onClick=${() => { d({ type: 'showCtr', key: k.key }); setPick(false); }}><span class="col"><span>${k.label}</span>${k.lethal && html`<span>${k.lethal} IS LETHAL</span>`}</span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>`)}
        <div class="sub" style="padding-top:10px">FIND ANY COUNTER</div>
        <${CounterSearch} seat=${s} onPick=${(nm) => {
          const k = MTG.counterKinds(s).find((x) => x.label === nm.toUpperCase() || x.chip === nm.toUpperCase());
          d(k ? { type: 'showCtr', key: k.key } : { type: 'customCtr', name: nm });
          setPick(false);
        }} />
      </div>`}

      ${tab === 'status' && !pick && html`<div class="col" style="gap:10px;padding-top:20px">
        ${statOn.map((f) => html`<div class="pickRow" style="cursor:default"><span class="col"><span>${f.label}</span><span>${f.hint}</span></span><button class="textBtn" onClick=${() => d({ type: 'flag', key: f.key })}>REMOVE</button></div>`)}
        ${!statOn.length && html`<div class="hint">No status yet.</div>`}
        <button class="pickRow" onClick=${() => setPick(true)}><span class="col"><span style="color:var(--gold)">ADD STATUS</span><span>MONARCH · INITIATIVE · CITY'S BLESSING · RING · CUSTOM</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>
      </div>`}
      ${tab === 'status' && pick && html`<div class="col" style="gap:10px;padding-top:10px">
        ${MTG.statusKinds(s).filter((f) => !MTG.hasFlag(g, i, f.key)).map((f) => {
          const holder = f.solo ? (f.key === 'monarch' ? g.monarch : g.initiative) : -1;
          const hint = holder >= 0 ? 'TAKES IT FROM ' + MTG.seatLabel(g, holder).toUpperCase() : f.hint;
          const take = () => { d({ type: 'flag', key: f.key }); if (holder >= 0) toast(f.label.charAt(0) + f.label.slice(1).toLowerCase() + ' moved from ' + MTG.seatLabel(g, holder)); setPick(false); };
          return html`<button class="pickRow" onClick=${take}><span class="col"><span>${f.label}</span><span style=${holder >= 0 ? { color: 'var(--gold)' } : null}>${hint}</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>`;
        })}
        <div class="sub" style="padding-top:10px">CUSTOM STATUS</div>
        <div style="display:flex;gap:12px"><input class="boxIn" type="text" aria-label="Custom status name" placeholder="Name it" maxlength="24" value=${custom} onInput=${(e) => setCustom(e.target.value)} />
          <button class="smallBtn" onClick=${() => { if (custom.trim()) { d({ type: 'customStatus', name: custom.trim() }); setCustom(''); setPick(false); } }}>ADD</button></div>
      </div>`}

      ${tab === 'timer' && html`<div class="col" style="gap:10px;padding-top:20px">
        <div class="row"><span class="lbl">TURN TIMER</span><${Switch} label="Turn timer" on=${g.settings.timerOn} onToggle=${() => dispatch({ type: 'timer', on: !g.settings.timerOn })} /></div>
        <div class="row" style=${{ opacity: g.settings.timerOn ? 1 : 0.35 }}><span class="lbl">MIN PER TURN</span>
          <div class="stepper" style="margin-right:-14px"><button class="stepBtn lg" aria-label="Fewer minutes" disabled=${!g.settings.timerOn} onClick=${() => dispatch({ type: 'timer', mins: g.settings.mins - 1 })}>−</button>
          <b class="stepVal" style="width:56px;font-size:40px">${g.settings.mins}</b>
          <button class="stepBtn lg" aria-label="More minutes" disabled=${!g.settings.timerOn} onClick=${() => dispatch({ type: 'timer', mins: g.settings.mins + 1 })}>+</button></div></div>
        <div class="hint">Restarts on every End Turn. Applies to all players.</div>
      </div>`}

      ${tab === 'host' && html`<${HostPanel} g=${g} />`}
    </div>
  </div>`;
}

function HostPanel({ g }) {
  const st = useStore();
  const [pw, setPw] = useState('');
  const [shared, setShared] = useState(false);
  const local = g.mode === 'local';
  if (!g.code) return html`<div class="col" style="gap:14px;padding-top:30px"><div class="lbl">${PREVIEW ? 'PREVIEW MODE' : st.conn ? 'CONNECTING…' : 'OFFLINE'}</div>
    <div class="hint">${PREVIEW ? 'The live app gives every game a code so a TV can show it. Use SHOW TV VIEW at the bottom of the table to see it here.' : 'This game still works. A TV code appears as soon as the server is reachable.'}</div></div>`;
  const share = async () => {
    const url = local ? tvUrl(g.code) : joinUrl(g.code);
    try {
      if (navigator.share) await navigator.share({ title: 'MTG game ' + g.code, text: local ? 'Watch our game' : 'Join my game: ' + g.code, url });
      else { await navigator.clipboard.writeText(url); }
      setShared(true);
    } catch {}
  };
  const setRoom = (p) => net.send({ t: 'room', ...p });
  return html`<div class="col" style="gap:10px;padding-top:12px">
    <div class="col ruled" style="align-items:center;gap:8px;padding:8px 0 22px">
      <span class="sub">${local ? 'TV CODE' : 'GAME CODE'}</span>
      <span class="bigCode">${g.code}</span>
      ${local && html`<div style="display:flex;align-items:center;gap:18px;padding-top:6px"><${QR} text=${tvUrl(g.code)} size=${120} /><span class="hint" style="max-width:240px">Open ${location.host}/v1/tv on the TV and enter this code, or scan.</span></div>`}
    </div>
    <button class="row" style="width:100%;box-sizing:border-box;border-top:none;border-left:none;border-right:none;background:transparent;color:var(--bright);text-align:left" onClick=${share}>
      <span class="col"><span class="lbl">${local ? 'SHARE TV LINK' : 'SHARE GAME'}</span><span class="subGold">${shared ? 'LINK READY' : local ? 'SEND THE TV LINK' : 'INVITE LINK · ' + joinUrl(g.code).replace(/^https?:\/\//, '')}</span></span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"></path><path d="M7 8l5-5 5 5"></path><path d="M5 13v7h14v-7"></path></svg>
    </button>
    ${!local && html`
      <div class="row"><span class="col"><span class="lbl">PASSWORD</span><span class="subGold">${g.locked ? 'ON · REQUIRED TO JOIN' : 'OFF · ANYONE WITH THE CODE CAN JOIN'}</span></span>
        <${Switch} label="Password" on=${g.locked} onToggle=${() => { if (g.locked) setRoom({ locked: false }); else if (pw.trim()) setRoom({ locked: true, password: pw.trim() }); else toast('Type a password first'); }} /></div>
      <div style="display:flex;gap:12px;padding-top:10px">
        <input class="boxIn" type="password" aria-label="Game password" placeholder=${g.locked ? 'New password' : 'Set a password'} value=${pw} onInput=${(e) => setPw(e.target.value)} />
        <button class="smallBtn" onClick=${() => { if (pw.trim()) { setRoom({ locked: true, password: pw.trim() }); store.set('pw.' + g.code, pw.trim()); setPw(''); toast('Password saved'); } }}>${g.locked ? 'CHANGE' : 'SET'}</button>
      </div>
      <div class="row"><span class="col"><span class="lbl">SPECTATORS</span><span class="subGold">${g.spectators ? 'ALLOWED' : 'PLAYERS ONLY'}</span></span>
        <${Switch} label="Spectators" on=${g.spectators} onToggle=${() => setRoom({ spectators: !g.spectators })} /></div>
      <div class="hint">${g.seats.filter((x) => x.owner).length} of ${g.seats.length} seats taken from phones${st.conn ? '' : ' · reconnecting…'}</div>`}
  </div>`;
}

// Counter lookup: every counter type printed on Magic cards, plus whatever Scryfall finds in card text.
// Anything not found can still be added as a custom counter.
const KNOWN_COUNTERS = ('+1/+1,-1/-1,loyalty,defense,shield,stun,finality,charge,time,lore,level,oil,quest,storage,fade,age,ticket,bounty,blood,' +
  'aegis,aim,arrow,arrowhead,awakening,blaze,bloodline,book,brain,bribery,brick,burden,cage,carrion,coin,collection,component,contested,corpse,' +
  'corruption,credit,croak,crystal,cube,currency,death,delay,depletion,descent,despair,devotion,divinity,doom,dream,echo,egg,elixir,ember,' +
  'enlightened,eon,eyeball,eyestalk,fate,feather,fetch,filibuster,flame,flood,foreshadow,fungus,fury,fuse,gem,ghostform,glyph,gold,growth,hack,' +
  'harmony,hatching,hatchling,healing,hit,hone,hoofprint,hope,hour,hourglass,hunger,ice,incarnation,income,infection,influence,ingenuity,intel,' +
  'intervention,invitation,isolation,javelin,judgment,ki,kick,knickknack,knowledge,landmark,luck,magnet,manabond,manifestation,mannequin,matrix,' +
  'mine,mining,mire,music,muster,necrodermis,net,night,omen,ore,page,pain,palliation,paralyzation,pause,petal,petrification,phylactery,phyresis,' +
  'pin,plague,plot,polyp,pressure,prey,pupa,rejection,reprieve,rev,revival,ribbon,ritual,rope,rust,scream,scroll,shell,shred,silver,sleep,sleight,' +
  'slime,slumber,soot,soul,spark,spite,spore,stash,story,strife,study,supply,suspect,takeover,task,theft,tide,tower,training,trap,treasure,unity,' +
  'unlock,valor,velocity,verse,vitality,void,volatile,vortex,vow,voyage,wage,winch,wind,wish,wreck,' +
  'flying,first strike,double strike,deathtouch,hexproof,indestructible,lifelink,menace,reach,trample,vigilance,haste').split(',');
function CounterSearch({ seat, onPick }) {
  const [q, setQ] = useState('');
  const [found, setFound] = useState([]);
  const [state, setState] = useState('idle');
  const term = q.trim().toLowerCase();
  useEffect(() => {
    if (term.length < 2) { setFound([]); setState('idle'); return; }
    let live = true;
    setState('busy');
    const t = setTimeout(async () => {
      try {
        const r = await fetch('https://api.scryfall.com/cards/search?unique=cards&order=edhrec&q=' + encodeURIComponent(`o:"${term}" o:counter`));
        if (r.status === 404) { if (live) { setFound([]); setState('done'); } return; }
        const j = await r.json();
        const names = new Set();
        for (const c of j.data || []) {
          const text = [c.oracle_text, ...(c.card_faces || []).map((f) => f.oracle_text)].join(' ').toLowerCase();
          for (const m of text.matchAll(/([+\-]\d\/[+\-]\d|[a-z][a-z-]*(?: strike)?) counters?\b/g)) {
            const nm = m[1];
            if (nm.includes(term) && !['a', 'an', 'the', 'that', 'those', 'of', 'more', 'each', 'any', 'all', 'no', 'its', 'his', 'her', 'their', 'additional', 'those', 'kind', 'many', 'x', 'two', 'three', 'four', 'five', 'one'].includes(nm)) names.add(nm);
          }
        }
        if (live) { setFound([...names]); setState('done'); }
      } catch { if (live) { setFound([]); setState('offline'); } }
    }, 280);
    return () => { live = false; clearTimeout(t); };
  }, [term]);
  const have = new Set(MTG.counterKinds(seat).filter((k) => seat.shown[k.key] || (seat.ctr[k.key] || 0) > 0).map((k) => k.label.toLowerCase()));
  const local = term ? [...MTG.COUNTERS.map((k) => k.label.toLowerCase()), ...KNOWN_COUNTERS].filter((c) => c.includes(term)) : [];
  const list = [...new Set([...local, ...found])].filter((c) => !have.has(c)).sort((a, b) => (a.startsWith(term) ? 0 : 1) - (b.startsWith(term) ? 0 : 1) || a.localeCompare(b)).slice(0, 8);
  const exact = list.includes(term) || have.has(term) || MTG.counterKinds(seat).some((k) => k.label.toLowerCase() === term || k.chip.toLowerCase() === term);
  const add = (nm) => { onPick(nm.slice(0, 24)); setQ(''); };
  return html`<div class="col" style="gap:10px">
    <div style="display:flex;gap:12px"><input class="boxIn" type="text" aria-label="Counter name" placeholder="Search counters or name your own" maxlength="24" value=${q} onInput=${(e) => setQ(e.target.value)} onKeyDown=${(e) => { if (e.key === 'Enter' && term) add(list[0] || q.trim()); }} /></div>
    ${state === 'busy' && html`<div class="sub">SEARCHING CARDS…</div>`}
    ${state === 'offline' && !list.length && term && html`<div class="sub">${PREVIEW ? "THIS PREVIEW CAN'T REACH SCRYFALL." : "CAN'T REACH SCRYFALL."} KNOWN COUNTERS STILL SHOW.</div>`}
    ${list.map((c) => html`<button class="pickRow" onClick=${() => add(c)}><span class="col"><span>${c.toUpperCase()} COUNTER</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>`)}
    ${term && !exact && html`<button class="pickRow" onClick=${() => add(q.trim())}><span class="col"><span style="color:var(--gold)">ADD "${q.trim().toUpperCase()}"</span><span>CUSTOM COUNTER</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>`}
  </div>`;
}

// Commander search against Scryfall (the MTG card database), limited to cards that can be your commander.
// Falls back to the typed name when Scryfall can't be reached.
const cardArt = (c) => {
  const iu = c.image_uris || (c.card_faces && c.card_faces[0] && c.card_faces[0].image_uris) || {};
  return { name: c.name, art: iu.art_crop || '', image: iu.normal || iu.large || '' };
};
function CmdrSearch({ onPick, onRemove }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState([]);
  const [state, setState] = useState('idle'); // idle | busy | done | none | offline
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); setState('idle'); return; }
    let live = true;
    setState('busy');
    const t = setTimeout(async () => {
      try {
        const r = await fetch('https://api.scryfall.com/cards/search?order=edhrec&unique=cards&q=' + encodeURIComponent(`is:commander ${term}`));
        if (r.status === 404) { if (live) { setHits([]); setState('none'); } return; }
        const j = await r.json();
        if (live) { setHits((j.data || []).slice(0, 8).map(cardArt)); setState('done'); }
      } catch { if (live) { setHits([]); setState('offline'); } }
    }, 250);
    return () => { live = false; clearTimeout(t); };
  }, [q]);
  const useTyped = async () => {
    const name = q.trim();
    if (!name) return;
    try {
      const r = await fetch('https://api.scryfall.com/cards/named?fuzzy=' + encodeURIComponent(name));
      if (r.ok) return onPick(cardArt(await r.json()));
    } catch {}
    onPick({ name });
  };
  const msg = { busy: 'SEARCHING SCRYFALL…', none: 'NO COMMANDERS MATCH', offline: PREVIEW ? "THIS PREVIEW CAN'T REACH SCRYFALL. THE LIVE APP SEARCHES IT AS YOU TYPE." : "CAN'T REACH SCRYFALL. USE ADDS THE NAME AS TYPED." }[state];
  return html`<div class="col" style="gap:12px;padding-top:16px">
    <div style="display:flex;gap:12px"><input class="boxIn" type="text" aria-label="Commander name" placeholder="Search commanders" value=${q} onInput=${(e) => setQ(e.target.value)} onKeyDown=${(e) => { if (e.key === 'Enter') hits[0] ? onPick(hits[0]) : useTyped(); }} />
      <button class="smallBtn" disabled=${!q.trim()} onClick=${useTyped}>USE</button></div>
    ${msg && html`<div class="sub">${msg}</div>`}
    ${hits.map((h) => html`<button class="pickRow" style="justify-content:flex-start" onClick=${() => onPick(h)}>
      <span class="art" style=${h.art ? { backgroundImage: `url("${h.art}")` } : null}>${h.art ? '' : 'ART'}</span>
      <span class="col" style="flex:1 1 0;min-width:0"><span style="font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.name.toUpperCase()}</span></span><${Chevron} /></button>`)}
    ${onRemove && html`<button class="textBtn" style="align-self:flex-start;color:var(--red-soft)" onClick=${onRemove}>REMOVE COMMANDER</button>`}
  </div>`;
}

// ---------- TV (port of /tv2: the table, everything upright) ----------
function Tv({ g }) {
  const now = useNow();
  const [page, setPage] = useState(0);
  const n = g.seats.length;
  const quads = quadsFor(n);
  useEffect(() => {
    const k = (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') setPage((p) => 1 - p); };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, []);
  const rem = remaining(g, now);
  const nextSeat = MTG.nextActive(g).seat;
  return html`<${Stage}><div class="tbl" style="position:relative;width:1586px;height:992px;overflow:hidden">
    ${page === 0 ? html`
      ${quads.map((q, i) => html`<${TvSeat} key=${i} g=${g} i=${i} q=${q} />`)}
      <${Motes} g=${g} quads=${quads} />
      ${n > 1 && html`<div style="position:absolute;left:793px;top:483px;width:300px;height:0;margin-left:-150px;z-index:12">
        <div style="position:absolute;left:-90px;right:-90px;bottom:42px;display:flex;justify-content:center"><span class="hubTag" style="color:var(--bright);font-size:15px;letter-spacing:0.11em">${MTG.seatLabel(g, g.active).toUpperCase()}'S TURN</span></div>
        <div style="position:absolute;left:0;right:0;top:-32px;height:63px;display:flex;justify-content:center">
          <div id="timerPlate" class=${rem !== null && rem <= 30 ? 'low' : ''}>${rem === null ? html`<span class="s">TURN ${g.round}</span>` : rem <= 0 ? html`<span class="s">TIME!</span>` : html`<span class="t">${fmt(rem)}</span>`}</div>
        </div>
        ${nextSeat !== g.active && html`<div style="position:absolute;left:-90px;right:-90px;top:44px;display:flex;justify-content:center"><span class="hubTag">NEXT · ${MTG.seatLabel(g, nextSeat).toUpperCase()}</span></div>`}
      </div>`}
    ` : html`<${TvCommanders} g=${g} />`}
  </div><//>`;
}
function TvSeat({ g, i, q }) {
  const s = g.seats[i];
  const prev = useRef(s.life);
  const ref = useRef(null);
  useEffect(() => {
    if (prev.current !== s.life && ref.current) { ref.current.classList.remove('bump'); void ref.current.offsetWidth; ref.current.classList.add('bump'); }
    prev.current = s.life;
  }, [s.life]);
  const active = g.seats.length > 1 && g.active === i && !s.out;
  const dead = MTG.isDead(g, i);
  const art = s.cmdrs[0] && (s.cmdrs[0].art || s.cmdrs[0].image);
  const chips = [];
  MTG.statusKinds(s).forEach((f) => { if (MTG.hasFlag(g, i, f.key)) chips.push(html`<div class="chip status"><em>${f.label}</em></div>`); });
  Object.entries(s.cmd).forEach(([j, v]) => {
    if (v <= 0 || !g.seats[j]) return;
    const o = g.seats[j];
    const oa = o.cmdrs[0] && (o.cmdrs[0].art || o.cmdrs[0].image);
    chips.push(html`<div class=${'chip withArt' + (v >= 21 ? ' lethal' : v >= 15 ? ' warn' : '')}><i style=${oa ? { backgroundImage: `url("${oa}")` } : null}></i><em>${MTG.seatLabel(g, +j).toUpperCase()}</em><b>${v}</b></div>`);
  });
  MTG.counterKinds(s).forEach((k) => {
    const v = s.ctr[k.key] || 0;
    if (v > 0) chips.push(html`<div class=${'chip' + (k.lethal && v >= k.lethal ? ' lethal' : '')}><em>${k.chip}</em><b>${v}</b></div>`);
  });
  if (g.settings.commander && s.tax > 0) chips.push(html`<div class="chip"><em>TAX</em><b>${s.tax}</b></div>`);
  const narrowTop = !q.wide;
  return html`<div class=${'seat tvSeat' + (active ? ' active' : '') + (dead ? ' dead' : '')} style=${`left:${q.x}px;top:${q.y}px;width:${q.w}px;height:${q.h}px`}>
    <div class="seatArt" style=${art ? { backgroundImage: `url("${art}")` } : null}></div>
    <div class="seatShade" aria-hidden="true"></div>
    <div class="activeGlow"></div>
    <div style=${`position:absolute;top:30px;${narrowTop ? 'left:44px;right:44px' : 'left:60px;width:520px'};display:flex;flex-direction:column;align-items:center;gap:2px;z-index:2`}>
      <div class="pName">${MTG.seatLabel(g, i).toUpperCase()}</div>
      <div class="cmdName" style="max-width:100%">${s.cmdrs.map((c) => c.name).join(' · ')}</div>
    </div>
    <div style="position:absolute;top:50%;left:0;right:0;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;z-index:2">
      <span class="lifeNum" ref=${ref}>${s.life}</span>
    </div>
    ${dead && html`<div class="deadTag" style="z-index:2">${s.out ? 'CONCEDED' : 'DEFEATED'}</div>`}
    <div class="chips" style=${`top:calc(50% + ${dead ? 136 : 112}px);z-index:2`}>${chips}</div>
    <div class="seatFrame frame9" aria-hidden="true"></div>
  </div>`;
}
function TvCommanders({ g }) {
  return html`<div style="position:absolute;inset:0">
    <div style="position:absolute;top:62px;right:0;left:0;text-align:center">
      <div style="font-size:27px;font-weight:700;letter-spacing:0.22em;color:var(--bright)">COMMANDERS</div>
      <div style="margin-top:10px;font-size:13px;letter-spacing:0.24em;color:var(--muted)">◀ ▶ ON THE REMOTE TO SWITCH PAGES</div>
    </div>
    <div class="cmdrRow">${g.seats.map((s, i) => {
      const c = s.cmdrs[0];
      const img = c && (c.image || c.art);
      const a = g.active === i;
      return html`<div class=${'cmdrCol' + (a ? ' active' : '')}><div class="cmdrCard">${img ? html`<img alt="" src=${img} />` : html`<div style="position:absolute;right:0;bottom:16px;left:0;text-align:center;font-size:10px;letter-spacing:0.18em;color:#5E574B">NO COMMANDER SET</div>`}</div>
        <div class="cn">${c ? c.name : '—'}</div><div class="pn">${MTG.seatLabel(g, i).toUpperCase()}${a ? ' · THEIR TURN' : ''}</div></div>`;
    })}</div>
  </div>`;
}
// soft gold motes, denser over the active seat (from tv2)
function Motes({ g, quads }) {
  const ref = useRef(null);
  const live = useRef({ g, quads });
  live.current = { g, quads };
  useEffect(() => {
    const cv = ref.current; if (!cv || !cv.getContext) return;
    if (/[?&]particles=off\b/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const motes = [];
    const spawn = (m, fresh) => {
      const { g: G, quads: Q } = live.current;
      const c = Q[G.active];
      if (c && G.seats.length > 1 && Math.random() < 0.45) { m.x = c.x + Math.random() * c.w; m.y = c.y + (fresh ? Math.random() : 0.75 + Math.random() * 0.25) * c.h; }
      else { m.x = Math.random() * 1586; m.y = fresh ? Math.random() * 992 : 992 + Math.random() * 40; }
      m.r = 0.8 + Math.random() * 2.2; m.vy = -(0.12 + Math.random() * 0.35); m.sw = Math.random() * 6.28; m.sws = 0.004 + Math.random() * 0.01;
      m.tw = Math.random() * 6.28; m.life = 0; m.max = 500 + Math.random() * 700; return m;
    };
    for (let k = 0; k < 46; k++) motes.push(spawn({}, true));
    const sprite = document.createElement('canvas'); sprite.width = sprite.height = 32;
    const sg = sprite.getContext('2d');
    const gr = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.25, 'rgba(232,201,106,0.55)'); gr.addColorStop(1, 'rgba(201,162,39,0)');
    sg.fillStyle = gr; sg.fillRect(0, 0, 32, 32);
    let last = 0, raf;
    const frame = (ts) => {
      raf = requestAnimationFrame(frame);
      if (ts - last < 32 || document.hidden) return;
      const dt = Math.min((ts - last) / 16.7, 3); last = ts;
      ctx.clearRect(0, 0, 1586, 992); ctx.globalCompositeOperation = 'lighter';
      for (const m of motes) {
        m.life += dt; m.sw += m.sws * dt; m.tw += 0.05 * dt; m.y += m.vy * dt; m.x += Math.sin(m.sw) * 0.25 * dt;
        const fade = Math.min(1, m.life / 60, (m.max - m.life) / 90);
        if (fade <= 0 || m.y < -20) { spawn(m, false); continue; }
        const s = m.r * 6;
        ctx.globalAlpha = Math.max(0, Math.min(1, fade * (0.35 + 0.35 * Math.sin(m.tw)) + 0.05));
        ctx.drawImage(sprite, m.x - s / 2, m.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  return html`<canvas ref=${ref} width="1586" height="992" style="position:absolute;inset:0;z-index:7;pointer-events:none"></canvas>`;
}

// TV entry: type the code with the remote, or arrive with /v1/tv#/tv/CODE
function TvEntry({ initial }) {
  const st = useStore();
  const [code, setCode] = useState((initial || '').toUpperCase());
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [needPw, setNeedPw] = useState(false);
  const tried = useRef(false);
  const connect = async (c = code) => {
    if (c.length !== 6) { setErr('ENTER THE 6-CHARACTER CODE'); return; }
    if (PREVIEW) { setErr('THE TV CONNECTS TO GAMES ON THE LIVE APP'); return; }
    setErr('');
    const e = await joinGame(c, pw, 'tv');
    if (e) { setErr(e); if (/PASSWORD/.test(e)) setNeedPw(true); }
  };
  useEffect(() => { if (initial && initial.length === 6 && !tried.current) { tried.current = true; connect(initial.toUpperCase()); } }, []);
  if (st.game && (st.role === 'tv' || st.role === 'spectator')) return html`<${Tv} g=${st.game} />`;
  return html`<${Stage}><div class="tbl screen" style="width:1586px;height:992px">
    <div class="tblBlur" aria-hidden="true"></div>
    <${Title} sub="TV DISPLAY" />
    <div class="card mgrCard frame9"><div class="cardBody">
      <div class="col ruled" style="gap:14px;padding:14px 0 22px">
        <label class="lbl" for="tvcode">GAME CODE</label>
        <input id="tvcode" class="field code" maxlength="6" autocomplete="off" placeholder="ABC123" value=${code} onInput=${(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} onKeyDown=${(e) => { if (e.key === 'Enter') connect(); }} />
        <span class="sub">THE CODE IS IN THE MENU UNDER TV DISPLAY OR HOSTED GAME</span>
      </div>
      ${needPw && html`<div class="col ruled" style="gap:14px;padding:14px 0 22px"><label class="lbl" for="tvpw">PASSWORD</label><input id="tvpw" class="field text" type="password" value=${pw} onInput=${(e) => setPw(e.target.value)} onKeyDown=${(e) => { if (e.key === 'Enter') connect(); }} /></div>`}
      <div class="err" style="padding-top:8px">${err}</div>
      <button class="goldBtn goldTex" onClick=${() => connect()}>SHOW GAME</button>
      <div style="height:12px"></div>
    </div></div>
  </div><//>`;
}

function Watch() {
  const st = useStore();
  if (!st.game) return html`<${Waiting} text="CONNECTING…" />`;
  return html`<div><${Tv} g=${st.game} /><button class="flatLink back" style="position:fixed;top:8px;left:8px;width:auto;min-height:44px;z-index:50;background:rgba(8,8,10,0.6);border-radius:8px;padding:0 12px" onClick=${leaveGame}><${Chevron} left />LEAVE</button></div>`;
}

// preview only: flip between the tablet and what the TV would show
function PreviewBar() {
  return html`<button class="flatLink" style="position:absolute;left:50%;bottom:-2px;transform:translateX(-50%);width:auto;min-height:40px;z-index:40;padding:0 16px;background:rgba(8,8,10,0.8);border:1px solid var(--edge);border-radius:8px 8px 0 0;font-size:12px" onClick=${() => set({ tvMirror: true })}>SHOW TV VIEW</button>`;
}
function PreviewTv() {
  const st = useStore();
  return html`<div><${Tv} g=${st.game} /><button class="flatLink back" style="position:fixed;top:8px;left:8px;width:auto;min-height:44px;z-index:50;background:rgba(8,8,10,0.75);border:1px solid var(--edge);border-radius:8px;padding:0 14px;font-size:13px" onClick=${() => set({ tvMirror: false })}><${Chevron} left />BACK TO TABLET</button></div>`;
}

// ---------- root ----------
function App() {
  const st = useStore();
  const r = st.route;
  let view;
  if (IS_TV || r.name === 'tv') view = html`<${TvEntry} initial=${r.arg} />`;
  else if (st.tvMirror && st.game) view = html`<${PreviewTv} />`;
  else if (r.name === 'game' && st.game) view = st.role === 'player' ? html`<${PlayerView} />` : html`<${Table} />`;
  else if (r.name === 'watch') view = html`<${Watch} />`;
  else if (r.name === 'host') view = html`<${Host} />`;
  else if (r.name === 'join') view = html`<${Join} initial=${r.arg} />`;
  else if (st.game && (st.role === 'local' || st.role === 'host')) view = html`<${Table} />`;
  else view = html`<${Setup} />`;
  return html`${view}<div id="toast" class=${st.toast ? 'show' : ''} role="status">${st.toast}</div>`;
}
// a saved game reopens on the table
if (S.game && (S.role === 'local' || S.role === 'host') && S.route.name === 'setup' && !location.hash) S.route = { name: 'game', arg: '' };

render(html`<${App} />`, document.getElementById('app'));

// keep the screen awake during a game (tablet + TV)
async function keepAwake() { try { const wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => setTimeout(keepAwake, 1500)); } catch {} }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keepAwake(); });
keepAwake();
if (IS_TV) {
  let t; const wake = () => { document.body.classList.remove('hideCursor'); clearTimeout(t); t = setTimeout(() => document.body.classList.add('hideCursor'), 2500); };
  document.addEventListener('mousemove', wake); wake();
}
window.__mtg = { S, set, dispatch, MTG };
