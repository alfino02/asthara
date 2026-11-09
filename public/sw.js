// PT ASTHARA PWA Service Worker v2 (Resilient & Skew-Protected)
const CACHE_NAME = 'asthara-pwa-v2';

// Precache ONLY static unchanging assets (NEVER precache '/' dynamic HTML or Next chunks)
const PRECACHE_ASSETS = [
  '/manifest.webmanifest',
  '/manifest.json',
  '/logos/nabila.png',
  '/logos/piknik.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
    );
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET requests and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // 2. CRITICAL: NEVER intercept Next.js chunks, data routes, or RSC payloads!
  // Next.js and Vercel handle immutable version hashing directly.
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.searchParams.has('_rsc')
  ) {
    return;
  }

  // 3. Navigation requests (HTML documents): Always NETWORK FIRST with graceful fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If valid response, return immediately (don't force-cache root HTML to avoid chunk skew)
          return response;
        })
        .catch(async () => {
          // Only if network is completely down (offline)
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(request);
          if (cached) return cached;
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline - Asthara Trip</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;background:#020617;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;text-align:center;"><div><h2>Koneksi Terputus</h2><p style="color:#94a3b8">Aplikasi sedang dalam mode offline. Silakan periksa koneksi internet Anda dan tekan muat ulang.</p><button onclick="window.location.reload()" style="margin-top:16px;background:#ea580c;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:bold;cursor:pointer;">Muat Ulang</button></div></body></html>',
            {
              headers: { 'Content-Type': 'text/html' },
              status: 503,
            }
          );
        })
    );
    return;
  }

  // 4. Static assets (images, icons, manifest): Cache-first with safe network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Return generic error response instead of undefined to avoid FetchEvent fatal error
          return new Response('Asset unavailable offline', {
            status: 404,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    })
  );
});
