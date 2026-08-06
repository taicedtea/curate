import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { WallCanvas } from '../components/canvas/WallCanvas.jsx'
import { PhotoUploader } from '../components/upload/PhotoUploader.jsx'
import { StyleSheet } from '../components/sheet/StyleSheet.jsx'
import { getWallShareUrl, shareWall } from '../components/share/ShareWall.jsx'
import { createWall, getWall, updateWall, removePhotoFromWall } from '../data/wallStore.js'
import { computeGridSlot } from '../utils/gridLayout.js'

const AUTOSAVE_MS = 350

export function CreateWallPage() {
  const { wallId: paramWallId } = useParams()
  const navigate = useNavigate()

  const [wallId, setWallId] = useState(paramWallId ?? null)
  const [loaded, setLoaded] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [wallColor, setWallColor] = useState('#f5f5f0')
  const [frameStyle, setFrameStyle] = useState('none')
  const [frameSpacing, setFrameSpacing] = useState(16)
  const [photos, setPhotos] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [styleOpen, setStyleOpen] = useState(false)
  const [publishState, setPublishState] = useState('idle') // idle | publishing | published

  useEffect(() => {
    let cancelled = false
    async function init() {
      if (paramWallId) {
        const w = await getWall(paramWallId)
        if (cancelled || !w) return
        setTitle(w.title)
        setDescription(w.description)
        setWallColor(w.wall_color)
        setFrameStyle(w.frame_style)
        setFrameSpacing(w.frame_spacing)
        setPhotos(w.photos)
        setWallId(w.id)
        setLoaded(true)
      } else {
        const w = await createWall()
        if (cancelled) return
        setWallId(w.id)
        setLoaded(true)
        navigate(`/wall/${w.id}/edit`, { replace: true })
      }
    }
    init()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramWallId])

  const saveTimer = useRef(null)
  useEffect(() => {
    if (!loaded || !wallId) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateWall(wallId, {
        title,
        description,
        wall_color: wallColor,
        frame_style: frameStyle,
        frame_spacing: frameSpacing,
        photos,
      })
    }, AUTOSAVE_MS)
    return () => clearTimeout(saveTimer.current)
  }, [loaded, wallId, title, description, wallColor, frameStyle, frameSpacing, photos])

  function handlePhotosAdded(newRecords) {
    setPhotos((prev) => {
      const base = prev.length
      const additions = newRecords.map((r, i) => ({
        id: r.id,
        url: r.url,
        caption: '',
        aspect_ratio: r.aspect_ratio,
        ...computeGridSlot(base + i, r.aspect_ratio, frameSpacing),
      }))
      return [...prev, ...additions]
    })
  }

  async function handleRequestDelete(photoId) {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
    if (selectedId === photoId) setSelectedId(null)
    if (wallId) await removePhotoFromWall(wallId, photoId)
  }

  async function handlePublish() {
    if (!wallId) return
    setPublishState('publishing')
    await updateWall(wallId, {
      title,
      description,
      wall_color: wallColor,
      frame_style: frameStyle,
      frame_spacing: frameSpacing,
      photos,
      is_public: true,
    })
    const wallTitle = title || 'Untitled Wall'
    await shareWall({ url: getWallShareUrl(wallId), title: wallTitle, text: `Check out "${wallTitle}" on Curate` })
    setPublishState('published')
  }

  if (!loaded) {
    return <div className="flex h-64 items-center justify-center text-sm text-zinc-400">Loading…</div>
  }

  return (
    <div className="lg:flex lg:h-[calc(100dvh)]">
      <div className="flex-1 overflow-y-auto lg:h-full">
        <div className="mx-auto max-w-2xl px-4 pb-40 pt-5 lg:pb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Wall"
            className="w-full bg-transparent text-2xl font-semibold text-zinc-900 placeholder:text-zinc-300 focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description…"
            rows={1}
            className="mt-1 w-full resize-none bg-transparent text-sm text-zinc-500 placeholder:text-zinc-300 focus:outline-none"
          />

          <div className="fixed inset-x-0 bottom-16 z-30 flex items-center gap-2 border-t border-zinc-200 bg-white/95 px-4 py-3 pb-safe backdrop-blur lg:static lg:mt-3 lg:border-b lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-3 lg:backdrop-blur-none">
            <button
              type="button"
              onClick={() => setStyleOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 lg:hidden"
            >
              <StyleIcon /> Style
            </button>
            <button
              type="button"
              onClick={() => navigate(`/wall/${wallId}`)}
              disabled={photos.length === 0}
              className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 disabled:opacity-40 lg:py-2"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={photos.length === 0 || publishState === 'publishing'}
              className="flex-1 rounded-lg bg-amber-600 py-3 text-sm font-semibold text-white transition-colors active:bg-amber-700 disabled:opacity-40 lg:flex-none lg:px-6 lg:py-2"
            >
              {publishState === 'published' ? 'Link copied ✓' : publishState === 'publishing' ? 'Publishing…' : 'Publish'}
            </button>
          </div>

          <div className="mt-5">
            <WallCanvas
              photos={photos}
              wallColor={wallColor}
              frameStyle={frameStyle}
              interactive
              selectedId={selectedId}
              onSelectChange={setSelectedId}
              onPhotosChange={setPhotos}
              onRequestDelete={handleRequestDelete}
            />
          </div>

          {photos.length === 0 && (
            <p className="mt-4 text-center text-sm text-zinc-400">
              Add up to 12 photos, then drag and pinch to arrange them on the wall.
            </p>
          )}

          <div className="mt-4">
            <PhotoUploader currentCount={photos.length} onAdd={handlePhotosAdded} />
          </div>
        </div>
      </div>

      <StyleSheet
        open={styleOpen}
        onClose={() => setStyleOpen(false)}
        wallColor={wallColor}
        onWallColorChange={setWallColor}
        frameStyle={frameStyle}
        onFrameStyleChange={setFrameStyle}
        spacing={frameSpacing}
        onSpacingChange={setFrameSpacing}
      />
    </div>
  )
}

function StyleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="19" cy="17" r="2.5" />
      <circle cx="6" cy="14" r="2.5" />
      <path d="M13.5 9v3M6 16.5V19M19 19.5V22" strokeLinecap="round" />
    </svg>
  )
}
