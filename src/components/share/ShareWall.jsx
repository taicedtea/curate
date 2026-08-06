import { useState } from 'react'

export function getWallShareUrl(wallId) {
  return `${window.location.origin}/wall/${wallId}`
}

/** Web Share API when available (native share sheet on mobile), Clipboard
 * API fallback everywhere else (desktop browsers without navigator.share). */
export async function shareWall({ url, title, text }) {
  if (navigator.share) {
    try {
      await navigator.share({ url, title, text })
      return 'shared'
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled'
      // fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}

export function ShareButton({ wallId, title, className = '' }) {
  const [status, setStatus] = useState('idle')

  async function handleShare() {
    const result = await shareWall({ url: getWallShareUrl(wallId), title, text: `Check out "${title}" on Curate` })
    if (result === 'copied') {
      setStatus('copied')
      setTimeout(() => setStatus('idle'), 1800)
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      <ShareIcon />
      {status === 'copied' ? 'Link copied' : 'Share'}
    </button>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12" strokeLinecap="round" />
      <path d="M7 8l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
