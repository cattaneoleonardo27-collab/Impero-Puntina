const CACHE = 'puntbay-v3';
const ASSETS = ['icons/icon-192.png', 'icons/icon-512.png', 'manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // navigazione: sempre rete, la cache serve solo se sei offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((hit) => hit || caches.match('./')))
    );
    return;
  }

  // solo icone e manifest dalla cache: il resto va sempre in rete
  if (ASSETS.some((asset) => url.pathname.endsWith(asset))) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request)));
  }
});
