import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite HMR websocket connection errors when HMR is disabled in container
if (typeof window !== 'undefined') {
  const isWsError = (str: string) => {
    const s = (str || '').toLowerCase();
    return s.includes('websocket') || s.includes('failed to connect') || s.includes('closed without opened');
  };

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event?.reason;
      const msg = reason?.message || (typeof reason === 'string' ? reason : '') || String(reason || '');
      if (isWsError(msg)) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
        event.stopPropagation?.();
      }
    },
    { capture: true }
  );

  window.addEventListener(
    'error',
    (event) => {
      const msg = event?.message || String(event?.error?.message || '');
      if (isWsError(msg)) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
        event.stopPropagation?.();
      }
    },
    { capture: true }
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

