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


// PUSH NOTIFICATIONS
const enableNotificationButtons = document.querySelectorAll('.enable-notifications');
const resetNotificationsButton = document.querySelectorAll('.reset-notifications');

// Check current permission status and disable buttons if they are already given
if (Notification.permission === 'granted') {
  enableNotificationButtons.forEach((e) => {
    e.textContent = 'Notifications ✔';
    e.disabled = true;
  });
  resetNotificationsButton.forEach((e) => {
    e.style.display = 'inline-block';
  });
}

if (Notification.permission === 'denied') {
  enableNotificationButtons.forEach((e) => {
    e.textContent = 'Notifications 🚫';
    e.disabled = true;
  });
}

function displayConfirmNotification() {
  if ('serviceWorker' in navigator) {
    const options = {
      body: 'You successfully subscribed to the notification service. Whenever there are new functionality, or other information you’ll be informed',
      icon: '/src/images/icons/logo-96.png',
      image: '/src/images/pwa-facer-header-logo.png',
      vibrate: [100, 50, 200], // vibration, pause, vibration, pause, ... in ms
      badge: '/src/images/icons/logo-48.png', // this should be actually smaller, google it.
      // tag: 'confirm-notification', // group-acting, no stack, which avoids spamming the user
      // renotify: false, // new notifications with the same tag wont vibrate
      actions: [
        { action: 'coffee', title: '☕', icon: '/src/images/icons/logo-48.png' },
        { action: 'cake', title: '🎂', icon: '/src/images/icons/logo-48.png' },
      ],
    };

    navigator.serviceWorker.ready
      .then((swreg) => {
        swreg.showNotification('☁: Subscribed to PWA Facer updates!', options);
      });
  }
}

// configure push subscription
function configurePushSub(params) {
  var reg;
  // reacht out to the service worker
  navigator.serviceWorker.ready
    .then((swreg) => {
      reg = swreg;
      // check the push manager and check for existing subscriptions
      return swreg.pushManager.getSubscription();
    })
    // the pushmanager checks subscription for the used device & browser
    .then((sub) => {
      // in case there are no subscription, create a new one
      if (sub === null) {
        // Create a new subscription
        const vapidPublicKey = 'BLAMNNT7ZVqY8gEMERILY7CvnOwvt00wWAtiB_N4zy-MEoWUqgpOgS6_R0D2z53oP9XInhLg1DZvlbg3j9WRqfc';
        const convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey,
        });
      }
    })
    .then((newSub) => {
      // create a new subscription’s node in firebase database and insert the newSub there
      return fetch('https://pwa-facer.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newSub),
      });
    })
    .then((subRes) => {
      if (subRes.ok) {
        displayConfirmNotification();
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function askForNotificationPermission() {
  // If the browser ask notification permission, it implicitly asks also for push permissions
  Notification.requestPermission((result) => {
    console.log('User choice:', result);

    // check if result failed
    if (result !== 'granted') {
      console.log('No notification permission granted!');
      enableNotificationButtons.forEach((e) => {
        e.textContent = 'Notifications 🚫';
        e.disabled = true;
      });
    } else {
      console.log('Notification permission granted!');
      enableNotificationButtons.forEach((e) => {
        e.textContent = 'Notifications ✔';
        e.disabled = true;
      });
      resetNotificationsButton.forEach((e) => {
        e.style.display = 'inline-block';
      });

      // show a notification
      // displayConfirmNotification();
      // Since the user allowed notifications we can now configure the push subscription
      configurePushSub();
    }
  });
}

// Check if browser supports Notification API
if ('Notification' in window && 'serviceWorker' in navigator) {
  // show the Enable Notifications Button
  enableNotificationButtons.forEach((e) => {
    e.style.display = 'inline-block';
    e.addEventListener('click', askForNotificationPermission);
  });
}

// todo revoke permission
