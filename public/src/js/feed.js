/* eslint-disable no-undef */
const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');

function openCreatePostModal() {
  createPostArea.classList.add('visible');


  // add Prompt to install to homescreen here
  if (deferredPrompt) {
    // this will show the banner
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome);

      if (choiceResult === 'dismissed') {
        console.log('User ecanceled installation!');
      } else {
        console.log('User added to home screen');
      }
    });
    // set it to null, since you only can use it once
    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.classList.remove('visible');
}

// event listener for the + button to open the modal
shareImageButton.addEventListener('click', openCreatePostModal);
// event listner for the × button to close the modal
closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  const cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url(${data.image})`;
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  const cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  const cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  data.map(e => createCard(e));
}

const url = 'https://pwa-facer.firebaseio.com/posts.json';
let networkDataReceived = false;

// network request
fetch(url)
  .then(res => res.json())
  .then((data) => {
    networkDataReceived = true;
    console.log('From web: ', data);
    updateUI(Object.values(data));
  });

// if network fetch fails use indexedDB:
if ('indexedDB' in window) {
  readAllData('posts')
    .then((data) => {
      if (!networkDataReceived) {
        console.log('From cache', data);
        updateUI(data);
      }
    });
}

// helper function to send data directly to the server
function sendData() {
  fetch('https://us-central1-pwa-facer.cloudfunctions.net/storePostData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image: 'https://firebasestorage.googleapis.com/v0/b/pwa-facer.appspot.com/o/profilepic.jpg?alt=media&token=6a937559-b1eb-42d1-a80f-359a09f7f4bd',
    }),
  })
    .then((res) => {
      console.log('Sent data', res);
      updateUI();
    });
}

// 💡 NOTE: Since there is no DOM access in the sw file...
// ... you cannot listen to the form submission. Therefore ...
// ... we trigger the sync event here in the feed.js
// submit new face/post
form.addEventListener('submit', (event) => {
  // cancel the default submit behaviour
  event.preventDefault();
  closeCreatePostModal();

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    // what you want to store
    const post = {
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
    };

    // check if sw is installed and ready
    navigator.serviceWorker.ready
      .then((sw) => {
        // 💡 the sync manger has no build in database, thats why we use IndexedDB with writeData
        // in what objects store you want to store the data.
        // returns a promise, when data was successfully written into IndexedDB
        writeData('sync-posts', post)
          // then you can register the sync event with a tag (sync-new-posts)
          .then(() => sw.sync.register('sync-new-posts'))
          .then(() => {
            const snackbarContainer = document.querySelector('#confirmation-toast');
            const data = { message: '💾 Your post was saved for syncing!' };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch(err => console.log(err));
      });
  } else {
    // if there is no service worker AND SyncManager available send data directly without sync event
    sendData();
  }
});
