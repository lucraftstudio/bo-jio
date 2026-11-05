const offlinePage = new URL('offline.html', self.registration.scope).href;
const prefix = 'bo-jio-offline:' + self.registration.scope + ':';
const cacheName = prefix + '1';

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.add(offlinePage)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(prefix) && key !== cacheName).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate' ||
      !event.request.url.startsWith(self.registration.scope)) return;
  event.respondWith(fetch(event.request).catch(async () => {
    const fallback = await (await caches.open(cacheName)).match(offlinePage);
    return fallback ?? Response.error();
  }));
});
