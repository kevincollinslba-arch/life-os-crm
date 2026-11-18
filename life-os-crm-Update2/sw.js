// LifeOS CRM Service Worker for Standalone App / Network First
const CACHE_NAME = 'lifeos-crm-v2';
const ASSETS = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Always try live network first so data & updates are instant; fallback to cache if offline
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
