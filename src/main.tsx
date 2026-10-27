import { createRoot } from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App.tsx';
import { FieldErrorBoundary } from './components/FieldErrorBoundary.tsx';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <FieldErrorBoundary>
      <App />
      <SpeedInsights />
    </FieldErrorBoundary>
  );
}

// Progressive Web App (PWA) Service Worker Strategy
// Strictly register only on live production peernotebook.com. Everywhere else (dev server,
// cloud preview iframes, run.app), aggressively unregister and clear caches to ensure pristine instant render.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const isProduction =
    window.location.hostname === 'peernotebook.com' ||
    window.location.hostname === 'www.peernotebook.com';

  if (!isProduction) {
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
        .catch(() => {});
    });
  }
}
