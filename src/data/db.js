// Minimal native IndexedDB wrapper. No library — object URLs alone don't
// survive a page reload and localStorage can't hold binary blobs, so photo
// bytes and wall JSON both live here instead.

const DB_NAME = 'curate-db'
const DB_VERSION = 1
const PHOTO_STORE = 'photoBlobs'
const WALL_STORE = 'walls'

let dbPromise = null

function openDB() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(WALL_STORE)) {
        db.createObjectStore(WALL_STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function tx(db, storeName, mode) {
  const transaction = db.transaction(storeName, mode)
  return transaction.objectStore(storeName)
}

function wrap(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function putPhotoBlob(id, blob, aspectRatio) {
  const db = await openDB()
  const store = tx(db, PHOTO_STORE, 'readwrite')
  await wrap(store.put({ id, blob, aspect_ratio: aspectRatio }))
}

export async function getPhotoBlob(id) {
  const db = await openDB()
  const store = tx(db, PHOTO_STORE, 'readonly')
  return wrap(store.get(id))
}

export async function deletePhotoBlob(id) {
  const db = await openDB()
  const store = tx(db, PHOTO_STORE, 'readwrite')
  await wrap(store.delete(id))
}

export async function putWall(wall) {
  const db = await openDB()
  const store = tx(db, WALL_STORE, 'readwrite')
  await wrap(store.put(wall))
  return wall
}

export async function getWallRecord(id) {
  const db = await openDB()
  const store = tx(db, WALL_STORE, 'readonly')
  return wrap(store.get(id))
}

export async function getAllWallRecords() {
  const db = await openDB()
  const store = tx(db, WALL_STORE, 'readonly')
  return wrap(store.getAll())
}

export async function deleteWallRecord(id) {
  const db = await openDB()
  const store = tx(db, WALL_STORE, 'readwrite')
  await wrap(store.delete(id))
}
