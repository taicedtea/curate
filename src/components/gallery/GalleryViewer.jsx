import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { WallCanvas } from '../canvas/WallCanvas.jsx'
import { ShareButton } from '../share/ShareWall.jsx'
import { useSwipe } from '../../hooks/useSwipe.js'
import { usePinch } from '../../hooks/usePinch.js'
import { mergeHandlers } from '../../utils/mergeHandlers.js'

const SWIPE_NAV_THRESHOLD = 80
const SWIPE_DISMISS_THRESHOLD = 110

/** Full-screen, dark-chrome wall viewer. Tap a photo to expand edge-to-edge,
 * swipe left/right between photos, swipe down to dismiss back to the wall,
 * pinch to zoom, double-tap to like. */
export function GalleryViewer({ wall, onClose, onLike }) {
  const [expandedIndex, setExpandedIndex] = useState(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white">
      <header className="flex items-center justify-between px-4 pb-3 pt-safe">
        <button onClick={onClose} aria-label="Close" className="p-1 text-zinc-300">
          <BackIcon />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium">{wall.title || 'Untitled Wall'}</p>
          <Link to={`/profile/${wall.photographer_id}`} className="text-xs text-zinc-400">
            {wall.photographer_name}
          </Link>
        </div>
        <ShareButton wallId={wall.id} title={wall.title} className="p-1 text-xs text-zinc-300" />
      </header>

      <div className="flex flex-1 items-center justify-center overflow-hidden px-4 pb-6">
        <div className="w-full max-w-md">
          <WallCanvas
            photos={wall.photos}
            wallColor={wall.wall_color}
            frameStyle={wall.frame_style}
            interactive={false}
            onPhotoTap={(id) => setExpandedIndex(wall.photos.findIndex((p) => p.id === id))}
          />
        </div>
      </div>

      {expandedIndex !== null && (
        <ExpandedPhoto
          photos={wall.photos}
          index={expandedIndex}
          onIndexChange={setExpandedIndex}
          onDismiss={() => setExpandedIndex(null)}
          onLike={onLike}
        />
      )}
    </div>
  )
}

function ExpandedPhoto({ photos, index, onIndexChange, onDismiss, onLike }) {
  const photo = photos[index]
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [settling, setSettling] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pinching, setPinching] = useState(false)
  const [heartBurst, setHeartBurst] = useState(0)

  useEffect(() => {
    setZoom(1)
    setDragOffset({ x: 0, y: 0 })
  }, [index])

  const swipeHandlers = useSwipe({
    onDragStart: () => setSettling(false),
    onDragMove: (dx, dy) => {
      if (!pinching) setDragOffset({ x: dx, y: dy })
    },
    onDragEnd: (dx, dy) => {
      const horizontal = Math.abs(dx) > Math.abs(dy)
      if (!horizontal && dy > SWIPE_DISMISS_THRESHOLD) {
        onDismiss()
        return
      }
      if (horizontal && Math.abs(dx) > SWIPE_NAV_THRESHOLD) {
        const next = dx < 0 ? index + 1 : index - 1
        if (next >= 0 && next < photos.length) {
          onIndexChange(next)
          return
        }
      }
      setSettling(true)
      setDragOffset({ x: 0, y: 0 })
    },
    onDoubleTap: () => {
      onLike?.()
      setHeartBurst((k) => k + 1)
    },
  })

  const pinchHandlers = usePinch({
    onPinchStart: () => setPinching(true),
    onPinchMove: (ratio) => setZoom(Math.min(Math.max(ratio, 1), 4)),
    onPinchEnd: () => {
      setPinching(false)
      if (zoom < 1.05) setZoom(1)
    },
  })

  const handlers = mergeHandlers(swipeHandlers, pinchHandlers)
  const dismissProgress = Math.min(Math.abs(dragOffset.y) / SWIPE_DISMISS_THRESHOLD, 1)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950"
      style={{ backgroundColor: `rgba(9,9,11,${1 - dismissProgress * 0.5})` }}
    >
      <button onClick={onDismiss} aria-label="Back to wall" className="absolute left-4 top-safe z-10 p-1 text-zinc-300">
        <BackIcon />
      </button>
      <div className="absolute right-4 top-safe z-10 text-xs text-zinc-400">
        {index + 1} / {photos.length}
      </div>

      <div
        {...handlers}
        className="flex h-full w-full touch-none items-center justify-center"
      >
        <img
          src={photo.url}
          alt={photo.caption || ''}
          draggable={false}
          className={`max-h-full max-w-full select-none object-contain ${settling ? 'transition-transform duration-200 ease-out' : ''}`}
          style={{ transform: pinching ? `scale(${zoom})` : `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${zoom})` }}
        />
      </div>

      {heartBurst > 0 && (
        <div key={heartBurst} className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <HeartIcon className="h-24 w-24 animate-heart-burst text-white drop-shadow-lg" />
        </div>
      )}
    </div>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeartIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
      <path d="M12 21s-7.5-4.7-10-9.1C.4 8.6 2 5 5.6 5c2 0 3.4 1 4.4 2.4C11 6 12.4 5 14.4 5 18 5 19.6 8.6 22 11.9 19.5 16.3 12 21 12 21z" />
    </svg>
  )
}
