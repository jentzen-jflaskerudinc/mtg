/* End-to-end test: 4 players + TV + master. Run: node test.js (server must be running on :3000) */
const WebSocket = require('ws');
const URL = 'ws://localhost:3000';

const results = [];
function check(name, cond) {
  results.push([name, !!cond]);
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function client() {
  const ws = new WebSocket(URL);
  const c = { ws, state: null, playerId: null, masterOk: false, masterFail: false, errors: [] };
  ws.on('message', (raw) => {
    const m = JSON.parse(raw);
    if (m.type === 'state' || m.type === 'welcome') c.state = m.state || c.state;
    if (m.type === 'joined') c.playerId = m.playerId;
    if (m.type === 'welcome' && m.playerId) c.playerId = m.playerId;
    if (m.type === 'masterOk') c.masterOk = true;
    if (m.type === 'masterFail') c.masterFail = true;
    if (m.type === 'error') c.errors.push(m.error);
  });
  c.send = (o) => ws.send(JSON.stringify(o));
  return new Promise((res) => ws.on('open', () => { c.send({ type: 'hello' }); res(c); }));
}

(async () => {
  const tv = await client();
  const names = ['Jentzen', 'Alice', 'Bob', 'Cara'];
  const players = [];
  for (const n of names) {
    const c = await client();
    c.send({ type: 'join', name: n, commander: { name: `${n}'s Cmdr`, art: '', image: '' } });
    players.push(c);
    await sleep(80);
  }
  await sleep(200);

  const [j, a, b] = players;
  check('4 players joined, TV sees them', tv.state && Object.keys(tv.state.players).length === 4);
  check('turn order has 4', tv.state.turnOrder.length === 4);
  check('starting life is 40', Object.values(tv.state.players).every((p) => p.life === 40));

  // life change propagates
  const t0 = Date.now();
  a.send({ type: 'life', playerId: a.playerId, delta: -3 });
  await sleep(150);
  const alice = tv.state.players[a.playerId];
  check('life -3 reached TV (<150ms)', alice.life === 37);
  console.log(`   (round-trip under ${Date.now() - t0}ms incl. sleep)`);

  // can't change someone else's life
  a.send({ type: 'life', playerId: b.playerId, delta: -10 });
  await sleep(120);
  check('player cannot change another player\'s life', tv.state.players[b.playerId].life === 40);

  // commander damage mirrors to life
  b.send({ type: 'cmdDamage', playerId: b.playerId, fromId: a.playerId, delta: 5 });
  await sleep(120);
  const bob = tv.state.players[b.playerId];
  check('cmd damage recorded', bob.cmdDamage[a.playerId] === 5);
  check('cmd damage also reduced life', bob.life === 35);

  // turn passing: only active player
  b.send({ type: 'endTurn', playerId: b.playerId });
  await sleep(120);
  check('non-active player cannot end turn', tv.state.activeIdx === 0);
  j.send({ type: 'endTurn', playerId: j.playerId });
  await sleep(120);
  check('active player ends turn', tv.state.activeIdx === 1);

  // master PIN
  const m = await client();
  m.send({ type: 'master', pin: 'wrong', action: 'auth' });
  await sleep(120);
  check('wrong PIN rejected', m.masterFail && !m.masterOk);
  m.send({ type: 'master', pin: '1234', action: 'auth' });
  await sleep(120);
  check('correct PIN accepted', m.masterOk);
  m.send({ type: 'master', pin: '1234', action: 'life', targetId: b.playerId, delta: -7 });
  await sleep(120);
  check('master adjusts any player\'s life', tv.state.players[b.playerId].life === 28);
  m.send({ type: 'master', pin: 'wrong', action: 'life', targetId: b.playerId, delta: -7 });
  await sleep(120);
  check('master action with wrong PIN ignored', tv.state.players[b.playerId].life === 28);
  m.send({ type: 'master', pin: '1234', action: 'endTurn' });
  await sleep(120);
  check('master forces end turn', tv.state.activeIdx === 2);
  m.send({ type: 'master', pin: '1234', action: 'setActive', targetId: j.playerId });
  await sleep(120);
  check('master sets active player', tv.state.activeIdx === 0);
  m.send({ type: 'master', pin: '1234', action: 'resetLife' });
  await sleep(120);
  check('master resets life', Object.values(tv.state.players).every((p) => p.life === 40));

  // reconnect reclaims player
  const oldId = a.playerId;
  a.ws.close();
  await sleep(150);
  check('disconnect flags player offline', tv.state.players[oldId].connected === false);
  const a2 = await client();
  a2.send({ type: 'hello', playerId: oldId });
  await sleep(150);
  check('reconnect reclaims player', tv.state.players[oldId].connected === true);

  // remove player
  m.send({ type: 'master', pin: '1234', action: 'removePlayer', targetId: oldId });
  await sleep(120);
  check('master removes player', !tv.state.players[oldId] && tv.state.turnOrder.length === 3);

  const failed = results.filter(([, ok]) => !ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})();
