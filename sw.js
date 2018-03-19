(function(){
  'use strict';

  const CACHE_NAME = 'restaurant-site-cache-v1';
  var contentImgsCache = 'restaurant-site-cache-imgs-v1';
  var allCaches = [
    CACHE_NAME,
    contentImgsCache
  ];
  const urlsToCache = [
    '/',
    '/css/styles.css',
    '/js/main.js',
    '/js/dbhelper.js',
    '/js/restaurant_info.js',
    '/index.html',
    '/restaurant.html',
    'error.html',
    '/data/restaurants.json'
  ];
  
  self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        })
    );
  });
  
  self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('restaurant-site-cache-') &&
                   !allCaches.includes(cacheName);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });
  
  self.addEventListener('fetch', function(event) {
   //
      event.respondWith(
          caches.open(CACHE_NAME).then(function(cache) {
            return cache.match(event.request).then(function(response) {
              let fetchPromise = fetch(event.request).then(function(networkResponse) {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              })
              return response || fetchPromise;
            })
        }).catch(function(error) {
          console.log('Error, ', error);
          return caches.match('error.html');
        })
      );
    });
  
  self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });

})();
