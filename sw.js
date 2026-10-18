// 商家利润管家 service worker. Own cache namespace (same origin as asset-manager): only touches caches starting with PREFIX.
const PREFIX = 'profit-manager-';
const CACHE = PREFIX + 'v1';
const SHELL = [
  './',
  './index.html',
  './mobile.js',
  './sync.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;            // GitHub API etc.: straight to network, never cached
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;       // never touch other apps on this origin

  // Network-first for everything in our scope; cache is the offline fallback.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req.mode === 'navigate' ? './index.html' : req, res.clone());
      return res;
    } catch (e) {
      const hit = (await cache.match(req, { ignoreSearch: true })) ||
                  (req.mode === 'navigate' ? (await cache.match('./index.html')) || (await cache.match('./')) : null);
      if (hit) return hit;
      throw e;
    }
  })());
});
