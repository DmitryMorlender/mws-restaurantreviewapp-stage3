
importScripts('/js/dbhelper.js');
importScripts('/js/idb.js');

(function(){
  'use strict';

  const CACHE_NAME = 'restaurant-site-cache-v1';
  var contentImgsCache = 'restaurant-site-cache-imgs-v1';
  const REVIEWS_CACHE = 'reviews-site-cache-v1';

  var allCaches = [
    CACHE_NAME,
    contentImgsCache,
    REVIEWS_CACHE
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
  
  var submitReview = () => {

    DBHelper.getReviewsFromDB().then(function(reviews) {
      // send the messages

      Promise.all(reviews.map(function(review){
        return fetch("http://localhost:1337/reviews/", {
          body: JSON.stringify(review), // must match 'Content-Type' header
          method: 'POST', // *GET, POST, PUT, DELETE, etc
        })
        .then((response) => {
        
          const succeeded = response.ok;
          if(succeeded){
            return response.json();
          }
          
          return { faild : true };

        }).then((res) => {
          console.log('submission succeeded');
          const success = res.createdAt;

          if (success) {
            return DBHelper.getReviewsDB().then(function(db){
              return db.transaction('reviews', 'readwrite').objectStore('reviews').delete(review.id);
              
              }).catch(function(err){
              console.log('Delete from review DB failed. ' + err);
            });
          }
          
        }).catch((resp) => {
          console.log('submission FAILEDDD');
        });
        
      }));

      

    }).catch(function(err) { console.error(err); });




    
  }

  self.addEventListener('sync', function(event) {
    if (event.tag == 'review-submission') {
      event.waitUntil(submitReview());
    }
  });

  

  self.addEventListener('fetch', function(event) {
   // 

   var requestUrl = new URL(event.request.url);
   
   
   if(requestUrl.pathname.startsWith('/reviews/')){
    console.log(requestUrl + ' ' + event.request.method);

    if(event.request.method == 'GET'){
      event.respondWith(
        caches.open(REVIEWS_CACHE).then(function(cache) {
          return cache.match(event.request).then(function(response) {
            let fetchPromise = fetch(event.request).then(function(networkResponse) {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            }).catch(function(response){
              console.log(response);
            });
            return fetchPromise || response;
          }).catch(function(error){
            console.log('Fetch Error: , ', error);
          });
      }).catch(function(error) {
        console.log('Error, ', error);
      })
    );
    }
    
    
  }
     if (requestUrl.origin === location.origin) {
  
      
        event.respondWith(
            caches.open(CACHE_NAME).then(function(cache) {
              return cache.match(event.request).then(function(response) {
                let fetchPromise = fetch(event.request).then(function(networkResponse) {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                }).catch(function(response){
                  console.log(response);
                });
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
