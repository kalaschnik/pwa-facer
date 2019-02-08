// -------------------------------
// Service Worker Lifecycle Events
// -------------------------------

// install event will fire when the browser installs the sw
// you always get an event element from the lifecycle events
self.addEventListener('install', (event) => {
  console.log('SW: Installing', event);

  // caches open will open a give cache by name, if not found it will create it
  // since async nature make sure that we install sw first and then cache using event.waitUntil
  event.waitUntil(
    // caches is the overall cache storage
    caches.open('static')
      .then((cache) => {
        console.log('[sw.js] Precaching App Shell...');
        // other add methods: https://developer.mozilla.org/en-US/docs/Web/API/Cache#Methods
        return cache.addAll([
          '/index.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/src/images/main-image.jpg',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          // 'https://code.getmdl.io/1.3.0/material.blue_grey-red.min.css',
        ]);
      }),
  );
});

self.addEventListener('activate', (event) => {
  console.log('SW: Activated', event);
  // return self.clients.claim(); // this is only needed when activation fails...
});


// --------------------------
// Service Worker Fetch Event
// --------------------------
self.addEventListener('fetch', (event) => {
  // fetch is getting triggered when the app fetches somehting
  // when assests get load (js), css, or images (img src)
  // fonts, etc. 💡 Rember it is a network proxy
  // or manually with a fetch request in App.js

  // console.log('SW: Fetching something', event);
  // you can overwrite what should happen with the response
  // With this nothing happens (aka network only strategy)
  // https://youtu.be/DtuJ55tmjps?t=126
  // test with: event.respondWith(null);
  // respondWith expects a promise, fetch is returning one
  event.respondWith(
    caches.match(event.request)
      // if caches object found return use cache, else normal network
      // https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker
      .then(response => response || fetch(event.request)),
  );
});
