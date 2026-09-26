(() => {
  const $ = (id) => document.getElementById(id);
  const on = (id, ev, fn) => { const el = $(id); if (el) el.addEventListener(ev, fn); };
  const store = window.localStorage;

  // ---------- fixed-canvas scaling (brief section 2) ----------
  const stage = $('stage');
  // default: fill the tablet edge-to-edge (independent x/y scale, whole canvas stretches together
  // so the frame art stays aligned). ?fit=contain restores exact-proportion letterboxing.
  let stageScaleX = 1;
  const FIT_CONTAIN = /[?&]fit=contain\b/.test(location.search);
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

  // ---------- four screens on a true loop: table -> mana -> tokens -> commanders -> table ----------
  // Finger moving LEFT-TO-RIGHT drags the current page right and pulls the next page in from the left.
  // Only the current page and its two neighbours are ever positioned, so every move is exactly one page.
  const W = 1586;
  const pages = Array.from(document.querySelectorAll('#strip > .screenpage'));
  const N = pages.length;
  let page = 0, animating = false;
  const EASE = 'transform 0.34s cubic-bezier(0.22, 0.7, 0.2, 1)';

  function place(offset, animate) {
    pages.forEach((el, i) => {
      let x;
      if (i === page) x = offset;
      else if (i === (page + 1) % N) x = offset - W;       // next page waits on the left
      else if (i === (page - 1 + N) % N) x = offset + W;   // previous page waits on the right
      else x = null;
      el.style.transition = animate ? EASE : 'none';
      if (x === null) { el.style.visibility = 'hidden'; el.style.transform = `translateX(${2 * W}px)`; }
      else { el.style.visibility = 'visible'; el.style.transform = `translateX(${x}px)`; }
    });
  }
  function finish(dir) {
    // slide the current page off (right for next, left for previous), then re-seat the loop
    animating = true;
    place(dir > 0 ? W : -W, true);
    setTimeout(() => {
      page = (page + dir + N) % N;
      place(0, false);
      animating = false;
    }, 350);
  }
  function go(dir) { if (animating) return; place(0, false); void pages[0].offsetWidth; finish(dir); }
  place(0, false);

  const blocking = () =>
    ['menuSheet', 'cmdSheet', 'tokSearch', 'cardZoom', 'ctrSheet'].some((id) => $(id) && $(id).classList.contains('open')) ||
    (document.activeElement && document.activeElement.tagName === 'INPUT');

  let sx0 = null, sy0 = null, t0 = 0, axis = null, dragX = 0;
  document.addEventListener('touchstart', (e) => {
    if (animating || e.touches.length !== 1 || blocking()) { sx0 = null; return; }
    if (e.target.closest && e.target.closest('button, input')) { sx0 = null; return; } // don't drag while pressing controls
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
    const speed = Math.abs(dragX) / Math.max(Date.now() - t0, 1); // stage px per ms
    if (Math.abs(dragX) > W * 0.18 || (speed > 0.6 && Math.abs(dragX) > 40)) finish(dragX > 0 ? 1 : -1);
    else place(0, true); // not far enough: spring back
  }
  document.addEventListener('touchend', endDrag, { passive: true });
  document.addEventListener('touchcancel', endDrag, { passive: true });
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') go(1);   // same as a left-to-right swipe
    if (e.key === 'ArrowLeft') go(-1);
  });
  window.__tabletPage = () => page;

  // ---------- shared game connection ----------
  let ws, wsOk = false, reconnectDelay = 500;
  let game = { players: {}, turnOrder: [], activeIdx: 0, turnNumber: 1, timer: { votes: [], pendingSeconds: 0, running: false, endsAt: 0, duration: 300 } };
  let clockOffset = 0;
  let masterPin = store.getItem('masterPin') || null;
  let seatOffset = parseInt(store.getItem('seatOffset') || '0', 10);
  let openCmdCell = null;

  const joinUrl = location.origin.replace(/^https?:\/\//, '');
  $('joinUrl').textContent = joinUrl;
  if (window.QRCode) new QRCode($('qr'), { text: location.origin, width: 170, height: 170 });

  function connect() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(`${proto}://${location.host}`);
    ws.onopen = () => {
      wsOk = true; reconnectDelay = 500;
      $('connDot').classList.add('on');
      ws.send(JSON.stringify({ type: 'hello' }));
    };
    ws.onclose = () => {
      wsOk = false;
      $('connDot').classList.remove('on');
      setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, 5000);
    };
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'welcome' || msg.type === 'state') {
        game = msg.state;
        if (game.now) clockOffset = game.now - Date.now();
        render();
      } else if (msg.type === 'masterFail') {
        masterPin = null; store.removeItem('masterPin');
        toast('WRONG PIN');
      }
    };
  }
  const sendMsg = (o) => { if (wsOk) ws.send(JSON.stringify(o)); };

  let toastTimer;
  function toast(t) {
    const el = $('toast');
    el.textContent = t;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function mAct(action, extra = {}) {
    if (!masterPin) {
      const pin = prompt('Enter the master PIN to activate the table:');
      if (!pin) return false;
      masterPin = pin;
      store.setItem('masterPin', pin);
    }
    sendMsg({ type: 'master', pin: masterPin, action, ...extra });
    return true;
  }

  const fmt = (s) => `${Math.floor(Math.max(s, 0) / 60)}:${String(Math.max(s, 0) % 60).padStart(2, '0')}`;
  const activeId = () => game.turnOrder[game.activeIdx];
  const cssUrl = (u) => `url("${String(u).replace(/'/g, '%27').replace(/["\\\n]/g, (c) => '\\' + c)}")`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // cell order 0=BL 1=BR 2=TR 3=TL, turn order counter-clockwise from bottom-left
  function cellPlayers() {
    const ids = game.turnOrder;
    const n = ids.length;
    const cells = [null, null, null, null];
    for (let i = 0; i < Math.min(n, 4); i++) cells[i] = ids[(i + seatOffset) % n];
    return cells;
  }

  // ---------- table screen wiring ----------
  const seatEls = Array.from(document.querySelectorAll('.seat'));
  seatEls.sort((a, b) => Number(a.dataset.cell) - Number(b.dataset.cell));

  function holdable(el, fn) {
    let holdT = null, repT = null;
    const stop = () => { clearTimeout(holdT); clearInterval(repT); holdT = repT = null; };
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      fn();
      holdT = setTimeout(() => { repT = setInterval(fn, 150); }, 480);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, stop));
    ['pointerup', 'pointercancel'].forEach((ev) => document.addEventListener(ev, stop));
  }

  seatEls.forEach((el, cell) => {
    const pid = () => cellPlayers()[cell];
    holdable(el.querySelector('.m1'), () => { const id = pid(); if (id) mAct('life', { targetId: id, delta: -1 }); });
    holdable(el.querySelector('.p1'), () => { const id = pid(); if (id) mAct('life', { targetId: id, delta: 1 }); });
    el.querySelector('.m5').addEventListener('click', () => { const id = pid(); if (id) mAct('life', { targetId: id, delta: -5 }); });
    el.querySelector('.p5').addEventListener('click', () => { const id = pid(); if (id) mAct('life', { targetId: id, delta: 5 }); });
    el.querySelector('.cmdBtn').addEventListener('click', () => { if (pid()) { openCmdCell = cell; render(); if ($('cmdSheet')) $('cmdSheet').classList.add('open'); } });
    el.querySelector('.cmdDone').addEventListener('click', () => { openCmdCell = null; render(); });

    // player name commit
    const pn = el.querySelector('.pName');
    pn.addEventListener('change', () => {
      const id = pid();
      const v = pn.value.trim();
      if (id && v) mAct('rename', { targetId: id, name: v });
    });

    // commander name commit -> Scryfall lookup, keep both copies in sync
    const cA = el.querySelector('.cmdA');
    const cB = el.querySelector('.cmdB');
    const sync = (from, to) => from.addEventListener('input', () => { to.value = from.value; });
    sync(cA, cB); sync(cB, cA);
    const commit = async (inp) => {
      const id = pid();
      const v = inp.value.trim();
      if (!id || !v) return;
      let commander = { name: v, art: '', image: '' };
      try {
        const r = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(v)}`);
        if (r.ok) {
          const card = await r.json();
          const uris = card.image_uris || (card.card_faces && card.card_faces[0].image_uris) || {};
          commander = { name: card.name, art: uris.art_crop || '', image: uris.normal || '' };
        }
      } catch {}
      mAct('setCommander', { targetId: id, commander });
    };
    cA.addEventListener('change', () => commit(cA));
    cB.addEventListener('change', () => commit(cB));
  });

  // End Turn: press-down animation + vibration so it feels like a physical button
  (() => {
    const b = $('endTurn');
    if (!b) return;
    const down = () => { b.classList.add('pressed'); try { navigator.vibrate && navigator.vibrate(18); } catch {} };
    const up = () => b.classList.remove('pressed');
    b.addEventListener('pointerdown', down);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, up));
    b.addEventListener('click', () => {
      try { navigator.vibrate && navigator.vibrate([12, 40, 28]); } catch {}
      b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash');
      mAct('endTurn');
    });
  })();

  function setInput(inp, val) {
    if (document.activeElement !== inp && inp.value !== val) inp.value = val;
  }

  function render() {
    const cells = cellPlayers();
    $('joinOv').classList.toggle('open', game.turnOrder.length === 0);

    seatEls.forEach((el, cell) => {
      const id = cells[cell];
      const p = id ? game.players[id] : null;
      setInput(el.querySelector('.cmdA'), p && p.commander ? p.commander.name : '');
      setInput(el.querySelector('.cmdB'), p && p.commander ? p.commander.name : '');
      setInput(el.querySelector('.pName'), p ? p.name : '');
      el.querySelector('.lifeVal').textContent = p ? p.life : '';
      const artUrl = p && p.commander && (p.commander.art || p.commander.image);
      el.querySelector('.seatArt').style.backgroundImage = artUrl ? cssUrl(artUrl) : 'none';
      el.style.opacity = p ? '1' : '0.55';

      el.querySelector('.cmdOv').style.display = 'none';
    });

    const act = game.players[activeId()];
    renderTurnLabel(act);
    renderCmdWindow();
    onTurnMaybeChanged();
    renderCommanders();
  }

  // ---------- commander damage window ----------
  function closeCmd() { openCmdCell = null; if ($('cmdSheet')) $('cmdSheet').classList.remove('open'); if ($('cmdList')) $('cmdList').dataset.key = ''; }
  on('cmdDoneBtn', 'click', closeCmd);
  on('cmdSheet', 'click', (e) => { if (e.target.id === 'cmdSheet') closeCmd(); });

  function renderCmdWindow() {
    if (openCmdCell === null || !$('cmdSheet')) return;
    const id = cellPlayers()[openCmdCell];
    const p = id ? game.players[id] : null;
    if (!p) { closeCmd(); return; }
    $('cmdCard').classList.toggle('flip', openCmdCell >= 2); // top seats read it from across the table
    $('cmdTitle').textContent = `COMMANDER DAMAGE \u2014 ${p.name.toUpperCase()}`;
    const list = $('cmdList');
    const opps = game.turnOrder.filter((oid) => oid !== id && game.players[oid]);
    const key = `${openCmdCell}|${id}|${opps.join(',')}`;
    if (list.dataset.key !== key) {
      list.dataset.key = key;
      list.innerHTML = '';
      opps.forEach((oid) => {
        const o = game.players[oid];
        const art = o.commander && (o.commander.art || o.commander.image);
        const row = document.createElement('div');
        row.className = 'cdRow2';
        row.dataset.from = oid;
        row.innerHTML =
          `<div class="thumb"></div>` +
          `<div class="who"><div class="pl">${esc(o.name)}</div><div class="cm">${esc(o.commander ? o.commander.name : '')}</div></div>` +
          `<button type="button" class="dm" aria-label="Remove one damage">&minus;</button>` +
          `<b>0</b>` +
          `<button type="button" class="dp" aria-label="Add one damage">+</button>`;
        if (art) row.querySelector('.thumb').style.backgroundImage = cssUrl(art);
        holdable(row.querySelector('.dm'), () => mAct('cmdDamage', { targetId: id, fromId: oid, delta: -1 }));
        holdable(row.querySelector('.dp'), () => mAct('cmdDamage', { targetId: id, fromId: oid, delta: 1 }));
        list.appendChild(row);
      });
    }
    list.querySelectorAll('.cdRow2').forEach((row) => {
      const d = (p.cmdDamage && p.cmdDamage[row.dataset.from]) || 0;
      const b = row.querySelector('b');
      b.textContent = d;
      b.classList.toggle('lethal', d >= 21);
      row.classList.toggle('lethal', d >= 21);
    });
    if (!list.children.length) list.innerHTML = '<div style="text-align:center;color:#5E574B;font-size:13px;letter-spacing:0.14em;">NO OPPONENTS YET</div>';
  }

  // ---------- turn change: empty mana, show next player's tokens ----------
  let lastTurnKey = null;
  function onTurnMaybeChanged() {
    const key = `${game.turnNumber}:${game.activeIdx}:${activeId() || ''}`;
    if (lastTurnKey === null) { lastTurnKey = key; renderMana(); renderTokens(); return; }
    if (key === lastTurnKey) return;
    lastTurnKey = key;
    emptyMana();
    renderTokens();
    // forget saved tokens for players who are no longer in the game
    if (game.turnOrder.length) {
      for (const k of Object.keys(tokensBy)) if (k !== '_table' && !game.players[k]) delete tokensBy[k];
      saveTokens();
    }
  }

  // ---------- commanders page ----------
  let cmdrKey = '';
  function renderCommanders() {
    const row = $('cmdrRow');
    if (!row) return;
    const ids = game.turnOrder.filter((id) => game.players[id]);
    const key = ids.map((id) => { const p = game.players[id]; return `${id}:${p.name}:${p.commander ? p.commander.name + p.commander.image + p.commander.art : ''}`; }).join('|') + '#' + activeId();
    if (key === cmdrKey) return;
    cmdrKey = key;
    row.innerHTML = '';
    if (!ids.length) { row.innerHTML = '<div style="margin-top: 200px; font-size: 14px; letter-spacing: 0.2em; color: #5E574B;">NO PLAYERS YET</div>'; return; }
    ids.forEach((id) => {
      const p = game.players[id];
      const img = p.commander && (p.commander.image || p.commander.art);
      const col = document.createElement('div');
      col.className = 'cmdrCol' + (id === activeId() ? ' active' : '');
      col.innerHTML = `<div class="cmdrCard">${img ? `<img alt="" src="${esc(img)}">` : '<div style="position:absolute;right:0;bottom:16px;left:0;text-align:center;font-size:10px;letter-spacing:0.18em;color:#5E574B;">NO COMMANDER SET</div>'}</div>` +
        `<div class="cn">${esc(p.commander ? p.commander.name : '\u2014')}</div>` +
        `<div class="pn">${esc(p.name.toUpperCase())}${id === activeId() ? ' \u00B7 THEIR TURN' : ''}</div>`;
      col.addEventListener('click', () => {
        if (!img) return;
        $('zoomImg').src = p.commander.image || p.commander.art;
        $('zoomCap').textContent = `${p.name.toUpperCase()} \u00B7 TAP ANYWHERE TO CLOSE`;
        $('cardZoom').classList.add('open');
      });
      row.appendChild(col);
    });
  }
  on('cardZoom', 'click', () => $('cardZoom').classList.remove('open'));

  function renderTurnLabel(act) {
    act = act || game.players[activeId()];
    let text = act ? `${act.name.toUpperCase()}'S TURN` : "PLAYER'S TURN";
    const t = game.timer || {};
    if (t.running) {
      const rem = Math.round((t.endsAt - (Date.now() + clockOffset)) / 1000);
      text += rem <= 0 ? ' · TIME!' : ` · ${fmt(rem)}`;
    } else if (t.votes && t.votes.length > 0) {
      const majority = Math.floor(game.turnOrder.length / 2) + 1;
      text += ` · VOTE ${t.votes.length}/${majority}`;
    }
    $('turnLabel').textContent = text;
  }
  setInterval(() => { if (game.timer && (game.timer.running || (game.timer.votes || []).length)) renderTurnLabel(); }, 500);

  // ---------- menu ----------
  on('menuBtn', 'click', () => $('menuSheet').classList.add('open'));
  on('mClose', 'click', () => $('menuSheet').classList.remove('open'));
  on('mRotate', 'click', () => {
    seatOffset = (seatOffset + 1) % Math.max(game.turnOrder.length, 1);
    store.setItem('seatOffset', String(seatOffset));
    render();
  });
  on('mTimerStart', 'click', () => {
    const m = parseInt(prompt('Global timer — minutes per turn (1-10):', '5'), 10);
    if (m >= 1 && m <= 10) { mAct('timerStart', { seconds: m * 60 }); $('menuSheet').classList.remove('open'); }
  });
  on('mTimerStop', 'click', () => { mAct('timerStop'); $('menuSheet').classList.remove('open'); });
  on('mResetLife', 'click', () => { if (confirm('Reset everyone to 40 life?')) { mAct('resetLife'); $('menuSheet').classList.remove('open'); } });
  on('mNewGame', 'click', () => { if (confirm('Wipe ALL players and start a new game?')) { mAct('newGame'); $('menuSheet').classList.remove('open'); } });

  // ---------- mana screen (local to this device, persisted) ----------
  let mana = { w: 0, u: 0, b: 0, r: 0, g: 0, c: 0 };
  try { mana = Object.assign(mana, JSON.parse(store.getItem('tabletMana') || '{}')); } catch {}
  function saveMana() { store.setItem('tabletMana', JSON.stringify(mana)); }
  function emptyMana() { mana = { w: 0, u: 0, b: 0, r: 0, g: 0, c: 0 }; saveMana(); renderMana(); }
  function renderMana() {
    const ap = game.players[activeId()];
    if ($('manaSub')) $('manaSub').textContent = (ap ? ap.name.toUpperCase() + ' \u00B7 ' : '') + 'TAP A SYMBOL TO ADD \u00B7 MINUS TO SPEND';
    let total = 0;
    document.querySelectorAll('.mVal').forEach((el) => {
      const k = el.dataset.k;
      el.textContent = mana[k];
      total += mana[k];
    });
    $('poolTotal').textContent = total;
  }
  document.querySelectorAll('.mAdd').forEach((b) => holdable(b, () => { mana[b.dataset.k] = Math.min(mana[b.dataset.k] + 1, 99); saveMana(); renderMana(); }));
  document.querySelectorAll('.mSub').forEach((b) => holdable(b, () => { mana[b.dataset.k] = Math.max(mana[b.dataset.k] - 1, 0); saveMana(); renderMana(); }));
  on('emptyPool', 'click', emptyMana);
  renderMana();

  // ---------- tokens screen (local to this device, persisted) ----------
  // tokens are remembered per player; the screen always shows whoever's turn it is
  let tokensBy = {};
  try { tokensBy = JSON.parse(store.getItem('tabletTokensBy') || '{}') || {}; } catch {}
  const tokKey = () => activeId() || '_table';
  function curTokens() { const k = tokKey(); if (!Array.isArray(tokensBy[k])) tokensBy[k] = []; return tokensBy[k]; }
  function saveTokens() { store.setItem('tabletTokensBy', JSON.stringify(tokensBy)); }

  // ---------- token cards v2: stacked copies, big quantity badge, typed counters, custom tokens ----------
  const NUM62 = "font-family: 'Peteroy', Georgia, serif; font-size: 62px; font-weight: 400; line-height: 1; display: inline-block; transform: scaleY(1.22); transform-origin: center; color: #F9F5EC; min-width: 54px; text-align: center;";
  const TK_COLORS = { W: ['#e9e2c9', '#b9ae8a'], U: ['#3d6fa8', '#1d3553'], B: ['#4a4150', '#1b171e'], R: ['#b5452f', '#5a1c12'], G: ['#3f7a45', '#1c3b20'], C: ['#8d8a86', '#4a4845'], M: ['#c9a227', '#6a552a'] };
  const BASIC_CTRS = ['+1/+1', '-1/-1'];

  // migrate / normalise saved tokens from older versions
  function normTok(tk) {
    if (!tk.ctr || typeof tk.ctr !== 'object') tk.ctr = {};
    if (typeof tk.counters === 'number') { if (tk.counters > 0) tk.ctr['+1/+1'] = (tk.ctr['+1/+1'] || 0) + tk.counters; delete tk.counters; }
    if (tk.power === undefined || tk.toughness === undefined) {
      const m = String(tk.name || '').match(/\s(\*|-?\d+)\/(\*|-?\d+)\s*$/);
      if (m) { tk.power = m[1]; tk.toughness = m[2]; tk.name = tk.name.slice(0, m.index); } else { tk.power = tk.power || ''; tk.toughness = tk.toughness || ''; }
    }
    if (typeof tk.count !== 'number') tk.count = 1;
    if (tk.text === undefined) tk.text = '';
    return tk;
  }
  Object.values(tokensBy).forEach((arr) => Array.isArray(arr) && arr.forEach(normTok));

  function effPT(tk) {
    const net = (tk.ctr['+1/+1'] || 0) - (tk.ctr['-1/-1'] || 0);
    const p = parseInt(tk.power, 10), t = parseInt(tk.toughness, 10);
    if (tk.power === '' && tk.toughness === '') return net ? { txt: (net > 0 ? '+' : '') + net + '/' + (net > 0 ? '+' : '') + net, cls: net > 0 ? 'up' : 'down' } : null;
    const P = isNaN(p) ? tk.power : p + net, T = isNaN(t) ? tk.toughness : t + net;
    return { txt: `${P}/${T}`, cls: net > 0 ? 'up' : net < 0 ? 'down' : '' };
  }

  function faceHTML(tk) {
    if (tk.img) return `<img src="${esc(tk.img)}" alt="" class="tkImg">`;
    const c = TK_COLORS[tk.color] || TK_COLORS.C;
    return `<div class="tkFace" style="background: linear-gradient(160deg, ${c[0]} 0%, ${c[1]} 100%);">
        <div class="fn">${esc(tk.name || 'Token')}</div>
        <div class="fa">${esc(tk.text || '')}</div>
        <div class="ft">TOKEN CREATURE</div></div>`;
  }

  function paintTok(col, tk) {
    const n = tk.count;
    col.classList.toggle('zero', n === 0);
    col.querySelectorAll('.tkLayer').forEach((l, i) => { l.style.display = i < Math.min(n - 1, 3) ? 'block' : 'none'; });
    const badge = col.querySelector('.tkBadge');
    badge.textContent = '×' + n;
    badge.classList.toggle('multi', n > 1);
    col.querySelector('.tkQty').textContent = n;
    const pt = effPT(tk), box = col.querySelector('.tkPT');
    box.style.display = pt ? 'block' : 'none';
    if (pt) { box.textContent = pt.txt; box.className = 'tkPT ' + pt.cls; }
    // counter rows
    const list = col.querySelector('.tkCtrs');
    const types = Object.keys(tk.ctr);
    const key = types.join('|');
    if (list.dataset.key !== key) {
      list.dataset.key = key;
      list.innerHTML = '';
      types.forEach((type) => {
        const r = document.createElement('div');
        r.className = 'ctrRow';
        r.innerHTML = `<span class="cl">${esc(type.toUpperCase())}</span><button type="button" class="cm">&minus;</button><b></b><button type="button" class="cp">+</button><button type="button" class="cx" aria-label="Remove counter type">&times;</button>`;
        holdable(r.querySelector('.cm'), () => { tk.ctr[type] = Math.max((tk.ctr[type] || 0) - 1, 0); saveTokens(); paintTok(col, tk); });
        holdable(r.querySelector('.cp'), () => { tk.ctr[type] = Math.min((tk.ctr[type] || 0) + 1, 99); saveTokens(); paintTok(col, tk); });
        r.querySelector('.cx').addEventListener('click', () => { delete tk.ctr[type]; saveTokens(); paintTok(col, tk); fitTokRow(); });
        r.dataset.type = type;
        list.appendChild(r);
      });
    }
    list.querySelectorAll('.ctrRow').forEach((r) => {
      const v = tk.ctr[r.dataset.type] || 0;
      r.querySelector('b').textContent = v;
      r.classList.toggle('on', v > 0);
    });
  }

  function fitTokRow() {
    const row = $('tokRow');
    if (!row) return;
    row.style.transform = 'none';
    const w = row.scrollWidth, h = row.scrollHeight;
    const s = Math.min(1, 1480 / Math.max(w, 1), 790 / Math.max(h, 1));
    row.style.transform = s < 1 ? `scale(${s})` : 'none';
  }

  function renderTokens() {
    const tokens = curTokens();
    tokens.forEach(normTok);
    const ap = game.players[activeId()];
    if ($('tokSub')) $('tokSub').textContent = (ap ? ap.name.toUpperCase() + ' · ' : '') + 'TOKENS STAY WITH THIS PLAYER';
    const row = $('tokRow');
    if (!row) return;
    row.innerHTML = '';
    tokens.forEach((tk, i) => {
      const col = document.createElement('div');
      col.className = 'tkCol';
      col.innerHTML = `
        <div class="tkStack">
          <div class="tkLayer" style="transform: translate(18px, -18px);"></div>
          <div class="tkLayer" style="transform: translate(12px, -12px);"></div>
          <div class="tkLayer" style="transform: translate(6px, -6px);"></div>
          <div class="tkCard">${faceHTML(tk)}
            <div class="tkBadge"></div>
            <div class="tkPT"></div>
            <button type="button" class="tkX" aria-label="Remove token">&times;</button>
          </div>
        </div>
        <input type="text" class="tkName" aria-label="Token name" placeholder="Token Name">
        <div class="tkRowQ"><span class="lbl">QTY</span><button type="button" class="tkCm">&minus;</button><span class="tkQty" style="${NUM62.replace('62px', '48px')}"></span><button type="button" class="tkCp">+</button></div>
        <div class="tkCtrs"></div>
        <button type="button" class="tkAddCtr">+ COUNTER</button>`;
      // layers reuse the art so the stack looks like real copies
      col.querySelectorAll('.tkLayer').forEach((l) => { l.innerHTML = faceHTML(tk); });
      col.querySelector('.tkName').value = tk.name;
      col.querySelector('.tkName').addEventListener('change', (e) => { tk.name = e.target.value; saveTokens(); });
      col.querySelector('.tkX').addEventListener('click', () => { tokens.splice(i, 1); saveTokens(); renderTokens(); });
      holdable(col.querySelector('.tkCm'), () => { tk.count = Math.max(tk.count - 1, 0); saveTokens(); paintTok(col, tk); });
      holdable(col.querySelector('.tkCp'), () => { tk.count = Math.min(tk.count + 1, 99); saveTokens(); paintTok(col, tk); });
      col.querySelector('.tkAddCtr').addEventListener('click', () => openCtrSheet(tk, col));
      paintTok(col, tk);
      row.appendChild(col);
    });

    const add = document.createElement('div');
    add.className = 'tkCol';
    add.innerHTML = `
      <button type="button" id="addTok" style="width: 200px; height: 279px; padding: 0; border: 1px dashed #3A352A; border-radius: 10px; background: transparent; color: #7C7466; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; cursor: pointer;">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
        <span style="font-size: 11px; letter-spacing: 0.22em;">ADD TOKEN</span>
      </button>
      <span style="width: 220px; text-align: center; font-size: 11px; letter-spacing: 0.1em; color: #5E574B;">SCRYFALL OR CUSTOM</span>`;
    add.querySelector('#addTok').addEventListener('click', () => openTokSheet('search'));
    row.appendChild(add);
    fitTokRow();
  }

  // ---------- counter chooser ----------
  let ctrTarget = null;
  function openCtrSheet(tk, col) {
    ctrTarget = { tk, col };
    if ($('ctrOther')) $('ctrOther').value = '';
    $('ctrSheet').classList.add('open');
  }
  function addCounterType(type) {
    type = String(type || '').trim().slice(0, 18);
    if (!ctrTarget || !type) return;
    const { tk, col } = ctrTarget;
    tk.ctr[type] = (tk.ctr[type] || 0) + 1;
    saveTokens(); paintTok(col, tk); fitTokRow();
    $('ctrSheet').classList.remove('open');
    ctrTarget = null;
  }
  document.querySelectorAll('#ctrSheet .ctrPick').forEach((b) => b.addEventListener('click', () => addCounterType(b.dataset.t)));
  on('ctrOtherAdd', 'click', () => addCounterType($('ctrOther').value));
  on('ctrOther', 'keydown', (e) => { if (e.key === 'Enter') addCounterType($('ctrOther').value); });
  on('ctrCancel', 'click', () => { $('ctrSheet').classList.remove('open'); ctrTarget = null; });
  on('ctrSheet', 'click', (e) => { if (e.target.id === 'ctrSheet') { $('ctrSheet').classList.remove('open'); ctrTarget = null; } });

  // ---------- add-token sheet: Scryfall search tab + custom builder tab ----------
  let customColor = 'C';
  function openTokSheet(tab) {
    $('tokSearch').classList.add('open');
    $('tokQ').value = '';
    $('tokResults').innerHTML = '';
    ['cName', 'cPow', 'cTou', 'cText'].forEach((id) => { if ($(id)) $(id).value = ''; });
    setTokTab(tab);
  }
  function setTokTab(tab) {
    document.querySelectorAll('.tokTab').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    if ($('tokPaneSearch')) $('tokPaneSearch').style.display = tab === 'search' ? 'flex' : 'none';
    if ($('tokPaneCustom')) $('tokPaneCustom').style.display = tab === 'custom' ? 'flex' : 'none';
    setTimeout(() => { const f = $(tab === 'search' ? 'tokQ' : 'cName'); if (f) f.focus(); }, 200);
  }
  document.querySelectorAll('.tokTab').forEach((b) => b.addEventListener('click', () => setTokTab(b.dataset.tab)));
  document.querySelectorAll('.cCol').forEach((b) => b.addEventListener('click', () => {
    customColor = b.dataset.c;
    document.querySelectorAll('.cCol').forEach((x) => x.classList.toggle('on', x === b));
  }));
  on('cCreate', 'click', () => {
    const name = ($('cName').value || '').trim().slice(0, 40) || 'Token';
    const pw = ($('cPow').value || '').trim().slice(0, 3), tg = ($('cTou').value || '').trim().slice(0, 3);
    curTokens().push({ name, img: '', custom: true, color: customColor, power: pw, toughness: tg, text: ($('cText').value || '').trim().slice(0, 120), count: 1, ctr: {} });
    saveTokens(); renderTokens();
    $('tokSearch').classList.remove('open');
  });

  let tokTimer;
  on('tokClose', 'click', () => $('tokSearch').classList.remove('open'));
  on('tokQ', 'input', () => {
    clearTimeout(tokTimer);
    const q = $('tokQ').value.trim();
    if (q.length < 2) { $('tokResults').innerHTML = ''; return; }
    tokTimer = setTimeout(async () => {
      try {
        const r = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent('type:token ' + q)}&unique=cards&order=name`);
        const data = await r.json();
        const list = (data.data || []).slice(0, 8);
        $('tokResults').innerHTML = '';
        list.forEach((card) => {
          const uris = card.image_uris || (card.card_faces && card.card_faces[0].image_uris) || {};
          const div = document.createElement('div');
          div.className = 'tr';
          div.innerHTML = `<img src="${esc(uris.art_crop || uris.normal || '')}" alt=""><span>${esc(card.name)}${card.power ? ` ${esc(card.power)}/${esc(card.toughness)}` : ''}</span>`;
          div.addEventListener('click', () => {
            curTokens().push({ name: card.name, img: uris.normal || uris.art_crop || '', power: card.power || '', toughness: card.toughness || '', text: card.oracle_text || '', count: 1, ctr: {} });
            saveTokens(); renderTokens();
            $('tokSearch').classList.remove('open');
          });
          $('tokResults').appendChild(div);
        });
        if (!list.length) $('tokResults').innerHTML = '<div style="text-align:center;color:#5E574B;font-size:13px;letter-spacing:0.1em;">NO TOKENS FOUND &middot; TRY THE CUSTOM TAB</div>';
      } catch {}
    }, 350);
  });

  renderTokens();

  // ---------- fullscreen: installed app launches fullscreen; in-browser, first tap goes fullscreen ----------
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  function goFullscreen() {
    const el = document.documentElement;
    if (document.fullscreenElement || !el.requestFullscreen) return;
    el.requestFullscreen({ navigationUI: 'hide' })
      .then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch {} })
      .catch(() => {});
  }
  document.addEventListener('pointerdown', goFullscreen, { capture: true });

  // ---------- keep the kiosk awake ----------
  let wakeLock = null;
  async function keepAwake() {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => setTimeout(keepAwake, 1000));
    } catch {}
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { keepAwake(); if (wsOk) ws.send(JSON.stringify({ type: 'hello' })); }
  });
  keepAwake();

  try { connect(); } catch (e) { console.error(e); }
})();
