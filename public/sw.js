self.addEventListener('install', event => {
  console.log('SW: Installing', event);
});

self.addEventListener('activate', event => {
  console.log('SW: Activated', event);
  // return self.clients.claim(); // this is only needed when activation fails...
});

self.addEventListener('fetch', event => {
  // fetch is getting triggered when the app fetches somehting 
  // when assests get load (js), css, or images (img src) 
  // or manually with a fetch request in App.js

  // fetch is like a network proxy => every outgoing fetch request goes through the sw, and so does the response
  // e.g., you can check if internet conenction is available
  console.log('SW: Fetching something', event);
  event.respondWith(fetch(event.request));

});