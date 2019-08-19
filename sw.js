'use strict';

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');
if (workbox) {
    console.log('Workbox is loaded');
    workbox.precaching.precacheAndRoute([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "firebase.json",
    "revision": "eba4c1149475e78daca63e518b923b72"
  },
  {
    "url": "images/ic_add_white_24px.svg",
    "revision": "c3379830302abe84f64db87b5bac9faa"
  },
  {
    "url": "images/ic_refresh_white_24px.svg",
    "revision": "f73272d4efd233a85e8c649d26126f01"
  },
  {
    "url": "images/install.svg",
    "revision": "c5de4912fe021bbefb235b1ff4ebb455"
  },
  {
    "url": "images/metro-de-transporte-publico-128.png",
    "revision": "5d54b197e5efa27e5146cf1292f7fc04"
  },
  {
    "url": "images/metro-de-transporte-publico-24.png",
    "revision": "0bde8877459acfeeaad7d005bc2226cc"
  },
  {
    "url": "images/metro-de-transporte-publico-512.png",
    "revision": "e070ad9294bb762a79b2ff4570c58547"
  },
  {
    "url": "index.html",
    "revision": "69ee8caa003d478f0708051dad2b0a87"
  },
  {
    "url": "manifest.json",
    "revision": "51c4c228ec9236d9b7cb4a0ad7fe87bc"
  },
  {
    "url": "scripts/app.js",
    "revision": "c081576f6ff313d444cd9029afbf0e20"
  },
  {
    "url": "scripts/idb.js",
    "revision": "9fd0062db6d0f49a4cbe20eedd4c4e12"
  },
  {
    "url": "scripts/install.js",
    "revision": "12ad8539504917f2d5f4a46003c9b6b1"
  },
  {
    "url": "service-worker.js",
    "revision": "39a9e57f98c099dcbe33056ad717fb43"
  },
  {
    "url": "styles/inline.css",
    "revision": "9f83ccf167f9333374d9902f4051a548"
  },
  {
    "url": "workbox-config.js",
    "revision": "51e8dcd2bc078521af3822a60f6f0203"
  }
]);
    workbox.routing.registerRoute(
      /\.js$/,
      new workbox.strategies.NetworkFirst(
          {
              cacheName: 'javascript-cache',
          }
      )
    );
    workbox.routing.registerRoute(
      // Cache CSS files.
      /\.css$/,
      // Use cache but update in the background.
      new workbox.strategies.NetworkFirst({
        // Use a custom cache name.
        cacheName: 'styles-cache',
      })
    );
    workbox.routing.registerRoute(
      // Cache image files.
      /\.(?:png|jpg|jpeg|svg|gif)$/,
      // Use the cache if it's available.
      new workbox.strategies.CacheFirst({
        // Use a custom cache name.
        cacheName: 'images-cache',
        plugins: [
          new workbox.expiration.Plugin({
            // Cache only 20 images.
            maxEntries: 20,
            // Cache for a maximum of a week.
            maxAgeSeconds: 7 * 24 * 60 * 60,
          })
        ],
      })
    );
    const CACHE_NAME = 'static-cache-v1';
    const DATA_CACHE_NAME = 'data-cache-v1';
    // CODELAB: Update cache names any time any of the cached files change.
    const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/scripts/app.js',
    '/scripts/install.js',
    '/styles/inline.css',
    '/images/ic_add_white_24px.svg',
    '/images/ic_refresh_white_24px.svg',

];
  
self.addEventListener('install', (evt) => {
    console.log('[ServiceWorker] Install');
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching offline page');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
    console.log('[ServiceWorker] Activate');
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
    console.log('[ServiceWorker] Fetch', evt.request.url);
    var dataUrl = 'https://api-ratp.pierre-grimaud.fr/v3/schedules';
    // CODELAB: Add fetch event handler here.
    if (evt.request.url.includes(dataUrl)) {
        console.log('[Service Worker] Fetch (data)', evt.request.url);
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return fetch(evt.request)
                    .then((response) => {
                        // If the response was good, clone it and store it in the cache.
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }
                        return response;
                    }).catch((err) => {
                        // Network request failed, try to get it from the cache.
                        return cache.match(evt.request);
                    });
            }));
        return;
    }
    evt.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(evt.request)
                .then((response) => {
                    return response || fetch(evt.request);
                });
        })
    );
});
