/**
 * MTG Companion v1 — game rooms over WebSocket at /v1/ws.
 *
 * Every game has a 6-character code. Two kinds of room:
 *   local  — the tablet runs the game (works offline) and pushes its state here so a TV can mirror it.
 *   hosted — the server runs the game with the shared engine; phones join a seat, others spectate.
 * The legacy app (/, /tv, /tv2, /tablet) is untouched and keeps its own socket.
 */
const crypto = require('crypto');
const { WebSocketServer, WebSocket } = require('ws');
const MTG = require('./public/v1/game.js');

const ROOM_IDLE_MS = 12 * 60 * 60 * 1000; // drop rooms nobody has touched for 12h
const MAX_ROOMS = 500;

function attachV1(server) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });
  const rooms = new Map(); // code -> { code, mode, game, password, hostToken, clients:Set, touched }

  const now = () => Date.now();
  const send = (ws, o) => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(o)); };
  const hash = (pw) => crypto.createHash('sha256').update(String(pw)).digest('hex');
  const same = (a, b) => {
    const x = Buffer.from(String(a)), y = Buffer.from(String(b));
    return x.length === y.length && crypto.timingSafeEqual(x, y);
  };

  // what clients see: no tokens or passwords, owner ids reduced to "taken"
  function view(room) {
    const g = room.game;
    return {
      ...g,
      code: room.code,
      seats: g.seats.map((s) => ({ ...s, owner: s.owner ? true : null, connected: !!s.owner && seatOnline(room, s.owner) })),
    };
  }
  const seatOnline = (room, owner) => [...room.clients].some((c) => c.clientId === owner && c.readyState === WebSocket.OPEN);

  function broadcast(room) {
    const g = view(room);
    for (const c of room.clients) send(c, { t: 'state', game: g, seat: c.role === 'player' ? c.seat : undefined, now: now() });
  }

  function freeCode(wanted) {
    const ok = (c) => /^[A-Z0-9]{6}$/.test(c) && !rooms.has(c);
    if (wanted && ok(String(wanted).toUpperCase())) return String(wanted).toUpperCase();
    for (let i = 0; i < 50; i++) { const c = MTG.makeCode(() => crypto.randomInt(1e9) / 1e9); if (ok(c)) return c; }
    return null;
  }

  function leave(ws) {
    const room = ws.room;
    if (!room) return;
    room.clients.delete(ws);
    ws.room = null;
    broadcast(room);
  }

  function enter(ws, room, role, seat) {
    if (ws.room && ws.room !== room) leave(ws);
    ws.room = room;
    ws.role = role;
    ws.seat = seat;
    room.clients.add(ws);
    room.touched = now();
  }

  function canAct(ws, a) {
    const room = ws.room;
    if (!room || room.mode !== 'hosted') return false;
    if (ws.role === 'host') return true;
    if (ws.role !== 'player' || ws.seat < 0) return false;
    // seated players run the table like the tablet does; only the host resets or changes the timer
    return !['reset', 'timer'].includes(a.type);
  }

  function onMessage(ws, m) {
    switch (m.t) {
      case 'create': {
        if (rooms.size >= MAX_ROOMS) return send(ws, { t: 'error', error: 'Server is full, try again later' });
        const mode = m.mode === 'hosted' ? 'hosted' : 'local';
        const code = freeCode(m.game && m.game.code);
        if (!code) return send(ws, { t: 'error', error: 'Could not make a code' });
        let game;
        if (mode === 'local') {
          game = MTG.sanitize(m.game);
          if (!game) return send(ws, { t: 'error', error: 'Bad game' });
        } else {
          const src = m.game || {};
          game = MTG.newGame(src.settings, { mode: 'hosted', code, locked: !!m.password, spectators: src.spectators !== false });
        }
        game.code = code;
        game.mode = mode;
        const password = mode === 'hosted' && m.password ? hash(String(m.password).slice(0, 64)) : '';
        game.locked = !!password;
        const room = { code, mode, game, password, hostToken: crypto.randomBytes(18).toString('hex'), clients: new Set(), touched: now() };
        rooms.set(code, room);
        enter(ws, room, 'host', -1);
        send(ws, { t: 'created', code, hostToken: room.hostToken, game: view(room), now: now() });
        return;
      }
      case 'host': {
        const room = rooms.get(String(m.code || '').toUpperCase());
        if (!room || !same(room.hostToken, m.hostToken || '')) return send(ws, { t: 'kicked', error: 'That game has ended' });
        enter(ws, room, 'host', -1);
        send(ws, { t: 'state', game: view(room), now: now() });
        return;
      }
      case 'peek': {
        const room = rooms.get(String(m.code || '').toUpperCase());
        if (!room) return send(ws, { t: 'peek', exists: false });
        const g = room.game;
        return send(ws, {
          t: 'peek', exists: true, mode: room.mode, locked: !!room.password, spectators: g.spectators,
          players: g.seats.length, open: room.mode === 'hosted' ? g.seats.filter((s) => !s.owner).length : 0,
        });
      }
      case 'join': {
        const room = rooms.get(String(m.code || '').toUpperCase());
        if (!room) return send(ws, { t: 'error', error: 'No game with that code' });
        if (room.password && !same(room.password, hash(String(m.password || '').slice(0, 64)))) {
          return send(ws, { t: 'error', error: m.password ? 'Wrong password' : 'This game needs a password' });
        }
        const clientId = String(m.clientId || '').slice(0, 40) || crypto.randomUUID();
        ws.clientId = clientId;
        const g = room.game;
        let role = m.as === 'tv' ? 'tv' : m.as === 'spectator' ? 'spectator' : 'player';
        if (room.mode === 'local' && role === 'player') return send(ws, { t: 'error', error: 'This is a local game, you can only watch it' });
        if (role === 'spectator' && !g.spectators) return send(ws, { t: 'error', error: 'The host turned spectators off' });
        let seat = -1;
        if (role === 'player') {
          // players pick their own seat after joining ('sit'); a refresh reclaims the one they had
          seat = g.seats.findIndex((s) => s.owner === clientId);
          if (seat === -1 && !g.seats.some((s) => !s.owner)) return send(ws, { t: 'error', error: 'Game is full' });
        }
        enter(ws, room, role, seat);
        send(ws, { t: 'joined', role, seat, game: view(room), now: now() });
        broadcast(room);
        return;
      }
      case 'sit': {
        const room = ws.room;
        if (!room || room.mode !== 'hosted' || ws.role !== 'player') return;
        const k = Number(m.seat);
        const seats = room.game.seats;
        if (!Number.isInteger(k) || k < 0 || k >= seats.length) return;
        if (seats[k].owner && seats[k].owner !== ws.clientId) return send(ws, { t: 'error', error: 'Someone already sat there' });
        seats.forEach((s) => { if (s.owner === ws.clientId) s.owner = null; });
        seats[k].owner = ws.clientId;
        for (const c of room.clients) if (c.clientId === ws.clientId && c.role === 'player') c.seat = k;
        room.touched = now();
        send(ws, { t: 'sat', seat: k });
        broadcast(room);
        return;
      }
      case 'act': {
        const a = m.a;
        if (!a || typeof a !== 'object' || !canAct(ws, a)) return;
        const next = MTG.apply(ws.room.game, a, now());
        if (!next) return;
        // engine never touches ownership; keep the server's copy authoritative
        next.seats.forEach((s, i) => { s.owner = ws.room.game.seats[i].owner; });
        ws.room.game = next;
        ws.room.touched = now();
        broadcast(ws.room);
        return;
      }
      case 'sync': {
        const room = ws.room;
        if (!room || ws.role !== 'host' || room.mode !== 'local') return;
        const g = MTG.sanitize(m.game);
        if (!g) return;
        g.code = room.code;
        room.game = g;
        room.touched = now();
        broadcast(room);
        return;
      }
      case 'room': {
        const room = ws.room;
        if (!room || ws.role !== 'host' || room.mode !== 'hosted') return;
        if (m.locked === false) room.password = '';
        if (m.locked === true && m.password) room.password = hash(String(m.password).slice(0, 64));
        if (typeof m.spectators === 'boolean') room.game.spectators = m.spectators;
        room.game.locked = !!room.password;
        if (!room.game.spectators) for (const c of room.clients) if (c.role === 'spectator') { send(c, { t: 'kicked', error: 'The host turned spectators off' }); leave(c); }
        broadcast(room);
        return;
      }
      case 'leave': {
        const room = ws.room;
        if (room && ws.role === 'player') room.game.seats.forEach((s) => { if (s.owner === ws.clientId) s.owner = null; });
        leave(ws);
        return;
      }
      case 'end': {
        const room = ws.room;
        if (!room || ws.role !== 'host') return;
        for (const c of room.clients) if (c !== ws) send(c, { t: 'kicked', error: 'The host ended the game' });
        for (const c of [...room.clients]) { c.room = null; }
        rooms.delete(room.code);
        return;
      }
    }
  }

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('message', (raw) => {
      let m;
      try { m = JSON.parse(raw); } catch { return; }
      if (!m || typeof m !== 'object') return;
      try { onMessage(ws, m); } catch (e) { console.error('v1 message failed', e); }
    });
    ws.on('close', () => leave(ws));
  });

  const beat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) { ws.terminate(); continue; }
      ws.isAlive = false;
      ws.ping();
    }
    const cutoff = now() - ROOM_IDLE_MS;
    for (const [code, room] of rooms) if (room.clients.size === 0 && room.touched < cutoff) rooms.delete(code);
  }, 30000);
  wss.on('close', () => clearInterval(beat));

  return { wss, rooms };
}

module.exports = { attachV1 };
