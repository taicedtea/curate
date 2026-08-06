import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GalleryViewer } from '../components/gallery/GalleryViewer.jsx'
import { getWall, incrementViewCount, incrementLikeCount } from '../data/wallStore.js'

export function WallViewPage() {
  const { wallId } = useParams()
  const navigate = useNavigate()
  const [wall, setWall] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    getWall(wallId).then((w) => {
      if (cancelled) return
      if (!w) {
        setNotFound(true)
        return
      }
      setWall(w)
      incrementViewCount(wallId)
    })
    return () => {
      cancelled = true
    }
  }, [wallId])

  function handleLike() {
    setWall((w) => (w ? { ...w, like_count: w.like_count + 1 } : w))
    incrementLikeCount(wallId)
  }

  if (notFound) {
    return <div className="p-6 text-center text-sm text-zinc-500">This wall doesn't exist (or was created in another browser — walls are stored locally on this device for now).</div>
  }
  if (!wall) {
    return <div className="flex h-64 items-center justify-center text-sm text-zinc-400">Loading…</div>
  }

  return <GalleryViewer wall={wall} onClose={() => navigate(-1)} onLike={handleLike} />
}
