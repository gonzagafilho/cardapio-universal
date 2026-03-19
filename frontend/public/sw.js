/* PWA Service Worker - cache versionado, offline, sem cache de rotas sensíveis */
var CACHE_VERSION = 'v2';
var CACHE_NAME = 'cardapio-pwa-' + CACHE_VERSION;

var PRECACHE_URLS = [
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

var SENSITIVE_SEGMENTS = ['/checkout', '/order/', '/success', '/failure', '/cart'];

function isSensitivePath(url) {
  var path = new URL(url).pathname;
  return SENSITIVE_SEGMENTS.some(function (seg) {
    return path === seg || path.indexOf(seg) !== -1;
  });
}

function shouldNotCache(url) {
  var u = new URL(url);
  if (u.pathname.indexOf('/api') !== -1) return true;
  if (u.pathname.indexOf('/_next/static/') !== -1) return true;
  if (u.origin !== self.location.origin) return true;
  return isSensitivePath(url);
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key.startsWith('cardapio-pwa-') && key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  var url = event.request.url;

  if (shouldNotCache(url)) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function () {
        return caches.match('/offline.html');
      })
    );
    return;
  }

  var path = new URL(url).pathname;
  // Só cacheamos assets realmente seguros para offline (manifest/icons/offline.html).
  // Não cacheamos `/_next/static/` para evitar mismatch de bundles em deploys futuros.
  var isStatic =
    path === '/manifest.json' ||
    path === '/icon-192.png' ||
    path === '/icon-512.png' ||
    path === '/offline.html';

  if (isStatic) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        return fetch(event.request).then(function (res) {
          if (res && res.status === 200 && res.type === 'basic') {
            var clone = res.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, clone);
            });
          }
          return res;
        });
      })
    );
  }
});
