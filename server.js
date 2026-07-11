/**
 * MTG Commander Life Tracker — real-time WebSocket server
 * Phones control players, TV displays state. Master PIN unlocks override.
 *
 * Env:
 *   PORT        (Render sets this automatically)
 *   MASTER_PIN  (default "1234" — set your own in Render dashboard!)
 */
const express = require('express');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer, WebSocket } = require('ws');

const MASTER_PIN = process.env.MASTER_PIN || '1234';
const STARTING_LIFE = 40;
const MAX_PLAYERS = 6;
const DEFAULT_TIMER_SECONDS = 120;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/tv', (_, res) => res.sendFile(path.join(__dirname, 'public', 'tv.html')));
app.get('/healthz', (_, res) => res.send('ok'));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// ---------- Game state (in memory) ----------
let state = newGameState();

function newGameState() {
  return {
    players: {},      // id -> { id, name, commander:{name, art, image}, life, cmdDamage:{fromId:n}, connected }
    turnOrder: [],    // array of player ids
    activeIdx: 0,
    turnNumber: 1,
    timer: { votes: [], running: false, endsAt: 0, duration: DEFAULT_TIMER_SECONDS },
    startedAt: Date.now(),
  };
}

function publicState() {
  return {
    players: state.players,
    turnOrder: state.turnOrder,
    activeIdx: state.activeIdx,
    turnNumber: state.turnNumber,
    timer: state.timer,
    now: Date.now(),
  };
}

function broadcast() {
  const msg = JSON.stringify({ type: 'state', state: publicState() });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  }
}

function send(ws, obj) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
}

function clampInt(n, lo, hi) {
  n = Math.trunc(Number(n) || 0);
  return Math.max(lo, Math.min(hi, n));
}

// ---------- Actions ----------
function adjustLife(playerId, delta) {
  const p = state.players[playerId];
  if (!p) return false;
  p.life = clampInt(p.life + clampInt(delta, -999, 999), -999, 999);
  return true;
}

function adjustCmdDamage(playerId, fromId, delta) {
  const p = state.players[playerId];
  if (!p || !state.players[fromId] || fromId === playerId) return false;
  const cur = p.cmdDamage[fromId] || 0;
  const next = clampInt(cur + clampInt(delta, -99, 99), 0, 99);
  const applied = next - cur; // actual change after clamping
  p.cmdDamage[fromId] = next;
  // Commander damage is also regular damage: mirror it onto life
  p.life = clampInt(p.life - applied, -999, 999);
  return true;
}

function advanceTurn() {
  if (state.turnOrder.length === 0) return;
  state.activeIdx = (state.activeIdx + 1) % state.turnOrder.length;
  if (state.activeIdx === 0) state.turnNumber += 1;
  if (state.timer.running) {
    state.timer.endsAt = Date.now() + state.timer.duration * 1000;
  }
}

function startTimer(seconds) {
  state.timer.duration = clampInt(seconds || state.timer.duration, 10, 3600);
  state.timer.running = true;
  state.timer.votes = [];
  state.timer.endsAt = Date.now() + state.timer.duration * 1000;
}

function stopTimer() {
  state.timer.running = false;
  state.timer.votes = [];
  state.timer.endsAt = 0;
}

function toggleTimerVote(playerId) {
  if (!state.players[playerId] || state.timer.running) return false;
  const i = state.timer.votes.indexOf(playerId);
  if (i === -1) state.timer.votes.push(playerId);
  else state.timer.votes.splice(i, 1);
  // strict majority of current players starts the timer
  const majority = Math.floor(state.turnOrder.length / 2) + 1;
  if (state.timer.votes.length >= majority) startTimer();
  return true;
}

function removePlayer(targetId) {
  if (!state.players[targetId]) return false;
  delete state.players[targetId];
  const idx = state.turnOrder.indexOf(targetId);
  if (idx !== -1) {
    state.turnOrder.splice(idx, 1);
    if (state.turnOrder.length === 0) state.activeIdx = 0;
    else if (idx < state.activeIdx || state.activeIdx >= state.turnOrder.length) {
      state.activeIdx = state.activeIdx % state.turnOrder.length;
    }
  }
  for (const p of Object.values(state.players)) delete p.cmdDamage[targetId];
  state.timer.votes = state.timer.votes.filter((id) => id !== targetId);
  return true;
}

