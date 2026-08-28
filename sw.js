const CACHE_NAME = 'elshamaa-v' + Date.now(); // استخدام التوقيت كإصدار لضمان التغيير
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  // أضف أي ملفات CSS أو صور أساسية هنا
];

// تثبيت الـ Service Worker ومسح الكاش القديم فوراً
self.addEventListener('install', event => {
  self.skipWaiting(); // إجبار النسخة الجديدة على التنشيط فوراً
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // السيطرة على الصفحة فوراً
});

// الاستراتيجية المعدلة: Network First لملف الـ HTML
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // لو النت تمام، خزن النسخة الجديدة في الكاش ورجعها
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request)) // لو مفيش نت، هات من الكاش
    );
    return;
  }

  // باقي الملفات (صور، أيقونات) نستخدم الاستراتيجية العادية
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// استقبال رسالة التحديث الإجباري
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
