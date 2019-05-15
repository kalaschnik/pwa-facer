import { log } from "util";

// idb.open(name, version, upgradeCallback)
// eslint-disable-next-line no-var
var dbPromise = idb.open('faces-store', 1, (upgradeDB) => {
  // check if objectStore is already there, if not create it
  if (!upgradeDB.objectStoreNames.contains('faces')) {
    upgradeDB.createObjectStore('faces', { keyPath: 'id' });
  }
});

function writeData(store, data) {
  return dbPromise
    .then((db) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(data);
      return tx.complete;
    });
}

function readData(store) {
  return dbPromise
    .then((db) => {
      const tx = db.transaction(store, 'readonly');
      const myStore = tx.objectStore(store);
      return myStore.getAll();
    });
}

function clearData(st) {
  return dbPromise
    .then((db) => {
      const tx = db.transaction(st, 'readwrite');
      const store = tx.objectStore(st);
      store.clear();
      return tx.complete;
    });
}

function deleteItemFromData(st, id) {
  return dbPromise
    .then((db) => {
      const tx = db.transaction(st, 'readwrite');
      const store = tx.objectStore(st);
      store.delete(id);
      return tx.complete;
    })
    .then(() => {
      console.log('Item deleted');
    });
}
