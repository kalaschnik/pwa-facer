// -----------------------
// Register Service Worker
// -----------------------

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('Registration successful, scope is:', registration.scope);
    })
    .catch((error) => {
      console.log('Service worker registration failed, error:', error);
    });
}

// make a global variable, since we want to use it in feed.js
// eslint-disable-next-line no-unused-vars
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
