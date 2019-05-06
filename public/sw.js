const CACHE_STATIC_NAME = 'static-v7a';
const CACHE_DYNAMIC_NAME = 'dynamic-v3';

// -------------------------------
// Service Worker Lifecycle Events
// -------------------------------

// install event will fire when the browser installs the sw
// you always get an event element from the lifecycle events
// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', (event) => {
  console.log('SW: Installing...', event);

  // caches open will open a give cache by name, if not found it will create it
  // since async nature make sure that we install sw first and then cache using event.waitUntil
  event.waitUntil(
    // caches is the Cache API (as in DevTools -> Application -> Cache -> Cache Storage)
    caches.open(CACHE_STATIC_NAME)
      .then((cache) => {
        console.log('SW: Pre-caching App Shell...');
        // other add methods: https://developer.mozilla.org/en-US/docs/Web/API/Cache#Methods
        return cache.addAll([
          '/',
          '/index.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/favicon-16x16.png',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          // This is not working yet, we need dynamic caching:
          // 'https://code.getmdl.io/1.3.0/material.blue_grey-red.min.css',
        ]);
      }),
  );
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', (event) => {
  console.log('SW: Activated', event);
  console.log('Cleaning up old static cache...');

  event.waitUntil(
    caches.keys().then(keyList => Promise.all(
      keyList.map((key) => {
        if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
          console.log('SW: Removing old Cache', key);
          return caches.delete(key);
        }
        // else
        return null;
      }),
    )),
  );
  // return self.clients.claim(); // this is only needed when activation fails...
});

// --------------------------
// Service Worker Fetch Event
// --------------------------
// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', (event) => {
  // fetch is getting triggered when the app fetches something
  // when assets get load (js), css, or images (img src)
  // fonts, etc. 💡 Remember it is a network proxy
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
      .then((response) => {
        if (response) { // checks if valid response, since response can also be null
          return response;
        }
        // when there is no static cache, cache dynamically the input stream:
        return fetch(event.request)
          .then(res => caches.open(CACHE_DYNAMIC_NAME)
            .then((cache) => {
              // put(EventRequestURL, Store a Response clone)
              // cache.put(event.request.url, res.clone()); // turn of to demonstrate button cache
              return res;
            }))
          // catching sw request errors
          .catch(() => {
            // this helps to get warnings in sw.js
          });
      }),
  );
});
