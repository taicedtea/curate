import { Link } from 'react-router-dom'

export function WallCard({ wall }) {
  return (
    <Link to={`/wall/${wall.id}`} className="mb-3 block break-inside-avoid overflow-hidden rounded-xl bg-zinc-100">
      <div className="relative">
        {wall.cover_url ? (
          <img
            src={wall.cover_url}
            alt={wall.title || 'Untitled Wall'}
            style={{ aspectRatio: wall.cover_aspect_ratio || 1 }}
            className="w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center text-xs text-zinc-400">No photos</div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent px-3 pb-2.5 pt-8">
          <p className="truncate text-sm font-medium text-white">{wall.title || 'Untitled Wall'}</p>
          <p className="truncate text-xs text-white/70">{wall.photographer_name}</p>
        </div>
      </div>
    </Link>
  )
}
