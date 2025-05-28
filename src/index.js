import { Buffer } from 'buffer';
window.Buffer = Buffer;

import process from 'process';
window.process = process;

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(reg => {
        console.log('✅ Custom service worker kaydedildi:', reg.scope);
      })
      .catch(err => {
        console.error('❌ Service worker kaydı başarısız:', err);
      });
  });
}

