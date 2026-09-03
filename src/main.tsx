import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite HMR websocket connection errors when HMR is disabled in container
if (typeof window !== 'undefined') {
  const isWsError = (str: string) => {
    const s = (str || '').toLowerCase();
    return (
      s.includes('websocket') ||
      s.includes('failed to connect') ||
      s.includes('closed without opened') ||
      s.includes('vite') ||
      s.includes('unhandled rejection')
    );
  };

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event?.reason;
      const msg =
        reason?.message ||
        (typeof reason === 'string' ? reason : '') ||
        String(reason || '');
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

  // Clean up any Vite error overlay if it displays websocket warning
  const observer = new MutationObserver(() => {
    const overlays = document.querySelectorAll('vite-error-overlay');
    overlays.forEach((el) => {
      const text = el.shadowRoot?.textContent || el.textContent || '';
      if (isWsError(text)) {
        el.remove();
      }
    });
  });
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

