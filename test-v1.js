/* v1 rooms end-to-end. Run: node test-v1.js (server must be running on :3000) */
const WebSocket = require('ws');
const MTG = require('./public/v1/game.js');
const URL = 'ws://localhost:3000/v1/ws';

let pass = 0, fail = 0;
function check(name, cond) { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function client() {
  const ws = new WebSocket(URL);
  const c = { ws, msgs: [], game: null, seat: undefined };
  ws.on('message', (raw) => {
    const m = JSON.parse(raw);
    c.msgs.push(m);
    if (m.game) c.game = m.game;
    if (typeof m.seat === 'number') c.seat = m.seat;
  });
  c.send = (o) => ws.send(JSON.stringify(o));
  c.last = (t) => [...c.msgs].reverse().find((m) => m.t === t);
  return new Promise((res) => ws.on('open', () => res(c)));
}

(async () => {
  // ---- engine ----
  let g = MTG.newGame({ players: 3, life: 40 });
  g = MTG.apply(g, { type: 'cmd', seat: 1, from: 0, d: 7 });
  check('engine: commander damage also costs life', g.seats[1].life === 33 && g.seats[1].cmd[0] === 7);
  g = MTG.apply(g, { type: 'flag', seat: 2, key: 'monarch' });
  g = MTG.apply(g, { type: 'flag', seat: 0, key: 'monarch' });
  check('engine: monarch moves, only one holder', g.monarch === 0);
  g = MTG.apply(g, { type: 'concede', seat: 1, out: true });
  g = MTG.apply(g, { type: 'endTurn' });
  check('engine: end turn skips conceded seat', g.active === 2);
  g = MTG.apply(g, { type: 'endTurn' });
  check('engine: wrapping adds a round', g.active === 0 && g.round === 2);
  check('engine: rejects unknown counter', MTG.apply(g, { type: 'ctr', seat: 0, key: 'nope', d: 1 }) === null);
  g = MTG.apply(g, { type: 'reset' });
  check('engine: reset restores life and keeps names', g.seats.every((s) => s.life === 40 && !s.out));

  // ---- hosted game ----
  const host = await client();
  host.send({ t: 'create', mode: 'hosted', game: MTG.newGame({ players: 2, life: 30 }, { mode: 'hosted', code: 'TEST22' }), password: 'dragon' });
  await sleep(120);
  const created = host.last('created');
  check('host creates a game with the requested code', created && created.code === 'TEST22' && created.hostToken);
  check('hosted game uses setup life', created.game.seats[0].life === 30 && created.game.locked === true);
  check('password never sent to clients', !JSON.stringify(created.game).includes('dragon'));

  const phone = await client();
  phone.send({ t: 'peek', code: 'test22' });
  await sleep(80);
  const pk = phone.last('peek');
  check('peek sees the locked game and two open seats', pk.exists && pk.locked && pk.open === 2);
  phone.send({ t: 'join', code: 'TEST22', password: 'nope', as: 'player', clientId: 'p1' });
  await sleep(80);
  check('wrong password rejected', phone.last('error') && /Wrong password/.test(phone.last('error').error));
  phone.send({ t: 'join', code: 'TEST22', password: 'dragon', as: 'player', clientId: 'p1' });
  await sleep(100);
  check('right password joins seat 0', phone.last('joined') && phone.last('joined').seat === 0);

  phone.send({ t: 'act', a: { type: 'life', seat: 0, d: -4 } });
  await sleep(100);
  check('phone changes its own life, host sees it', host.game.seats[0].life === 26);
  phone.send({ t: 'act', a: { type: 'life', seat: 1, d: -10 } });
  await sleep(100);
  check("phone can't touch another seat", host.game.seats[1].life === 30);
  phone.send({ t: 'act', a: { type: 'reset' } });
  await sleep(80);
  check("phone can't reset the game", host.game.seats[0].life === 26);
  phone.send({ t: 'act', a: { type: 'endTurn' } });
  await sleep(100);
  check('active phone ends its turn', host.game.active === 1);
  phone.send({ t: 'act', a: { type: 'endTurn' } });
  await sleep(100);
  check("phone can't end someone else's turn", host.game.active === 1);
  host.send({ t: 'act', a: { type: 'life', seat: 1, d: -3 } });
  await sleep(100);
  check('host controls any seat', phone.game.seats[1].life === 27);

  const tv = await client();
  tv.send({ t: 'join', code: 'TEST22', password: 'dragon', as: 'tv', clientId: 'tv1' });
  await sleep(100);
  check('TV joins and sees state', tv.last('joined') && tv.game.seats[0].life === 26);

  const spec = await client();
  spec.send({ t: 'join', code: 'TEST22', password: 'dragon', as: 'spectator', clientId: 's1' });
  await sleep(100);
  check('spectator joins', spec.last('joined') && spec.last('joined').role === 'spectator');
  host.send({ t: 'room', spectators: false });
  await sleep(100);
  check('turning spectators off removes them', spec.last('kicked') && host.game.spectators === false);
  check('TV stays when spectators are off', tv.game.spectators === false);

  // reconnect reclaims the same seat
  phone.ws.close();
  await sleep(100);
  const phone2 = await client();
  phone2.send({ t: 'join', code: 'TEST22', password: 'dragon', as: 'player', clientId: 'p1' });
  await sleep(100);
  check('rejoining phone gets its seat back', phone2.last('joined') && phone2.last('joined').seat === 0);

  host.send({ t: 'end' });
  await sleep(100);
  check('ending the game tells everyone', phone2.last('kicked') && tv.last('kicked'));

  // ---- local game mirrored to a TV ----
  const tab = await client();
  const lg = MTG.newGame({ players: 4 }, { mode: 'local' });
  tab.send({ t: 'create', mode: 'local', game: lg });
  await sleep(100);
  const lc = tab.last('created');
  check('local game gets a TV code', lc && /^[A-Z0-9]{6}$/.test(lc.code));
  const tv2 = await client();
  tv2.send({ t: 'join', code: lc.code, as: 'tv', clientId: 'tv2' });
  await sleep(100);
  const lg2 = MTG.apply(lg, { type: 'life', seat: 3, d: -7 });
  tab.send({ t: 'sync', game: lg2 });
  await sleep(100);
  check('TV mirrors the tablet', tv2.game && tv2.game.seats[3].life === 33);
  tv2.send({ t: 'sync', game: MTG.apply(lg2, { type: 'life', seat: 0, d: -20 }) });
  await sleep(100);
  check("TV can't push state", tv2.game.seats[0].life === 40);
  const ph = await client();
  ph.send({ t: 'join', code: lc.code, as: 'player', clientId: 'p9' });
  await sleep(80);
  check("phones can't take seats in a local game", ph.last('error'));

  console.log(`\n${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
})();
