import { useEffect, useRef, useState } from 'react'
import { WallCard } from './WallCard.jsx'
import { listWallSummaries } from '../../data/wallStore.js'

const PAGE_SIZE = 6

export function DiscoveryFeed() {
  const [walls, setWalls] = useState(null) // null = loading
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef(null)

  useEffect(() => {
    listWallSummaries({ publicOnly: true }).then(setWalls)
  }, [])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !walls) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisibleCount((c) => Math.min(c + PAGE_SIZE, walls.length))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [walls])

  if (walls === null) {
    return <div className="flex h-64 items-center justify-center text-sm text-zinc-400">Loading…</div>
  }

  if (walls.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-1 px-6 text-center">
        <p className="text-sm font-medium text-zinc-600">No walls published yet</p>
        <p className="text-xs text-zinc-400">Create a wall to see it show up here.</p>
      </div>
    )
  }

  const visible = walls.slice(0, visibleCount)

  return (
    <div className="px-3 pt-3">
      <div className="columns-2 gap-3 [column-fill:_auto] lg:columns-3 xl:columns-4">
        {visible.map((wall) => (
          <WallCard key={wall.id} wall={wall} />
        ))}
      </div>
      {visibleCount < walls.length && <div ref={sentinelRef} className="h-8" />}
    </div>
  )
}
