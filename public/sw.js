importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

const CACHE_STATIC_NAME = 'static-v19';
const CACHE_DYNAMIC_NAME = 'dynamic-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/idb.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/favicon-16x16.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
];

function isInArray(string, array) {
  return array.map(e => e === string).filter(e => e === true).length === 1;
}

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
        return cache.addAll(APP_SHELL);
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
// self.addEventListener('fetch', (event) => {
//   // fetch is getting triggered when the app fetches something
//   // when assets get load (js), css, or images (img src)
//   // fonts, etc. 💡 Remember it is a network proxy
//   // or manually with a fetch request in App.js

//   // console.log('SW: Fetching something', event);
//   // you can overwrite what should happen with the response
//   // With this nothing happens (aka network only strategy)
//   // https://youtu.be/DtuJ55tmjps?t=126
//   // test with: event.respondWith(null);
//   // respondWith expects a promise, fetch is returning one
//   event.respondWith(
//     caches.match(event.request)
//     // if caches object found return use cache, else normal network
//     // https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker
//       .then((response) => {
//         if (response) { // checks if valid response, since response can also be null
//           return response;
//         }
//         // when there is no static cache, cache dynamically the input stream:
//         return fetch(event.request)
//           .then(res => caches.open(CACHE_DYNAMIC_NAME)
//             .then((cache) => {
//               // put(EventRequestURL, Store a Response clone)
//               cache.put(event.request.url, res.clone());
//               return res;
//             }))
//           // catching sw request errors
//           .catch(() => {
//             return caches.open(CACHE_STATIC_NAME)
//               .then((cache) => {
//                 return cache.match('/offline.html');
//               });
//           });
//       }),
//   );
// });

// // eslint-disable-next-line no-restricted-globals
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.open(CACHE_DYNAMIC_NAME)
//       .then(cache => fetch(event.request).then((response) => {
//         cache.put(event.request, response.clone());
//         return response;
//       })),
//   );
// });

// true cache then Network with offline support
// use cache for given url first
// then use general cache
// finally use network
// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', (event) => {
  const url = 'https://pwa-facer.firebaseio.com/posts.json';

  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(fetch(event.request)
      .then(function (res) {
        var clonedRes = res.clone();
        clearData('faces')
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            for (var key in data) {
              writeData('faces', data[key]);
            }
          });
        return res;
      })
    );
  } else if (isInArray(event.request.url, APP_SHELL)) {
    // if so use only the cache
    event.respondWith(caches.match(event.request));
  } else {
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
                cache.put(event.request.url, res.clone());
                return res;
              }))
            // catching sw request errors
            .catch(() => caches.open(CACHE_STATIC_NAME)
              .then((cache) => {
                // check if the request is for the help.html
                if (event.request.headers.get('accept').includes('text/html')) {
                  return cache.match('/offline.html');
                }
              }));
        }),
    );
  }
});
