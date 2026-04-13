const CACHE_NAME = 'sanchara-v2';
const STATIC_ASSETS = ['./'];

// Install: cache shell assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first with cache fallback
self.addEventListener('fetch', (e) => {
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request).then((r) => r || new Response('Offline', { status: 503 })))
  );
});
