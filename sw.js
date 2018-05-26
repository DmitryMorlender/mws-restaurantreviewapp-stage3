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
    'dist/css/styles.min.css',
    'js/main.js',
    'js/idb.js',
    'js/dbhelper.js',
    'js/restaurant_info.js',
    '/index.html',
    '/restaurant.html',
    '/error.html',
    'dist/img/1.webp',
    'dist/img/1-600w.webp',
    'dist/img/2.webp',
    'dist/img/2-600w.webp',
    'dist/img/3.webp',
    'dist/img/3-600w.webp',
    'dist/img/4.webp',
    'dist/img/4-600w.webp',
    'dist/img/5.webp',
    'dist/img/5-600w.webp',
    'dist/img/6.webp',
    'dist/img/6-600w.webp',
    'dist/img/7.webp',
    'dist/img/7-600w.webp',
    'dist/img/8.webp',
    'dist/img/8-600w.webp',
    'dist/img/9.webp',
    'dist/img/9-600w.webp',
    'dist/img/10.webp',
    'dist/img/10-600w.webp',
    'dist/img/default-image_450-300w.webp',
    'dist/img/default-image_450-600w.webp',
    'dist/img/google_static.png'
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

   var requestUrl = new URL(event.request.url);
   
   
     if (requestUrl.origin === location.origin) {
  
        event.respondWith(
            caches.open(CACHE_NAME).then(function(cache) {
              return cache.match(event.request).then(function(response) {
                let fetchPromise = fetch(event.request).then(function(networkResponse) {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                })
                return response || fetchPromise;
              }).catch(function(error){
                console.log('Fetch Error: , ', error);
                return caches.match('/error.html');
              });
          }).catch(function(error) {
            console.log('Error, ', error);
            return caches.match('/error.html');
          })
        );
      }

      return;
    });
  
  self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });

})();