// ---------- Master actions (PIN-gated) ----------
function handleMaster(ws, msg) {
  if (msg.pin !== MASTER_PIN) {
    send(ws, { type: 'masterFail' });
    return;
  }
  switch (msg.action) {
    case 'auth':
      send(ws, { type: 'masterOk' });
      return; // no state change
    case 'life':
      adjustLife(msg.targetId, msg.delta);
      break;
    case 'setLife': {
      const p = state.players[msg.targetId];
      if (p) p.life = clampInt(msg.value, -999, 999);
      break;
    }
    case 'cmdDamage':
      adjustCmdDamage(msg.targetId, msg.fromId, msg.delta);
      break;
    case 'endTurn':
      advanceTurn();
      break;
    case 'setActive': {
      const idx = state.turnOrder.indexOf(msg.targetId);
      if (idx !== -1) state.activeIdx = idx;
      break;
    }
    case 'setOrder': {
      if (Array.isArray(msg.order)) {
        const valid = msg.order.filter((id) => state.players[id]);
        if (valid.length === state.turnOrder.length && new Set(valid).size === valid.length) {
          const activeId = state.turnOrder[state.activeIdx];
          state.turnOrder = valid;
          const newIdx = state.turnOrder.indexOf(activeId);
          state.activeIdx = newIdx === -1 ? 0 : newIdx;
        }
      }
      break;
    }
    case 'removePlayer':
      removePlayer(msg.targetId);
      break;
    case 'timerStart':
      startTimer(msg.seconds);
      break;
    case 'timerStop':
      stopTimer();
      break;
    case 'resetLife':
      for (const p of Object.values(state.players)) {
        p.life = STARTING_LIFE;
        p.cmdDamage = {};
      }
      state.activeIdx = 0;
      state.turnNumber = 1;
      stopTimer();
      break;
    case 'newGame':
      state = newGameState();
      break;
    default:
      return;
  }
  broadcast();
}

// ---------- WebSocket handling ----------
wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => (ws.isAlive = true));

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    if (typeof msg !== 'object' || msg === null) return;

    switch (msg.type) {
      case 'hello': {
        // Reclaim existing player (reconnect) or just sync
        const id = typeof msg.playerId === 'string' ? msg.playerId : null;
        if (id && state.players[id]) {
          ws.playerId = id;
          state.players[id].connected = true;
        }
        send(ws, { type: 'welcome', playerId: ws.playerId || null, state: publicState() });
        if (ws.playerId) broadcast();
        break;
      }

      case 'join': {
        const name = String(msg.name || '').trim().slice(0, 24);
        if (!name) return send(ws, { type: 'error', error: 'Name required' });

        // Reclaim by id (rejoin after refresh)
        let id = typeof msg.playerId === 'string' && state.players[msg.playerId] ? msg.playerId : null;
        if (!id) {
          if (Object.keys(state.players).length >= MAX_PLAYERS) {
            return send(ws, { type: 'error', error: 'Game is full' });
          }
          id = crypto.randomUUID();
          state.players[id] = {
            id,
            name,
            commander: null,
            life: STARTING_LIFE,
            cmdDamage: {},
            connected: true,
          };
          state.turnOrder.push(id);
        }
        const p = state.players[id];
        p.name = name;
        p.connected = true;
        if (msg.commander && typeof msg.commander === 'object') {
          p.commander = {
            name: String(msg.commander.name || '').slice(0, 100),
            art: String(msg.commander.art || '').slice(0, 400),
            image: String(msg.commander.image || '').slice(0, 400),
          };
        }
        ws.playerId = id;
        send(ws, { type: 'joined', playerId: id });
        broadcast();
        break;
      }

      case 'life': {
        if (ws.playerId && ws.playerId === msg.playerId && adjustLife(msg.playerId, msg.delta)) {
          broadcast();
        }
        break;
      }

      case 'cmdDamage': {
        // A player records commander damage *they received* from an opponent
        if (ws.playerId && ws.playerId === msg.playerId &&
            adjustCmdDamage(msg.playerId, msg.fromId, msg.delta)) {
          broadcast();
        }
        break;
      }

      case 'endTurn': {
        const activeId = state.turnOrder[state.activeIdx];
        if (ws.playerId && ws.playerId === activeId) {
          advanceTurn();
          broadcast();
        }
        break;
      }

      case 'timerVote': {
        if (ws.playerId && ws.playerId === msg.playerId && toggleTimerVote(msg.playerId)) {
          broadcast();
        }
        break;
      }

      case 'master':
        handleMaster(ws, msg);
        break;
    }
  });

  ws.on('close', () => {
    if (ws.playerId && state.players[ws.playerId]) {
      // Keep the player in the game (they may reconnect); just flag them
      const stillConnected = [...wss.clients].some(
        (c) => c !== ws && c.playerId === ws.playerId && c.readyState === WebSocket.OPEN
      );
      if (!stillConnected) {
        state.players[ws.playerId].connected = false;
        broadcast();
      }
    }
  });
});

// Heartbeat: drop dead sockets so 'connected' flags stay honest
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`MTG Life Tracker running on port ${PORT}`);
  console.log(`Phones:  http://localhost:${PORT}/`);
  console.log(`TV:      http://localhost:${PORT}/tv`);
  if (MASTER_PIN === '1234') console.log('WARNING: using default MASTER_PIN 1234 — set MASTER_PIN env var');
});
