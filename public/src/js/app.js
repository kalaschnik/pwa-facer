// make a global variable, since we want to use it in feed.js
var deferredPrompt;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered!!', reg))
    .catch(err => console.log('Boo!', err));
} else {
  // Service Worker are not supported
  console.log("Service Workers are not supported");
}

// catch the add to homescreen prompt and re-define it
window.addEventListener("beforeinstallprompt", bannerevent => {

  // the banner simply wont show with this:
  console.log("beforeinstallprompt fired");
  bannerevent.preventDefault();

  deferredPrompt = bannerevent;
  return false;

});