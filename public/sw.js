/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

const CACHE_STATIC_NAME = 'static-v106';
const CACHE_DYNAMIC_NAME = 'dynamic-v3';
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/utility.js',
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
self.addEventListener('fetch', (event) => {
  const url = 'https://pwa-facer.firebaseio.com/posts.json';

  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(fetch(event.request)
      .then((res) => {
        const clonedRes = res.clone();
        clearAllData('posts')
          .then(() => clonedRes.json())
          .then((data) => {
            Object.values(data).forEach((e) => {
              writeData('posts', e);
            });
          });
        // return the actual response
        return res;
      }));
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
                // TODO return a default 404 site
              }));
        }),
    );
  }
});

// the sync event listener will fire when connection is re-established
// ... or it just fires immediately as soon as a new sync task was registered
self.addEventListener('sync', (event) => {
  console.log('👷: Background syncing', event);
  // the event.tag corresponds with the name you registered (sw.sync.register('sync-new-posts'))
  if (event.tag === 'sync-new-posts') {
    console.log('👷: Syncing new Posts');
    event.waitUntil(
      // read all post that were stored in sync-posts by feed.js
      readAllData('sync-posts')
        // handle the response data
        .then((data) => {
          // loop over every item in the object store and POST it to the server
          data.forEach((e) => {

            // allows to send form data to a backend through ajax/fetch
            const postData = new FormData();
            postData.append('id', e.id);
            postData.append('title', e.title);
            postData.append('location', e.location);
            postData.append('rawLocationLat', e.rawLocation.lat);
            postData.append('rawLocationLng', e.rawLocation.lng);
            postData.append('file', e.picture, `${e.id}.png`);

            // here we are using our Firebase endpoint API
            fetch('https://us-central1-pwa-facer.cloudfunctions.net/storePostData', {
              method: 'POST',
              body: postData,
            })
              .then((res) => {
                console.log('☁ Sent data', res);
                // data entry was sent, and if the res is ok (200–299) clean the entry ...
                // ... from sync-posts store
                if (res.ok) {
                  // extract the id from the response
                  res.json()
                    .then((resData) => {
                      console.log(resData.id);
                      deleteItemFromData('sync-posts', resData.id);
                    });
                }
              })
              .catch((err) => {
                console.log('⚡ Error while sending data', err);
              });
          });
        }),
    );
  }
});


// react to actions notifications
self.addEventListener('notificationclick', (event) => {
  // grab the notification
  const { notification } = event;
  const { action } = event;

  if (action === 'coffee') {
    console.log('Coffee was chosen.');
    notification.close();
  } else {
    console.log(action);
    event.waitUntil(clients.matchAll()
      .then((clis) => {
        const client = clis.find(c => c.visibilityState === 'visible');

        if (client !== undefined) {
          client.navigate(notification.data.url);
          client.focus();
        } else {
          clients.openWindow(notification.data.url);
        }

        notification.close();
      }));
  }
});

// react to close event (swipe away, click x, etc.)
self.addEventListener('notificationclose', (event) => {
  console.log('Notification was closed!', event);
});


// listen to push events coming from servers
self.addEventListener('push', (event) => {
  console.log('Push Message received!');

  let data = { title: 'Dummy Title', content: 'Dummy Body', openURL: '/' };
  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  const options = {
    body: data.content,
    icon: '/src/images/icons/logo-96.png',
    badge: '/src/images/icons/logo-96.png',
    data: {
      url: data.openURL,
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
