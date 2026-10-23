/**
 * Peer Notebook - Progressive Web Application Service Worker
 * GA #8 Production Standards • Offline-First Field Cache
 * Domain: peernotebook.com
 */

const CACHE_NAME = 'peernotebook-v1.2.1-ga8';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

const isProductionDomain =
  self.location.hostname === 'peernotebook.com' ||
  self.location.hostname === 'www.peernotebook.com';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  if (!isProductionDomain) return;
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  if (!isProductionDomain) {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      }).then(() => {
        return self.registration.unregister();
      })
    );
    return;
  }
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Never intercept requests on preview, dev, or non-production domains
  if (!isProductionDomain) {
    return;
  }

  // Only handle GET requests, ignore API calls and non-http(s) schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Bypass service worker for /api telemetry endpoints, Vite dev paths, or query params
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/@vite') ||
    event.request.url.includes('/@fs') ||
    event.request.url.includes('?v=')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch from network in background to update cache (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Field offline mode - cached response already returned
          });
        return cachedResponse;
      }

      // Network first with cache fallback
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If offline and navigating to a page, return cached root/index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Network offline', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});
