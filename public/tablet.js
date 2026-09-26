(() => {
  const $ = (id) => document.getElementById(id);
  const store = window.localStorage;

  // ---------- fixed-canvas scaling (brief section 2) ----------
  const stage = $('stage');
  function rescale() {
    const s = Math.min(innerWidth / 1586, innerHeight / 992);
    stage.style.transform = `scale(${s})`;
    stage.style.left = `${(innerWidth - 1586 * s) / 2}px`;
    stage.style.top = `${(innerHeight - 992 * s) / 2}px`;
  }
  addEventListener('resize', rescale);
  rescale();

  // ---------- three screens, circular swipe ----------
  const strip = $('strip');
  let page = 0; // 0 table, 1 mana, 2 tokens
  function setPage(i) {
    page = ((i % 3) + 3) % 3;
    strip.style.transform = `translateX(${-1586 * page}px)`;
  }
  let swX = null, swY = null;
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    swX = e.touches[0].clientX; swY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (swX === null) return;
    const dx = e.changedTouches[0].clientX - swX;
    const dy = e.changedTouches[0].clientY - swY;
    swX = swY = null;
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    if (Math.abs(dx) < 90 || Math.abs(dy) > Math.abs(dx)) return;
    setPage(dx > 0 ? page + 1 : page - 1); // left-to-right swipe advances, circular
  }, { passive: true });
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') setPage(page + 1);
    if (e.key === 'ArrowLeft') setPage(page - 1);
  });

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
  }

  seatEls.forEach((el, cell) => {
    const pid = () => cellPlayers()[cell];
    holdable(el.querySelector('.m1'), () => { const id = pid(); if (id) mAct('life', { targetId: id, delta: -1 }); });
    holdable(el.querySelector('.p1'), () => { const id = pid(); if (id) mAct('life', { targetId: id, delta: 1 }); });
    el.querySelector('.m5').addEventListener('click', () => { const id = pid(); if (id) mAct('life', { targetId: id, delta: -5 }); });
    el.querySelector('.p5').addEventListener('click', () => { const id = pid(); if (id) mAct('life', { targetId: id, delta: 5 }); });
    el.querySelector('.cmdBtn').addEventListener('click', () => { if (pid()) { openCmdCell = cell; render(); } });
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

  $('endTurn').addEventListener('click', () => mAct('endTurn'));

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
      el.querySelector('.seatArt').style.backgroundImage = artUrl ? `url('${artUrl}')` : 'none';
      el.style.opacity = p ? '1' : '0.55';

      const ov = el.querySelector('.cmdOv');
      if (openCmdCell === cell && p) {
        ov.style.display = 'flex';
        const rows = el.querySelector('.cmdRows');
        rows.innerHTML = '';
        game.turnOrder.filter((oid) => oid !== id).forEach((oid) => {
          const o = game.players[oid];
          if (!o) return;
          const d = (p.cmdDamage && p.cmdDamage[oid]) || 0;
          const row = document.createElement('div');
          row.className = 'rowline';
          row.innerHTML = `<span class="nm">${esc(o.name)}</span>` +
            `<button type="button" class="dm">&minus;</button>` +
            `<b class="${d >= 21 ? 'lethal' : ''}">${d}</b>` +
            `<button type="button" class="dp">+</button>`;
          row.querySelector('.dm').addEventListener('click', () => mAct('cmdDamage', { targetId: id, fromId: oid, delta: -1 }));
          row.querySelector('.dp').addEventListener('click', () => mAct('cmdDamage', { targetId: id, fromId: oid, delta: 1 }));
          rows.appendChild(row);
        });
      } else {
        ov.style.display = 'none';
      }
    });

    const act = game.players[activeId()];
    renderTurnLabel(act);
  }

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
  $('menuBtn').addEventListener('click', () => $('menuSheet').classList.add('open'));
  $('mClose').addEventListener('click', () => $('menuSheet').classList.remove('open'));
  $('mRotate').addEventListener('click', () => {
    seatOffset = (seatOffset + 1) % Math.max(game.turnOrder.length, 1);
    store.setItem('seatOffset', String(seatOffset));
    render();
  });
  $('mTimerStart').addEventListener('click', () => {
    const m = parseInt(prompt('Global timer — minutes per turn (1-10):', '5'), 10);
    if (m >= 1 && m <= 10) { mAct('timerStart', { seconds: m * 60 }); $('menuSheet').classList.remove('open'); }
  });
  $('mTimerStop').addEventListener('click', () => { mAct('timerStop'); $('menuSheet').classList.remove('open'); });
  $('mResetLife').addEventListener('click', () => { if (confirm('Reset everyone to 40 life?')) { mAct('resetLife'); $('menuSheet').classList.remove('open'); } });
  $('mNewGame').addEventListener('click', () => { if (confirm('Wipe ALL players and start a new game?')) { mAct('newGame'); $('menuSheet').classList.remove('open'); } });

  // ---------- mana screen (local to this device, persisted) ----------
  let mana = { w: 0, u: 0, b: 0, r: 0, g: 0, c: 0 };
  try { mana = Object.assign(mana, JSON.parse(store.getItem('tabletMana') || '{}')); } catch {}
  function saveMana() { store.setItem('tabletMana', JSON.stringify(mana)); }
  function renderMana() {
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
  $('emptyPool').addEventListener('click', () => { mana = { w: 0, u: 0, b: 0, r: 0, g: 0, c: 0 }; saveMana(); renderMana(); });
  renderMana();

  // ---------- tokens screen (local to this device, persisted) ----------
  let tokens = [];
  try { tokens = JSON.parse(store.getItem('tabletTokens') || '[]'); } catch {}
  function saveTokens() { store.setItem('tabletTokens', JSON.stringify(tokens)); }

  const NUM62 = "font-family: 'Peteroy', Georgia, serif; font-size: 62px; font-weight: 400; line-height: 1; display: inline-block; transform: scaleY(1.22); transform-origin: center; color: #F9F5EC; min-width: 54px; text-align: center;";
  const NUM40 = NUM62.replace('62px', '40px');
  const STEPBTN = 'width: 46px; height: 46px; padding: 0; border: none; background: transparent; color: #E7DFCE; font-family: inherit; font-size: 30px; line-height: 1; cursor: pointer;';

  function renderTokens() {
    const row = $('tokRow');
    row.innerHTML = '';
    tokens.forEach((tk, i) => {
      const col = document.createElement('div');
      col.style.cssText = 'width: 240px; display: flex; flex-direction: column; align-items: center; gap: 16px;';
      const artInner = tk.img
        ? `<img src="${esc(tk.img)}" alt="" style="width: 200px; height: 279px; object-fit: cover; display: block;">`
        : `<div aria-hidden="true" style="position: absolute; right: 0; bottom: 14px; left: 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; color: #5E574B;">[SCRYFALL ART]</div>`;
      col.innerHTML = `
        <div style="position: relative; width: 200px; height: 279px; border-radius: 10px; overflow: hidden; background-color: #14131A; background-image: repeating-linear-gradient(126deg, #1C1B26 0px, #1C1B26 2px, #14131A 2px, #14131A 16px); border: 1px solid #6A552A;">
          ${artInner}
          <button type="button" class="tkX" aria-label="Remove token" style="position: absolute; top: 8px; right: 8px; width: 30px; height: 30px; padding: 0; border: none; border-radius: 50%; background: rgba(8,8,10,0.72); color: #A79C86; font-family: inherit; font-size: 17px; line-height: 1; cursor: pointer;">&times;</button>
        </div>
        <input type="text" class="tkName" aria-label="Token name" placeholder="Token Name" style="width: 220px; height: 26px; box-sizing: border-box; padding: 0; text-align: center; border: none; background: transparent; color: #F3EEE3; font-family: inherit; font-size: 16px; font-weight: 700; letter-spacing: 0.08em;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
          <button type="button" class="tkCm" style="${STEPBTN}">&minus;</button>
          <span class="tkCount" style="${NUM62}">${tk.count}</span>
          <button type="button" class="tkCp" style="${STEPBTN}">+</button>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
          <span style="font-size: 10px; letter-spacing: 0.22em; color: #A79C86;">COUNTERS</span>
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
            <button type="button" class="tkKm" style="${STEPBTN}">&minus;</button>
            <span class="tkCtr" style="${NUM40}">${tk.counters}</span>
            <button type="button" class="tkKp" style="${STEPBTN}">+</button>
          </div>
        </div>`;
      col.querySelector('.tkName').value = tk.name;
      col.querySelector('.tkName').addEventListener('change', (e) => { tk.name = e.target.value; saveTokens(); });
      col.querySelector('.tkX').addEventListener('click', () => { tokens.splice(i, 1); saveTokens(); renderTokens(); });
      holdable(col.querySelector('.tkCm'), () => { tk.count = Math.max(tk.count - 1, 0); saveTokens(); col.querySelector('.tkCount').textContent = tk.count; });
      holdable(col.querySelector('.tkCp'), () => { tk.count = Math.min(tk.count + 1, 99); saveTokens(); col.querySelector('.tkCount').textContent = tk.count; });
      holdable(col.querySelector('.tkKm'), () => { tk.counters = Math.max(tk.counters - 1, 0); saveTokens(); col.querySelector('.tkCtr').textContent = tk.counters; });
      holdable(col.querySelector('.tkKp'), () => { tk.counters = Math.min(tk.counters + 1, 99); saveTokens(); col.querySelector('.tkCtr').textContent = tk.counters; });
      row.appendChild(col);
    });

    // add slot
    const add = document.createElement('div');
    add.style.cssText = 'width: 240px; display: flex; flex-direction: column; align-items: center; gap: 16px;';
    add.innerHTML = `
      <button type="button" id="addTok" style="width: 200px; height: 279px; padding: 0; border: 1px dashed #3A352A; border-radius: 10px; background: transparent; color: #7C7466; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; cursor: pointer;">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
        <span style="font-size: 11px; letter-spacing: 0.22em;">ADD TOKEN</span>
      </button>
      <span style="width: 220px; text-align: center; font-size: 11px; letter-spacing: 0.1em; color: #5E574B;">SEARCH SCRYFALL</span>`;
    add.querySelector('#addTok').addEventListener('click', () => {
      $('tokSearch').classList.add('open');
      $('tokQ').value = '';
      $('tokResults').innerHTML = '';
      setTimeout(() => $('tokQ').focus(), 200);
    });
    row.appendChild(add);
  }
  renderTokens();

  // scryfall token search
  let tokTimer;
  $('tokClose').addEventListener('click', () => $('tokSearch').classList.remove('open'));
  $('tokQ').addEventListener('input', () => {
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
            tokens.push({ name: card.name + (card.power ? ` ${card.power}/${card.toughness}` : ''), img: uris.art_crop || uris.normal || '', count: 1, counters: 0 });
            saveTokens();
            renderTokens();
            $('tokSearch').classList.remove('open');
          });
          $('tokResults').appendChild(div);
        });
        if (!list.length) $('tokResults').innerHTML = '<div style="text-align:center;color:#5E574B;font-size:13px;letter-spacing:0.1em;">NO TOKENS FOUND</div>';
      } catch {}
    }, 350);
  });

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

  connect();
})();
