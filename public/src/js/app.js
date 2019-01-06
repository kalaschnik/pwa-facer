if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered!', reg))
    .catch(err => console.log('Boo!', err));
} else {
  // Service Worker are not supported
  console.log("Service Workers are not supported");
}