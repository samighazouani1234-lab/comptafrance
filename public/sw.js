// ComptaFrance — service worker : rend l'application installable et garde l'interface disponible hors ligne.
// Les données (Supabase) ne sont jamais mises en cache.
const CACHE = 'comptafrance-v1'
const SHELL = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', e => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return
  if (req.mode === 'navigate') {
    // page : réseau d'abord, version en cache si hors ligne
    e.respondWith(fetch(req).then(res => { caches.open(CACHE).then(c => c.put('/', res.clone())); return res }).catch(() => caches.match('/')))
    return
  }
  if (url.pathname.startsWith('/assets/') || SHELL.includes(url.pathname)) {
    // fichiers de l'application (noms versionnés) : cache d'abord
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res })))
  }
})
