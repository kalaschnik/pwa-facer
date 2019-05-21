const functions = require('firebase-functions');
const admin = require('firebase-admin'); // access the firebase database
const cors = require('cors')({ origin: true }); // set the right headers for cross origin access
const webpush = require('web-push');
const serviceAccount = require('./pwa-facer-firebase-key.json');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// setup admin credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwa-facer.firebaseio.com/',
});

// This creates and API endpoint you can use to store image date
// functions give you access to firebase’s functions
// https.onRequest is an incomming (to the server) https request
// when a request is send to storePostData the functions gets executed
exports.storePostData = functions.https.onRequest((request, response) => {
  // response.send('Hello from Firebase!');
  // wrap all in cors so headers are set corretly
  cors(request, response, () => {
    // access the database
    admin.database().ref('posts').push({
      id: request.body.id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image,
    })
      .then(() => {
        // setup push notification
        webpush.setVapidDetails('mailto: steven.kalinke@outlook.com', 'BLAMNNT7ZVqY8gEMERILY7CvnOwvt00wWAtiB_N4zy-MEoWUqgpOgS6_R0D2z53oP9XInhLg1DZvlbg3j9WRqfc', 'UZAYTYILEX7rx_1AwdhWdwpQTz_riUKs4TP-9X0rdlA');
        // fetch subscription devices/browsers:
        return admin.database().ref('subscriptions').once('value');
      })
      .then((subscriptions) => {
        // send push messages
        subscriptions.forEach((sub) => {
          const pushConfig = {
            endpoint: sub.val().endpoint,
            keys: {
              auth: sub.val().keys.auth,
              p256dh: sub.val().keys.p256dh,
            },
          };
          webpush.sendNotification(pushConfig, JSON.stringify({
            title: 'New Post',
            content: 'New Post added',
            openURL: '/help',
          }))
            .catch((err) => {
              console.log(err);
            })
        });
        response.status(201).json({ message: 'Data stored', id: request.body.id });
      })
      .catch((err) => {
        response.status(500).json({ error: err });
      });
  });
});
