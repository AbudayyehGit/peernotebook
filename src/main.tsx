import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { FieldErrorBoundary } from './components/FieldErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <FieldErrorBoundary>
    <App />
  </FieldErrorBoundary>
);

// Register Progressive Web App (PWA) Service Worker for offline field resilience
if ('serviceWorker' in navigator && (import.meta.env.PROD || window.location.hostname === 'peernotebook.com')) {
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

