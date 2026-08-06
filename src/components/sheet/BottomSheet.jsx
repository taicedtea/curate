import { useState } from 'react'
import { useSwipe } from '../../hooks/useSwipe.js'

const DISMISS_DISTANCE = 90

/**
 * The one reusable sheet primitive — every style/detail panel is a variant
 * of this, not its own component. On mobile it's a swipe-to-dismiss sheet
 * that slides up from the bottom; at the >1024px desktop breakpoint the
 * same component renders inline as a persistent side panel instead of a
 * separate desktop layout (per CLAUDE.md's Design→Code table).
 */
export function BottomSheet({ open, onClose, title, children }) {
  const [dragY, setDragY] = useState(0)

  const swipeHandlers = useSwipe({
    onDragMove: (dx, dy) => setDragY(Math.max(0, dy)),
    onDragEnd: (dx, dy) => {
      if (dy > DISMISS_DISTANCE) onClose?.()
      setDragY(0)
    },
  })

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={[
          'fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-2xl bg-white pb-safe shadow-2xl transition-transform duration-200 ease-out',
          'lg:static lg:z-auto lg:max-h-none lg:w-80 lg:shrink-0 lg:translate-y-0 lg:overflow-visible lg:rounded-none lg:border-l lg:border-zinc-200 lg:pb-0 lg:shadow-none',
          open ? 'translate-y-0' : 'translate-y-full lg:translate-y-0',
        ].join(' ')}
        style={{ transform: open ? `translateY(${dragY}px)` : undefined }}
      >
        <div {...swipeHandlers} className="flex touch-none flex-col items-center pt-2 lg:hidden">
          <div className="h-1 w-10 rounded-full bg-zinc-300" />
        </div>
        <div className="flex items-center justify-between px-5 pb-2 pt-3 lg:border-b lg:border-zinc-200 lg:py-4">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-900">{title}</h2>
          <button onClick={onClose} className="text-sm text-zinc-400 lg:hidden">
            Done
          </button>
        </div>
        <div className="px-5 pb-6 lg:p-5">{children}</div>
      </div>
    </>
  )
}
