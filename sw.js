const CACHE_NAME = 'elshamaa-pwa-v10'; // (1) قم برفع رقم الإصدار لكل تحديث جديد

const urlsToCache = [
  '/break-./',
  '/break-./index.html',
  '/break-./manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // (2) مهم جداً: يأمر العامل الجديد بتركيب نفسه فوراً بدلاً من الانتظار
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    })
  );
  
  // (3) السحر كله هنا: يطلب من العميل (الصفحة) استخدام النسخة الجديدة فوراً
  return self.clients.claim(); 
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
