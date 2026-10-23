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
// In development & cloud preview iframes, unregister existing service workers to avoid stale caching & blank screens
if ('serviceWorker' in navigator) {
  const isDevHost =
    import.meta.env.DEV ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.run.app') ||
    window.location.port === '3000';

  if (isDevHost) {
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
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] ServiceWorker registration failed:', error);
        });
    });
  }
}
