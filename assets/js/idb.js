/* ============================================================
   idb.js — tiny IndexedDB wrapper for storing file blobs locally
   ============================================================ */
window.IDB = (function () {
  'use strict';

  const DB_NAME = 'portfolio-files';
  const STORE = 'files';
  let dbPromise = null;
  let available = true;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        available = false;
        reject(new Error('IndexedDB not supported'));
        return;
      }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
    }).catch((err) => { available = false; throw err; });
    return dbPromise;
  }

  function tx(mode) {
    return open().then((db) => db.transaction(STORE, mode).objectStore(STORE));
  }

  function wrap(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  return {
    get available() { return available; },

    put(id, blob) {
      return tx('readwrite').then((s) => wrap(s.put({ id: id, blob: blob })));
    },
    get(id) {
      return tx('readonly').then((s) => wrap(s.get(id))).then((r) => (r ? r.blob : null));
    },
    del(id) {
      return tx('readwrite').then((s) => wrap(s.delete(id)));
    },
    keys() {
      return tx('readonly').then((s) => wrap(s.getAllKeys()));
    },
    clear() {
      return tx('readwrite').then((s) => wrap(s.clear()));
    }
  };
})();
