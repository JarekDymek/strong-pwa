const CACHE_NAME = 'strongman-pwa-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './css/main.css',
  './js/main.js',
  './manifest.json',
  './images/icon-192.png',
  './images/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).then(fetchRes => {
        // cache new GET responses (best-effort)
        const resClone = fetchRes.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return fetchRes;
      }).catch(() => {
        // fallback to offline page or icon if needed
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
