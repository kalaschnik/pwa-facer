// -----------------------
// Register Service Worker
// -----------------------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js') // path pointing to the sw. 💡 register (async) returns a promise
    .then(console.log('SW registered!!'))
    .catch(err => console.log('Boo!', err));
} else {
  // Service Worker are not supported
  console.log('Service Workers are not supported');
}


// make a global variable, since we want to use it in feed.js
let deferredPrompt;

// catch the add to homescreen prompt and re-define it
window.addEventListener('beforeinstallprompt', (bannerevent) => {
  console.log('beforeinstallprompt fired');
  // the banner simply wont show with this:
  bannerevent.preventDefault();

  // store the banner event, we will use it in feed.js
  deferredPrompt = bannerevent;
  return false;
});
