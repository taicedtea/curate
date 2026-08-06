import {
  putPhotoBlob,
  getPhotoBlob,
  deletePhotoBlob,
  putWall,
  getWallRecord,
  getAllWallRecords,
  deleteWallRecord,
} from './db.js'
import { currentUser } from './currentUser.js'
import { makeId } from '../utils/id.js'

// Object URLs are session-local (they die on reload), so they're never
// persisted — only the photo id is. This cache just avoids re-creating the
// same URL for a blob we've already resolved this session.
const urlCache = new Map()

async function resolvePhotoUrl(id) {
  if (urlCache.has(id)) return urlCache.get(id)
  const record = await getPhotoBlob(id)
  if (!record) return null
  const url = URL.createObjectURL(record.blob)
  urlCache.set(id, url)
  return url
}

/** Store a newly-picked file's bytes and read its aspect ratio. Returns a
 * photo id — not yet placed on any wall. */
export async function savePhotoFile(file) {
  const id = makeId()
  const bitmap = await createImageBitmap(file)
  const aspect_ratio = bitmap.width / bitmap.height
  bitmap.close()
  await putPhotoBlob(id, file, aspect_ratio)
  const url = await resolvePhotoUrl(id)
  return { id, url, aspect_ratio }
}

function defaultWall(overrides = {}) {
  const now = Date.now()
  return {
    id: makeId(),
    title: '',
    description: '',
    photographer_id: currentUser.id,
    photographer_name: currentUser.name,
    photographer_bio: currentUser.bio,
    photographer_avatar: currentUser.avatar_url,
    wall_color: '#f5f5f0',
    frame_style: 'none',
    frame_spacing: 16,
    is_public: false,
    created_at: now,
    view_count: 0,
    like_count: 0,
    photos: [],
    ...overrides,
  }
}

export async function createWall(overrides = {}) {
  const wall = defaultWall(overrides)
  await putWall(wall)
  return wall
}

async function withResolvedPhotoUrls(wall) {
  if (!wall) return wall
  const photos = await Promise.all(
    wall.photos.map(async (photo) => ({ ...photo, url: (await resolvePhotoUrl(photo.id)) ?? photo.url })),
  )
  return { ...wall, photos }
}

export async function getWall(id) {
  const record = await getWallRecord(id)
  return withResolvedPhotoUrls(record)
}

/** Lighter-weight read for grids/feeds — only resolves the cover photo. */
export async function listWallSummaries({ publicOnly = false, photographerId } = {}) {
  const all = await getAllWallRecords()
  const filtered = all
    .filter((w) => (publicOnly ? w.is_public : true))
    .filter((w) => (photographerId ? w.photographer_id === photographerId : true))
    .sort((a, b) => b.created_at - a.created_at)

  return Promise.all(
    filtered.map(async (wall) => {
      const cover = wall.photos[0]
      const cover_url = cover ? await resolvePhotoUrl(cover.id) : null
      return { ...wall, cover_url, cover_aspect_ratio: cover?.aspect_ratio ?? 1 }
    }),
  )
}

export async function updateWall(id, patch) {
  const existing = await getWallRecord(id)
  if (!existing) throw new Error(`Wall ${id} not found`)
  const next = { ...existing, ...patch }
  await putWall(next)
  return next
}

export async function publishWall(id) {
  return updateWall(id, { is_public: true })
}

export async function deleteWall(id) {
  const existing = await getWallRecord(id)
  if (existing) {
    await Promise.all(existing.photos.map((p) => deletePhotoBlob(p.id)))
  }
  await deleteWallRecord(id)
}

export async function removePhotoFromWall(wallId, photoId) {
  const existing = await getWallRecord(wallId)
  if (!existing) return
  await deletePhotoBlob(photoId)
  urlCache.delete(photoId)
  await updateWall(wallId, { photos: existing.photos.filter((p) => p.id !== photoId) })
}

export async function incrementViewCount(id) {
  const existing = await getWallRecord(id)
  if (!existing) return
  await updateWall(id, { view_count: existing.view_count + 1 })
}

export async function incrementLikeCount(id) {
  const existing = await getWallRecord(id)
  if (!existing) return existing
  return updateWall(id, { like_count: existing.like_count + 1 })
}
