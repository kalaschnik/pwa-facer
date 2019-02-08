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
    caches.open('static')
      .then((cache) => {
        console.log('[sw.js] Precaching App Shell...');
        // other add methods: https://developer.mozilla.org/en-US/docs/Web/API/Cache#Methods
        cache.add('/src/js/app.js');
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
  event.respondWith(fetch(event.request));
});
