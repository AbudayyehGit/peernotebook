import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { FieldErrorBoundary } from './components/FieldErrorBoundary.tsx';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <FieldErrorBoundary>
      <App />
    </FieldErrorBoundary>
  );
}

// Progressive Web App (PWA) Service Worker Strategy
// Supports instant synchronization between peernotebook.com and peernotebook.ai.studio.
// Automatically activates waiting workers and avoids stale caches on live deployments.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const isProduction =
    window.location.hostname === 'peernotebook.com' ||
    window.location.hostname === 'www.peernotebook.com' ||
    window.location.hostname === 'peernotebook.ai.studio' ||
    window.location.hostname.endsWith('.ai.studio');

  const isLocalDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.run.app');

  if (isLocalDev) {
    // In local dev and temporary cloud-run containers, unregister any lingering service workers
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});

    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key).catch(() => {});
        }
      }).catch(() => {});
    }
  } else if (isProduction) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Check for service worker updates on page load
          registration.update().catch(() => {});

          // If a new worker is waiting, tell it to take over immediately
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New update installed; activate immediately
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });
        })
        .catch(() => {});

      // When the service worker controlling the page changes, refresh to get newest bundle
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}
