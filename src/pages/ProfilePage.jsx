import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PhotographerProfile } from '../components/profile/PhotographerProfile.jsx'
import { listWallSummaries } from '../data/wallStore.js'
import { currentUser } from '../data/currentUser.js'

export function ProfilePage() {
  const { photographerId } = useParams()
  const isOwnProfile = !photographerId || photographerId === currentUser.id
  const [walls, setWalls] = useState(null)

  useEffect(() => {
    if (!isOwnProfile) return
    listWallSummaries({ photographerId: currentUser.id }).then(setWalls)
  }, [isOwnProfile])

  if (!isOwnProfile) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-zinc-500">
        <p>Auth isn't wired up yet, so only your own local profile exists right now.</p>
        <Link to="/profile" className="text-amber-600 underline">
          Go to your profile
        </Link>
      </div>
    )
  }

  if (walls === null) {
    return <div className="flex h-64 items-center justify-center text-sm text-zinc-400">Loading…</div>
  }

  return <PhotographerProfile photographer={currentUser} walls={walls} isOwnProfile />
}
