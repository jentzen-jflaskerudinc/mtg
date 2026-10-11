/* MTG Companion v1 — keeps the app installable and lets local games open with no signal.
   Pages and code load fresh from the network when possible (so updates arrive right away);
   the saved copy is only used when the network is down. */
const CACHE = 'mtg-v1-3';
const SHELL = [
  '/v1/', '/v1/tv', '/v1/style.css', '/v1/app.bundle.js', '/v1/game.compat.js', '/v1/manifest.json',
  '/v1/vendor/qrcode.js',
  '/v1/assets/frame9.png', '/v1/assets/stains.png', '/v1/assets/stains-round.png',
  '/tablet-assets/table-bg.jpg', '/tablet-assets/Peteroy.woff2', '/icon-192.png', '/icon-512.png',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('mtg-v1') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // Scryfall, fonts: straight to the network
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('/v1/')))
  );
});
