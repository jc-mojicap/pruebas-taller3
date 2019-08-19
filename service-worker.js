'use strict';

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');
if (workbox) {
    console.log('Workbox is loaded');
    workbox.precaching.precacheAndRoute([
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
}
