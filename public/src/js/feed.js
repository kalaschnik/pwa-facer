/* eslint-disable no-undef */
const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');
const videoPlayer = document.querySelector('#player');
const canvasElement = document.querySelector('#canvas');
const captureButton = document.querySelector('#capture-btn');
const imagePicker = document.querySelector('#image-picker');
const imagePickerArea = document.querySelector('#pick-image');
let picture;
const locationBtn = document.querySelector('#location-btn');
const locationLoader = document.querySelector('#location-loader');
let fetchedLocation = { lat: 0, lng: 0 };

// location
locationBtn.addEventListener('click', () => {
  // hide the button and show the spinner
  locationBtn.style.display = 'none';
  locationLoader.style.display = 'block';

  navigator.geolocation.getCurrentPosition((position) => {
    locationBtn.style.display = 'inline';
    locationLoader.style.display = 'none';
    fetchedLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    document.querySelector('#manual-location').classList.add('is-focused');
    locationInput.value = `Lat: ${fetchedLocation.lat}, Lng: ${fetchedLocation.lng}`;
  }, (reject) => {
    console.log('📋: reject', reject);
    locationBtn.display.style = 'inline';
    locationLoader.display.style = 'none';
    fetchedLocation = 0;
    const snackbarContainer = document.querySelector('#confirmation-toast');
    const data = { message: '🛑 Couldn’t retrieve your position...' };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
    fetchedLocation = { lat: 0, lng: 0 };
  }, { timeout: 7000 });
});

// hide button if geolocation is not in navigator
function initLocation() {
  if (!('geolocation' in navigator)) {
    locationBtn.style.display = 'none';
  }
}

function initMedia() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block';
    })
    .catch(() => {
      imagePickerArea.style.display = 'block';
    });
}

captureButton.addEventListener('click', () => {
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
  const context = canvasElement.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
  videoPlayer.srcObject.getVideoTracks().forEach((track) => {
    track.stop();
  });
  picture = dataURItoBlob(canvasElement.toDataURL());
});

// change listener gets trigger when a file was selected
imagePicker.addEventListener('change', (event) => {
  // destructur assignment, same as: picture = event.target.files[0]
  [picture] = event.target.files;
});

function openCreatePostModal() {
  setTimeout(() => {
    createPostArea.classList.add('visible');
  }, 1);

  // initialize Media Area (Camera)
  initMedia();

  initLocation();

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
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElement.style.display = 'none';
  locationBtn.style.display = 'inline';
  locationLoader.style.display = 'none';
  captureButton.style.display = 'inline';

  // stop camera stream
  if (videoPlayer.srcObject) {
    videoPlayer.srcObject.getVideoTracks().forEach(track => track.stop());
  }

  // closing the camera stream is taking resources so with this track the closing animations remains
  setTimeout(() => {
    createPostArea.classList.remove('visible');
  }, 1);
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

function analyzeImage() {
  const sourceImage = this.value.slice(4, -1).replace(/"/g, "");
  console.log(sourceImage);
  processImage(sourceImage);
}

function createCard(data) {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  const cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url(${data.image})`;
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  const analyzeFaceBtn = document.createElement('button');
  analyzeFaceBtn.setAttribute('value', cardTitle.style.backgroundImage);
  analyzeFaceBtn.onclick = analyzeImage;
  analyzeFaceBtn.className = 'mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--accent face-api';
  analyzeFaceBtn.innerHTML = '<i class="material-icons">center_focus_strong</i>';
  cardWrapper.appendChild(analyzeFaceBtn);
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
  const id = new Date().toISOString()
  const postData = new FormData();
  postData.append('id', id);
  postData.append('title', titleInput.value);
  postData.append('location', locationInput.value);
  postData.append('rawLocationLat', fetchedLocation.lat);
  postData.append('rawLocationLng', fetchedLocation.lng);
  postData.append('file', picture, `${id}.png`);

  fetch('https://us-central1-pwa-facer.cloudfunctions.net/storePostData', {
    method: 'POST',
    body: postData,
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
      picture,
      rawLocation: fetchedLocation,
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
