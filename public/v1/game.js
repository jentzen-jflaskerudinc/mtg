/* MTG Companion v1 — shared game engine.
 * Pure functions over a plain JSON state. Runs on the tablet (local games, works offline)
 * and on the server (hosted games), so both always agree on the rules.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MTG = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const MAX_SEATS = 4;
  const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

  const COUNTERS = [
    { key: 'poison', label: 'POISON', chip: 'POISON', lethal: 10 },
    { key: 'energy', label: 'ENERGY', chip: 'ENERGY' },
    { key: 'exp', label: 'EXPERIENCE', chip: 'EXP' },
    { key: 'rad', label: 'RAD', chip: 'RAD' },
  ];
  const STATUSES = [
    { key: 'monarch', label: 'MONARCH', solo: true, hint: 'ONLY ONE PLAYER AT A TIME' },
    { key: 'initiative', label: 'INITIATIVE', solo: true, hint: 'ONLY ONE PLAYER AT A TIME' },
    { key: 'blessing', label: "CITY'S BLESSING", hint: 'ASCEND' },
    { key: 'ring', label: 'RING-BEARER', hint: 'THE RING TEMPTS YOU' },
  ];

  const int = (n, lo, hi) => Math.max(lo, Math.min(hi, Math.trunc(Number(n) || 0)));
  const str = (s, max) => String(s == null ? '' : s).trim().slice(0, max);

  function makeCode(rand = Math.random) {
    let c = '';
    for (let i = 0; i < 6; i++) c += CODE_CHARS[Math.floor(rand() * CODE_CHARS.length)];
    return c;
  }

  function normSettings(s = {}) {
    return {
      players: int(s.players ?? 4, 1, MAX_SEATS),
      life: int(s.life ?? 40, 1, 999),
      timerOn: !!s.timerOn,
      mins: int(s.mins ?? 2, 1, 30),
      commander: s.commander !== false,
    };
  }

  function blankSeat(life) {
    return {
      name: '', life, cmd: {}, ctr: {}, shown: {}, custom: [], customStatus: [], flags: {},
      tax: 0, cmdrs: [], out: false, owner: null, connected: false,
    };
  }

  function newGame(settings, opts = {}) {
    const s = normSettings(settings);
    const now = opts.now || Date.now();
    return {
      v: 1,
      mode: opts.mode === 'hosted' ? 'hosted' : 'local',
      code: opts.code || '',
      locked: !!opts.locked,
      spectators: opts.spectators !== false,
      settings: s,
      seats: Array.from({ length: s.players }, () => blankSeat(s.life)),
      monarch: -1,
      initiative: -1,
      active: 0,
      round: 1,
      turnStartedAt: now,
      startedAt: now,
      rev: 0,
    };
  }

  // ---------- derived helpers (used by the UI and the TV) ----------
  const counterKinds = (seat) =>
    COUNTERS.concat((seat.custom || []).map((nm) => ({ key: 'x-' + nm, label: nm.toUpperCase(), chip: nm.toUpperCase() })));
  const statusKinds = (seat) =>
    STATUSES.concat((seat.customStatus || []).map((nm) => ({ key: 'xs-' + nm, label: nm.toUpperCase(), hint: 'CUSTOM' })));
  function hasFlag(g, i, key) {
    if (key === 'monarch') return g.monarch === i;
    if (key === 'initiative') return g.initiative === i;
    return !!(g.seats[i] && g.seats[i].flags[key]);
  }
  const cmdMax = (g, i) => Math.max(0, ...Object.values(g.seats[i].cmd || {}));
  function isDead(g, i) {
    const s = g.seats[i];
    if (!s) return false;
    if (s.out || s.life <= 0) return true;
    if (Object.values(s.cmd).some((v) => v >= 21)) return true;
    return (s.ctr.poison || 0) >= 10;
  }
  function details(g, i) {
    const s = g.seats[i];
    const out = [];
    const stat = statusKinds(s).filter((f) => hasFlag(g, i, f.key)).map((f) => f.label);
    if (stat.length) out.push({ label: 'STATUS', text: stat.join(' · ') });
    const ctr = [];
    const m = cmdMax(g, i);
    if (m > 0) ctr.push('CMDR ' + m);
    counterKinds(s).forEach((k) => { const v = s.ctr[k.key] || 0; if (v > 0) ctr.push(k.chip + ' ' + v); });
    if (ctr.length) out.push({ label: 'COUNTERS', text: ctr.join(' · ') });
    return out;
  }
  function activeCount(g, i) {
    const s = g.seats[i];
    let n = statusKinds(s).filter((f) => hasFlag(g, i, f.key)).length;
    if (cmdMax(g, i) > 0) n++;
    n += counterKinds(s).filter((k) => (s.ctr[k.key] || 0) > 0).length;
    return n;
  }
  function nextActive(g) {
    const n = g.seats.length;
    for (let step = 1; step <= n; step++) {
      const j = (g.active + step) % n;
      if (!g.seats[j].out) return { seat: j, wrapped: j <= g.active };
    }
    return { seat: g.active, wrapped: false };
  }
  const seatLabel = (g, i) => (g.seats[i] && g.seats[i].name) || 'PLAYER ' + (i + 1);

  // ---------- reducer ----------
  // Returns the new state, or null when the action is invalid / changes nothing.
  function apply(g, a, now = Date.now()) {
    if (!a || typeof a !== 'object') return null;
    const n = g.seats.length;
    const i = Number.isInteger(a.seat) && a.seat >= 0 && a.seat < n ? a.seat : -1;
    const next = JSON.parse(JSON.stringify(g));
    const S = i >= 0 ? next.seats[i] : null;
    const needSeat = () => S !== null;

    switch (a.type) {
      case 'life':
        if (!needSeat()) return null;
        S.life = int(S.life + int(a.d, -999, 999), -999, 999);
        break;
      case 'cmd': {
        const j = Number(a.from);
        if (!needSeat() || !Number.isInteger(j) || j < 0 || j >= n || j === i) return null;
        const cur = S.cmd[j] || 0;
        const val = int(cur + int(a.d, -99, 99), 0, 99);
        if (val === cur) return null;
        S.cmd[j] = val;
        S.life = int(S.life - (val - cur), -999, 999); // commander damage is also life loss
        break;
      }
      case 'ctr': {
        if (!needSeat()) return null;
        const key = str(a.key, 40);
        if (!counterKinds(S).some((k) => k.key === key)) return null;
        S.ctr[key] = int((S.ctr[key] || 0) + int(a.d, -99, 99), 0, 999);
        S.shown[key] = true;
        break;
      }
      case 'showCtr': {
        if (!needSeat()) return null;
        const key = str(a.key, 40);
        if (!counterKinds(S).some((k) => k.key === key)) return null;
        S.shown[key] = true;
        break;
      }
      case 'customCtr': {
        if (!needSeat()) return null;
        const nm = str(a.name, 24);
        if (!nm) return null;
        if (!S.custom.includes(nm)) { if (S.custom.length >= 12) return null; S.custom.push(nm); }
        S.shown['x-' + nm] = true;
        break;
      }
      case 'flag': {
        if (!needSeat()) return null;
        const key = str(a.key, 40);
        if (key === 'monarch') next.monarch = next.monarch === i ? -1 : i;
        else if (key === 'initiative') next.initiative = next.initiative === i ? -1 : i;
        else if (statusKinds(S).some((f) => f.key === key)) S.flags[key] = !S.flags[key];
        else return null;
        break;
      }
      case 'customStatus': {
        if (!needSeat()) return null;
        const nm = str(a.name, 24);
        if (!nm) return null;
        if (!S.customStatus.includes(nm)) { if (S.customStatus.length >= 12) return null; S.customStatus.push(nm); }
        S.flags['xs-' + nm] = true;
        break;
      }
      case 'tax':
        if (!needSeat()) return null;
        S.tax = int(S.tax + int(a.d, -20, 20), 0, 99);
        break;
      case 'name':
        if (!needSeat()) return null;
        S.name = str(a.name, 24);
        break;
      case 'addCmdr': {
        if (!needSeat() || S.cmdrs.length >= 2) return null;
        S.cmdrs.push(cleanCmdr(a.cmdr));
        break;
      }
      case 'setCmdr': {
        const k = Number(a.idx);
        if (!needSeat() || !Number.isInteger(k) || k < 0 || k >= S.cmdrs.length) return null;
        S.cmdrs[k] = cleanCmdr(a.cmdr);
        break;
      }
      case 'removeCmdr': {
        const k = Number(a.idx);
        if (!needSeat() || !Number.isInteger(k) || k < 0 || k >= S.cmdrs.length) return null;
        S.cmdrs.splice(k, 1);
        break;
      }
      case 'concede':
        if (!needSeat()) return null;
        S.out = !!a.out;
        if (S.out && next.active === i) {
          const nx = nextActive(next);
          next.active = nx.seat;
          if (nx.wrapped) next.round++;
          next.turnStartedAt = now;
        }
        break;
      case 'endTurn': {
        const nx = nextActive(next);
        next.active = nx.seat;
        if (nx.wrapped) next.round++;
        next.turnStartedAt = now;
        break;
      }
      case 'timer':
        if (a.on !== undefined) next.settings.timerOn = !!a.on;
        if (a.mins !== undefined) next.settings.mins = int(a.mins, 1, 30);
        next.turnStartedAt = now;
        break;
      case 'reset':
        next.seats = next.seats.map((s) => ({
          ...blankSeat(next.settings.life), name: s.name, cmdrs: s.cmdrs, owner: s.owner, connected: s.connected,
          custom: s.custom, customStatus: s.customStatus,
        }));
        next.monarch = -1;
        next.initiative = -1;
        next.active = 0;
        next.round = 1;
        next.turnStartedAt = now;
        next.startedAt = now;
        break;
      default:
        return null;
    }
    next.rev = (g.rev || 0) + 1;
    return next;
  }

  function cleanCmdr(c) {
    c = c && typeof c === 'object' ? c : { name: c };
    const url = (u) => { const s = str(u, 400); return /^https:\/\//.test(s) ? s : ''; };
    return { name: str(c.name, 100) || 'COMMANDER', art: url(c.art), image: url(c.image) };
  }

  // Validate a whole state pushed by a local-game tablet before the server relays it.
  function sanitize(g) {
    if (!g || typeof g !== 'object' || !Array.isArray(g.seats)) return null;
    const s = normSettings(g.settings || {});
    const seats = g.seats.slice(0, MAX_SEATS).map((x) => {
      const b = blankSeat(s.life);
      if (!x || typeof x !== 'object') return b;
      const nums = (o, max) => {
        const r = {};
        if (o && typeof o === 'object') for (const k of Object.keys(o).slice(0, 40)) r[str(k, 40)] = int(o[k], 0, max);
        return r;
      };
      const bools = (o) => {
        const r = {};
        if (o && typeof o === 'object') for (const k of Object.keys(o).slice(0, 40)) r[str(k, 40)] = !!o[k];
        return r;
      };
      const names = (l) => (Array.isArray(l) ? l.slice(0, 12).map((v) => str(v, 24)).filter(Boolean) : []);
      return {
        ...b,
        name: str(x.name, 24),
        life: int(x.life, -999, 999),
        cmd: nums(x.cmd, 99),
        ctr: nums(x.ctr, 999),
        shown: bools(x.shown),
        flags: bools(x.flags),
        custom: names(x.custom),
        customStatus: names(x.customStatus),
        tax: int(x.tax, 0, 99),
        cmdrs: Array.isArray(x.cmdrs) ? x.cmdrs.slice(0, 2).map(cleanCmdr) : [],
        out: !!x.out,
      };
    });
    if (!seats.length) return null;
    const seatIdx = (v) => (Number.isInteger(v) && v >= 0 && v < seats.length ? v : -1);
    return {
      v: 1,
      mode: 'local',
      code: '',
      locked: false,
      spectators: true,
      settings: { ...s, players: seats.length },
      seats,
      monarch: seatIdx(g.monarch),
      initiative: seatIdx(g.initiative),
      active: Math.max(0, seatIdx(g.active)),
      round: int(g.round, 1, 9999),
      turnStartedAt: int(g.turnStartedAt, 0, 8.64e15),
      startedAt: int(g.startedAt, 0, 8.64e15),
      rev: int(g.rev, 0, 1e9),
    };
  }

  return {
    MAX_SEATS, COUNTERS, STATUSES, CODE_CHARS,
    makeCode, normSettings, newGame, apply, sanitize,
    counterKinds, statusKinds, hasFlag, cmdMax, isDead, details, activeCount, nextActive, seatLabel,
  };
});
