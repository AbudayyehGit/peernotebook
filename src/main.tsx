import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { FieldErrorBoundary } from './components/FieldErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <FieldErrorBoundary>
    <App />
  </FieldErrorBoundary>
);
