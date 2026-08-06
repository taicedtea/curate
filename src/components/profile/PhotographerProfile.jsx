import { Link } from 'react-router-dom'

export function PhotographerProfile({ photographer, walls, isOwnProfile }) {
  const initials = (photographer.name || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div>
      <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-8 text-center">
        {photographer.avatar_url ? (
          <img src={photographer.avatar_url} alt={photographer.name} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-xl font-semibold text-white">
            {initials}
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">{photographer.name}</h1>
          {photographer.bio && <p className="mx-auto mt-1 max-w-xs text-sm text-zinc-500">{photographer.bio}</p>}
        </div>
        <div className="flex gap-6 text-sm">
          <span>
            <strong className="text-zinc-900">{walls.length}</strong> <span className="text-zinc-500">walls</span>
          </span>
          <span>
            <strong className="text-zinc-900">{photographer.followers_count ?? 0}</strong>{' '}
            <span className="text-zinc-500">followers</span>
          </span>
        </div>
      </div>

      {walls.length === 0 ? (
        <p className="px-6 pb-10 text-center text-sm text-zinc-400">
          {isOwnProfile ? "You haven't created a wall yet." : 'No walls yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-3 pb-10 lg:grid-cols-4">
          {walls.map((wall) => (
            <Link
              key={wall.id}
              to={isOwnProfile && !wall.is_public ? `/wall/${wall.id}/edit` : `/wall/${wall.id}`}
              className="relative block overflow-hidden rounded-lg bg-zinc-100"
            >
              {wall.cover_url ? (
                <img
                  src={wall.cover_url}
                  alt={wall.title}
                  style={{ aspectRatio: wall.cover_aspect_ratio || 1 }}
                  className="w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center text-xs text-zinc-400">Empty</div>
              )}
              {isOwnProfile && !wall.is_public && (
                <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Draft
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-6 text-xs text-white">
                {wall.title || 'Untitled Wall'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
