/* Service worker: offline app-shell cache + web-push handlers. */
const CACHE = 'wc26-v3';
const SHELL = [
  '/', '/matches.html', '/groups.html', '/teams.html', '/my.html',
  '/css/app.css', '/js/tw-config.js', '/js/api.js', '/js/follow.js',
  '/js/components.js', '/js/ui.js', '/js/live.js', '/js/push.js',
  '/icons/icon.svg', '/manifest.webmanifest',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // API: network-first (fresh scores), fall back to nothing (app handles errors)
  if (url.pathname.startsWith('/api/')) return;
  // Static shell: cache-first, then network
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const copy = res.clone();
      if (res.ok && url.origin === location.origin) caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => cached))
  );
});

// ---- Push ----
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch { data = { title: 'World Cup 2026', body: e.data && e.data.text() }; }
  const title = data.title || 'World Cup 2026';
  e.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    tag: data.matchId ? `m-${data.matchId}` : undefined,
    data: { url: data.url || '/my.html' },
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/my.html';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if (c.url.includes(url) && 'focus' in c) return c.focus(); }
    return clients.openWindow(url);
  }));
});
