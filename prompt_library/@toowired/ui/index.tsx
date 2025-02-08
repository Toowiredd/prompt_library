/**
 * Application Entry Point
 * Created: 2025-02-08 11:08:42 UTC
 * Author: @toowired
 */

import { render } from 'npm:solid-js/web';
import { App } from './app';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registered:', registration);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}

render(() => <App />, document.getElementById('root')!);