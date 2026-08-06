import { useEffect, useRef, useState, useCallback } from 'react'
import { PhotoFrame } from './PhotoFrame.jsx'
import { SnapGuides } from './SnapGuides.jsx'
import { computeSnap } from '../../utils/snap.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../utils/constants.js'

const MIN_SIZE = 60
const MAX_SIZE = CANVAS_WIDTH

/**
 * The wall itself: absolute-positioned photo frames on a fixed-aspect
 * portrait canvas that's scaled to fit the container. In `interactive`
 * mode it's the creator's arrange surface (drag/pinch/long-press); in
 * read-only mode it's reused as the visitor's full-wall view, where a tap
 * just reports which photo was tapped instead of selecting it.
 */
export function WallCanvas({
  photos,
  wallColor = '#f5f5f0',
  frameStyle = 'none',
  interactive = true,
  selectedId = null,
  onSelectChange,
  onPhotosChange,
  onPhotoTap,
  onRequestDelete,
}) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(0)
  const [dragId, setDragId] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [guides, setGuides] = useState([])
  const [pinchId, setPinchId] = useState(null)
  const [pinchRatio, setPinchRatio] = useState(1)
  const [menu, setMenu] = useState(null) // { photoId, x, y }

  const canvasSize = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
  const pinchBaseRef = useRef({ width: 0, height: 0, x: 0, y: 0 })
  // dragPos changes rapidly during a gesture; this lets handleDragEnd read
  // the latest value at drag-end time without depending on dragPos (which
  // would mean re-binding the pointer-up handler on every move frame).
  const dragPosRef = useRef(dragPos)
  dragPosRef.current = dragPos

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / CANVAS_WIDTH)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const commitPhotos = useCallback(
    (updater) => {
      onPhotosChange?.(updater(photos))
    },
    [photos, onPhotosChange],
  )

  function bringToFront(id) {
    commitPhotos((list) => {
      const idx = list.findIndex((p) => p.id === id)
      if (idx === -1 || idx === list.length - 1) return list
      const next = [...list]
      const [item] = next.splice(idx, 1)
      next.push(item)
      return next
    })
  }

  function handleSelect(photo) {
    if (!interactive) {
      onPhotoTap?.(photo.id)
      return
    }
    onSelectChange?.(photo.id)
  }

  function handleDragStart(photo) {
    setDragId(photo.id)
    setDragPos({ x: photo.x, y: photo.y })
    onSelectChange?.(photo.id)
    bringToFront(photo.id)
  }

  function handleDragMove(photo, stepX, stepY) {
    if (!scale) return
    setDragPos((prev) => {
      const proposed = { x: prev.x + stepX / scale, y: prev.y + stepY / scale }
      const others = photos.filter((p) => p.id !== photo.id)
      const snap = computeSnap({ ...proposed, width: photo.width, height: photo.height }, canvasSize, others)
      setGuides(snap.guides)
      return { x: snap.x, y: snap.y }
    })
  }

  function handleDragEnd(photo) {
    const { x, y } = dragPosRef.current
    commitPhotos((list) => list.map((p) => (p.id === photo.id ? { ...p, x, y } : p)))
    setDragId(null)
    setGuides([])
  }

  function handlePinchStart(photo) {
    setPinchId(photo.id)
    pinchBaseRef.current = { width: photo.width, height: photo.height, x: photo.x, y: photo.y }
    onSelectChange?.(photo.id)
  }

  function handlePinchMove(_photo, ratio) {
    setPinchRatio(ratio)
  }

  function handlePinchEnd(photo) {
    const base = pinchBaseRef.current
    const clampedRatio = Math.min(Math.max(pinchRatio, MIN_SIZE / base.width, MIN_SIZE / base.height), MAX_SIZE / Math.max(base.width, base.height))
    const width = base.width * clampedRatio
    const height = base.height * clampedRatio
    const x = base.x + (base.width - width) / 2
    const y = base.y + (base.height - height) / 2
    commitPhotos((list) => list.map((p) => (p.id === photo.id ? { ...p, width, height, x, y } : p)))
    setPinchId(null)
    setPinchRatio(1)
  }

  function handleLongPress(photo, pos) {
    if (!interactive) return
    onSelectChange?.(photo.id)
    setMenu({ photoId: photo.id, x: pos.x, y: pos.y })
  }

  function handleResetSize(photo) {
    const defaultWidth = (CANVAS_WIDTH - 4 * 24) / 3
    const width = defaultWidth
    const height = width / photo.aspect_ratio
    const centerX = photo.x + photo.width / 2
    const centerY = photo.y + photo.height / 2
    commitPhotos((list) =>
      list.map((p) => (p.id === photo.id ? { ...p, width, height, x: centerX - width / 2, y: centerY - height / 2 } : p)),
    )
    setMenu(null)
  }

  function handleDeleteFromMenu(photo) {
    onRequestDelete?.(photo.id)
    setMenu(null)
  }

  function handleBackgroundTap(e) {
    if (e.target !== containerRef.current) return
    onSelectChange?.(null)
    setMenu(null)
  }

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        onPointerDown={handleBackgroundTap}
        className="relative w-full touch-none overflow-hidden rounded-lg"
        style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`, backgroundColor: wallColor }}
      >
        {scale > 0 &&
          photos.map((photo, i) => {
            const isDragging = dragId === photo.id
            const isPinching = pinchId === photo.id
            const pos = isDragging ? dragPos : { x: photo.x, y: photo.y }
            return (
              <PhotoFrame
                key={photo.id}
                photo={photo}
                x={pos.x}
                y={pos.y}
                width={photo.width}
                height={photo.height}
                scale={scale}
                pinchRatio={isPinching ? pinchRatio : 1}
                selected={interactive && selectedId === photo.id}
                dragging={isDragging}
                frameStyle={frameStyle}
                zIndex={i}
                onSelect={() => handleSelect(photo)}
                onDragStart={interactive ? () => handleDragStart(photo) : undefined}
                onDragMove={interactive ? (dx, dy) => handleDragMove(photo, dx, dy) : undefined}
                onDragEnd={interactive ? () => handleDragEnd(photo) : undefined}
                onPinchStart={interactive ? () => handlePinchStart(photo) : undefined}
                onPinchMove={interactive ? (ratio) => handlePinchMove(photo, ratio) : undefined}
                onPinchEnd={interactive ? () => handlePinchEnd(photo) : undefined}
                onLongPress={interactive ? (pos2) => handleLongPress(photo, pos2) : undefined}
              />
            )
          })}
        {interactive && <SnapGuides guides={guides} scale={scale} />}
      </div>

      {menu &&
        (() => {
          const photo = photos.find((p) => p.id === menu.photoId)
          if (!photo) return null
          return (
            <QuickMenu
              anchor={menu}
              onDelete={() => handleDeleteFromMenu(photo)}
              onBringToFront={() => {
                bringToFront(photo.id)
                setMenu(null)
              }}
              onResetSize={() => handleResetSize(photo)}
              onClose={() => setMenu(null)}
            />
          )
        })()}
    </div>
  )
}

function QuickMenu({ anchor, onDelete, onBringToFront, onResetSize, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onPointerDown={onClose} />
      <div
        className="fixed z-50 flex -translate-x-1/2 flex-col overflow-hidden rounded-lg bg-zinc-900 text-sm text-white shadow-xl"
        style={{ left: anchor.x, top: anchor.y + 12 }}
      >
        <button className="px-4 py-2.5 text-left hover:bg-zinc-800" onClick={onBringToFront}>
          Bring to Front
        </button>
        <button className="px-4 py-2.5 text-left hover:bg-zinc-800" onClick={onResetSize}>
          Reset Size
        </button>
        <button className="px-4 py-2.5 text-left text-red-400 hover:bg-zinc-800" onClick={onDelete}>
          Delete
        </button>
      </div>
    </>
  )
}
