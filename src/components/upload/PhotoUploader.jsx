import { useRef, useState } from 'react'
import { savePhotoFile } from '../../data/wallStore.js'

const MAX_PHOTOS = 12

/** Tap-to-select from camera roll / file picker. Calls onAdd with the newly
 * saved photo records ({ id, url, aspect_ratio }) once each file is
 * persisted to IndexedDB. */
export function PhotoUploader({ currentCount = 0, onAdd }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const remaining = MAX_PHOTOS - currentCount

  async function handleFiles(fileList) {
    const files = Array.from(fileList).slice(0, remaining)
    if (files.length === 0) return
    setBusy(true)
    try {
      const saved = []
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue
        saved.push(await savePhotoFile(file))
      }
      if (saved.length) onAdd?.(saved)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={busy || remaining <= 0}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-white py-6 text-sm font-medium text-zinc-600 transition-colors active:bg-zinc-100 disabled:opacity-50 lg:hover:border-amber-500 lg:hover:text-amber-600"
      >
        <PlusIcon />
        {busy ? 'Adding photos…' : remaining <= 0 ? `Wall is full (${MAX_PHOTOS} max)` : 'Add Photos'}
      </button>
      {remaining > 0 && remaining < MAX_PHOTOS && (
        <p className="mt-2 text-center text-xs text-zinc-400">{remaining} more can be added</p>
      )}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}
