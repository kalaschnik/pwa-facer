if ('serviceWorker' in navigator) {
  navigator.serviceWorker
  .register('/sw.js', /* {scope: './'} */)
  .then(() => {
    console.log("Service Worker registered!");
  }).catch((error) => {
    document.querySelector('#status').textContent = error;
  });
} else {
  // Service Worker are not supported
  console.log("Service Workers are not supported");
}