// Service worker for the installable app. Pages always load from the network;
// only when the phone is offline do we show a small "you're offline" page.
// Supabase data is never cached here.
const CACHE = 'cm-offline-v1';
const OFFLINE = ['/offline.html', '/src/styles/main.css', '/src/icons.svg', '/icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(OFFLINE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return; // let the browser handle everything else normally
  e.respondWith(fetch(e.request).catch(() => caches.match('/offline.html')));
});
