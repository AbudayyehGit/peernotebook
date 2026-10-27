/**
 * Peer Notebook - Progressive Web Application Service Worker
 * GA #8 Production Standards • Network-First for Navigation • Offline-First for Assets
 * Domain: peernotebook.com & peernotebook.ai.studio
 */

const CACHE_NAME = 'peernotebook-v1.3.0-live';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

const isProductionDomain =
  self.location.hostname === 'peernotebook.com' ||
  self.location.hostname === 'www.peernotebook.com' ||
  self.location.hostname === 'peernotebook.ai.studio' ||
  self.location.hostname.endsWith('.ai.studio');

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
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log(`[SW] Purging outdated cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'PURGE_CACHE') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
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

  const isNavigation =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  // 1. NAVIGATION REQUESTS: Always Network-First so updates deploy instantly to peernotebook.com
  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If field network is offline, seamlessly fall back to cached index.html
          return caches.match('/index.html').then((cached) => {
            return (
              cached ||
              caches.match('/') ||
              new Response(
                '<!DOCTYPE html><html><head><title>Peer Notebook - Offline</title></head><body><h1>Field Offline Mode</h1><p>Peer Notebook is available offline. Please reload or check your local notes.</p></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              )
            );
          });
        })
    );
    return;
  }

  // 2. STATIC ASSETS & FILES: Stale-While-Revalidate with Cache Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failure is expected in offline field mode
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
