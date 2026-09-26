// /tv2 — upright TV display of the tablet table view + commanders page, with timer plate and light particles
(() => {
  const $ = (id) => document.getElementById(id);
  let store; try { store = window.localStorage; } catch { store = { getItem: () => null, setItem: () => {} }; }
  const Q = location.search;

  // ---------- fill-the-screen scaling (same as /tablet) ----------
  const stage = $('stage');
  const FIT_CONTAIN = /[?&]fit=contain\b/.test(Q);
  let stageScaleX = 1;
  function rescale() {
    const vw = (window.visualViewport && window.visualViewport.width) || innerWidth;
    const vh = (window.visualViewport && window.visualViewport.height) || innerHeight;
    let sx = vw / 1586, sy = vh / 992;
    if (FIT_CONTAIN) sx = sy = Math.min(sx, sy);
    stageScaleX = sx;
    stage.style.transform = `scale(${sx}, ${sy})`;
    stage.style.left = `${(vw - 1586 * sx) / 2}px`;
    stage.style.top = `${(vh - 992 * sy) / 2}px`;
  }
  addEventListener('resize', rescale);
  addEventListener('orientationchange', () => setTimeout(rescale, 250));
  document.addEventListener('fullscreenchange', () => setTimeout(rescale, 100));
  if (window.visualViewport) window.visualViewport.addEventListener('resize', rescale);
  rescale();

  // ---------- 2-page loop carousel: table <-> commanders (swipe or remote arrows) ----------
  const W = 1586;
  const pages = Array.from(document.querySelectorAll('#strip > .screenpage'));
  const N = pages.length;
  let page = 0, animating = false;
  const EASE = 'transform 0.34s cubic-bezier(0.22, 0.7, 0.2, 1)';
  // with only 2 pages the "other" page sits on whichever side we're moving toward
  let side = -1;
  function place(offset, animate) {
    if (offset > 0) side = -1; else if (offset < 0) side = 1;
    pages.forEach((el, i) => {
      const x = i === page ? offset : offset + side * W;
      el.style.transition = animate ? EASE : 'none';
      el.style.visibility = 'visible';
      el.style.transform = `translateX(${x}px)`;
    });
  }
  function finish(dir) {
    animating = true;
    place(dir > 0 ? W : -W, true);
    setTimeout(() => { page = (page + 1) % N; place(0, false); animating = false; }, 350);
  }
  function go(dir) {
    if (animating) return;
    place(dir > 0 ? 0.001 : -0.001, false); // park the other page on the correct side first
    void pages[0].offsetWidth;
    finish(dir);
  }
  place(0, false);

  let sx0 = null, sy0 = null, t0 = 0, axis = null, dragX = 0;
  document.addEventListener('touchstart', (e) => {
    if (animating || e.touches.length !== 1) { sx0 = null; return; }
    sx0 = e.touches[0].clientX; sy0 = e.touches[0].clientY; t0 = Date.now(); axis = null; dragX = 0;
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (sx0 === null) return;
    const dx = e.touches[0].clientX - sx0, dy = e.touches[0].clientY - sy0;
    if (!axis && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (axis !== 'x') return;
    dragX = dx / (stageScaleX || 1);
    place(dragX, false);
  }, { passive: true });
  function endDrag() {
    if (sx0 === null) return;
    sx0 = null;
    if (axis !== 'x') return;
    const speed = Math.abs(dragX) / Math.max(Date.now() - t0, 1);
    if (Math.abs(dragX) > W * 0.18 || (speed > 0.6 && Math.abs(dragX) > 40)) finish(dragX > 0 ? 1 : -1);
    else place(0, true);
  }
  document.addEventListener('touchend', endDrag, { passive: true });
  document.addEventListener('touchcancel', endDrag, { passive: true });

  // mouse drag too (for a laptop / Chromecast-with-mouse)
  let mx0 = null;
  document.addEventListener('mousedown', (e) => { if (!animating) { mx0 = e.clientX; t0 = Date.now(); } });
  document.addEventListener('mousemove', (e) => { if (mx0 !== null && e.buttons) { dragX = (e.clientX - mx0) / (stageScaleX || 1); place(dragX, false); } });
  document.addEventListener('mouseup', () => {
    if (mx0 === null) return; mx0 = null;
    if (Math.abs(dragX) > W * 0.18) finish(dragX > 0 ? 1 : -1); else if (dragX) place(0, true);
    dragX = 0;
  });

  // seat rotation lives on this device (OK / Enter on the remote rotates, or ?seat=N)
  let seatOffset = parseInt((Q.match(/[?&]seat=(\d+)/) || [])[1] || store.getItem('tv2SeatOffset') || '0', 10);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'Enter' || e.key === ' ') {
      seatOffset = (seatOffset + 1) % Math.max(game.turnOrder.length, 1);
      store.setItem('tv2SeatOffset', String(seatOffset));
      render();
    }
  });
  window.__tv2Page = () => page;

  // ---------- connection (display only: no PIN, no actions) ----------
  let ws, wsOk = false, reconnectDelay = 500, clockOffset = 0;
  let game = { players: {}, turnOrder: [], activeIdx: 0, turnNumber: 1, timer: { votes: [], pendingSeconds: 0, running: false, endsAt: 0, duration: 300 } };
  if ($('joinUrl')) $('joinUrl').textContent = location.origin.replace(/^https?:\/\//, '');
  try { if (window.QRCode) new QRCode($('qr'), { text: location.origin, width: 190, height: 190 }); } catch {}

  function connect() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(`${proto}://${location.host}`);
    ws.onopen = () => { wsOk = true; reconnectDelay = 500; $('connDot').classList.add('on'); ws.send(JSON.stringify({ type: 'hello' })); };
    ws.onclose = () => {
      wsOk = false; $('connDot').classList.remove('on');
      setTimeout(connect, reconnectDelay); reconnectDelay = Math.min(reconnectDelay * 2, 5000);
    };
    ws.onmessage = (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.type === 'welcome' || msg.type === 'state') {
        game = msg.state;
        if (game.now) clockOffset = game.now - Date.now();
        render();
      }
    };
  }

  const fmt = (s) => `${Math.floor(Math.max(s, 0) / 60)}:${String(Math.max(s, 0) % 60).padStart(2, '0')}`;
  const activeId = () => game.turnOrder[game.activeIdx];
  const cssUrl = (u) => `url("${String(u).replace(/'/g, '%27').replace(/["\\\n]/g, (c) => '\\' + c)}")`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function cellPlayers() {
    const ids = game.turnOrder, n = ids.length, cells = [null, null, null, null];
    for (let i = 0; i < Math.min(n, 4); i++) cells[i] = ids[(i + seatOffset) % n];
    return cells;
  }

  const seatEls = Array.from(document.querySelectorAll('.seat')).sort((a, b) => a.dataset.cell - b.dataset.cell);
  let activeCell = -1;
  const lastLife = {};

  function render() {
    const cells = cellPlayers();
    $('joinOv').classList.toggle('open', game.turnOrder.length === 0);
    const act = activeId();
    activeCell = -1;
    seatEls.forEach((el, cell) => {
      const id = cells[cell];
      const p = id ? game.players[id] : null;
      el.querySelector('.cmdName').textContent = p && p.commander ? p.commander.name : '';
      el.querySelector('.pName').textContent = p ? p.name.toUpperCase() : '';
      const lv = el.querySelector('.lifeVal');
      const life = p ? String(p.life) : '';
      if (lv.textContent !== life) {
        lv.textContent = life;
        if (id && lastLife[id] !== undefined) { lv.classList.remove('bump'); void lv.offsetWidth; lv.classList.add('bump'); }
      }
      if (id && p) lastLife[id] = p.life;
      const artUrl = p && p.commander && (p.commander.art || p.commander.image);
      el.querySelector('.seatArt').style.backgroundImage = artUrl ? cssUrl(artUrl) : 'none';
      el.style.opacity = p ? '1' : '0.55';
      const isActive = !!id && id === act;
      el.classList.toggle('active', isActive);
      if (isActive) activeCell = cell;
      const dead = !!p && (p.life <= 0 || Object.values(p.cmdDamage || {}).some((d) => d >= 21));
      el.classList.toggle('dead', dead);
    });
    renderHub();
    renderCommanders();
  }

  function renderHub() {
    const act = game.players[activeId()];
    $('turnLabel').textContent = act ? `${act.name.toUpperCase()}'S TURN` : "PLAYER'S TURN";
    const n = game.turnOrder.length;
    const nxt = n > 1 ? game.players[game.turnOrder[(game.activeIdx + 1) % n]] : null;
    $('nextLabel').textContent = nxt ? `NEXT · ${nxt.name.toUpperCase()}` : '';
    const plate = $('timerPlate');
    const t = game.timer || {};
    let html, low = false;
    if (t.running) {
      const rem = Math.round((t.endsAt - (Date.now() + clockOffset)) / 1000);
      html = rem <= 0 ? '<span class="s">TIME!</span>' : `<span class="t">${fmt(rem)}</span>`;
      low = rem <= 30;
    } else if (t.votes && t.votes.length) {
      html = `<span class="s">VOTE ${t.votes.length}/${Math.floor(n / 2) + 1}</span>`;
    } else {
      html = `<span class="s">TURN ${game.turnNumber || 1}</span>`;
    }
    if (plate.innerHTML !== html) plate.innerHTML = html;
    plate.classList.toggle('low', low);
  }
  setInterval(() => { if (game.timer && game.timer.running) renderHub(); }, 250);

  let cmdrKey = '';
  function renderCommanders() {
    const row = $('cmdrRow');
    const ids = game.turnOrder.filter((id) => game.players[id]);
    const key = ids.map((id) => { const p = game.players[id]; return `${id}:${p.name}:${p.commander ? p.commander.name + p.commander.image + p.commander.art : ''}`; }).join('|') + '#' + activeId();
    if (key === cmdrKey) return;
    cmdrKey = key;
    if (!ids.length) { row.innerHTML = '<div style="margin-top: 200px; font-size: 14px; letter-spacing: 0.2em; color: #5E574B;">NO PLAYERS YET</div>'; return; }
    row.innerHTML = ids.map((id) => {
      const p = game.players[id];
      const img = p.commander && (p.commander.image || p.commander.art);
      const a = id === activeId();
      return `<div class="cmdrCol${a ? ' active' : ''}"><div class="cmdrCard">${img ? `<img alt="" src="${esc(img)}">` : '<div style="position:absolute;right:0;bottom:16px;left:0;text-align:center;font-size:10px;letter-spacing:0.18em;color:#5E574B;">NO COMMANDER SET</div>'}</div>` +
        `<div class="cn">${esc(p.commander ? p.commander.name : '—')}</div>` +
        `<div class="pn">${esc(p.name.toUpperCase())}${a ? ' · THEIR TURN' : ''}</div></div>`;
    }).join('');
  }

  // ---------- light particles: soft gold motes, denser over the active seat ----------
  const PARTICLES = !/[?&]particles=off\b/.test(Q);
  const cv = $('motes');
  if (!PARTICLES && cv) cv.style.display = 'none';
  if (PARTICLES && cv && cv.getContext && cv.getContext('2d')) {
    const ctx = cv.getContext('2d');
    const CELLS = [[20, 494, 766, 478], [804, 494, 762, 478], [804, 20, 762, 457], [20, 20, 766, 457]];
    const COUNT = 46;
    const motes = [];
    function spawn(m, fresh) {
      const biased = activeCell >= 0 && Math.random() < 0.45;
      if (biased) { const c = CELLS[activeCell]; m.x = c[0] + Math.random() * c[2]; m.y = c[1] + (fresh ? Math.random() : 0.75 + Math.random() * 0.25) * c[3]; }
      else { m.x = Math.random() * 1586; m.y = fresh ? Math.random() * 992 : 992 + Math.random() * 40; }
      m.r = 0.8 + Math.random() * 2.2;
      m.vy = -(0.12 + Math.random() * 0.35);
      m.sw = Math.random() * Math.PI * 2;
      m.sws = 0.004 + Math.random() * 0.01;
      m.tw = Math.random() * Math.PI * 2;
      m.life = 0; m.max = 500 + Math.random() * 700;
      m.warm = Math.random();
      return m;
    }
    for (let i = 0; i < COUNT; i++) motes.push(spawn({}, true));
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 32;
    const sg = sprite.getContext('2d');
    if (sg) {
      const g = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(255,240,200,1)');
      g.addColorStop(0.25, 'rgba(232,201,106,0.55)');
      g.addColorStop(1, 'rgba(201,162,39,0)');
      sg.fillStyle = g; sg.fillRect(0, 0, 32, 32);
    }
    let last = 0;
    function frame(ts) {
      requestAnimationFrame(frame);
      if (ts - last < 32 || document.hidden || page !== 0 && !animating) return; // ~30fps, only when table is visible
      const dt = Math.min((ts - last) / 16.7, 3); last = ts;
      ctx.clearRect(0, 0, 1586, 992);
      ctx.globalCompositeOperation = 'lighter';
      for (const m of motes) {
        m.life += dt; m.sw += m.sws * dt; m.tw += 0.05 * dt;
        m.y += m.vy * dt; m.x += Math.sin(m.sw) * 0.25 * dt;
        const fade = Math.min(1, m.life / 60, (m.max - m.life) / 90);
        if (fade <= 0 || m.y < -20) { spawn(m, false); continue; }
        const a = fade * (0.35 + 0.35 * Math.sin(m.tw)) + 0.05;
        const s = m.r * 6;
        ctx.globalAlpha = Math.max(0, Math.min(1, a));
        ctx.drawImage(sprite, m.x - s / 2, m.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(frame);
  }

  // ---------- keep the TV awake ----------
  async function keepAwake() {
    try { const wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => setTimeout(keepAwake, 1000)); } catch {}
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keepAwake(); });
  keepAwake();
  try {
    const c2 = document.createElement('canvas'); c2.width = c2.height = 2;
    const x2 = c2.getContext('2d'); let tick = 0;
    setInterval(() => { x2.fillStyle = tick++ % 2 ? '#000' : '#010101'; x2.fillRect(0, 0, 2, 2); }, 1000);
    const v = document.createElement('video');
    v.srcObject = c2.captureStream(1); v.muted = true; v.setAttribute('playsinline', '');
    v.style.cssText = 'position:absolute;width:2px;height:2px;opacity:0.01;pointer-events:none;';
    document.body.appendChild(v);
    const tryPlay = () => v.play().catch(() => setTimeout(tryPlay, 3000));
    tryPlay();
  } catch {}

  window.__tv2 = { render, get game() { return game; }, set game(g) { game = g; } };
  try { connect(); } catch {}
})();
