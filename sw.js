// Bitácora del Arquero · service worker: permite instalarla y abrirla sin señal.
const VERSION = 'arquero-2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('arquero-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') return;
  const url = new URL(ev.request.url);
  if (url.origin !== location.origin) return;          // GitHub (Gist) y fuentes: siempre a la red
  // Primero la red, así una versión nueva se ve al tiro; sin señal, lo último guardado.
  ev.respondWith(fetch(ev.request)
    .then(res => { if (res.ok) { const copia = res.clone(); caches.open(VERSION).then(c => c.put(ev.request, copia)); } return res; })
    .catch(() => caches.match(ev.request).then(r => r || caches.match('./index.html'))));
});
