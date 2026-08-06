import { useRef, useMemo } from 'react'

const MOVE_THRESHOLD = 6
const DOUBLE_TAP_MS = 300

/**
 * Single-pointer drag + tap/double-tap tracking for the gallery viewer.
 * Reports raw deltas continuously so the caller can classify the gesture
 * (horizontal swipe = next/prev, vertical = dismiss) and follow the finger
 * live rather than only reacting after release.
 */
export function useSwipe({ onDragStart, onDragMove, onDragEnd, onTap, onDoubleTap } = {}) {
  const stateRef = useRef({
    active: false,
    dragging: false,
    startX: 0,
    startY: 0,
    lastTapAt: 0,
    tapTimer: null,
  })

  return useMemo(() => {
    function onPointerDown(e) {
      const s = stateRef.current
      if (s.active) return
      e.currentTarget.setPointerCapture(e.pointerId)
      s.active = true
      s.dragging = false
      s.startX = e.clientX
      s.startY = e.clientY
    }

    function onPointerMove(e) {
      const s = stateRef.current
      if (!s.active) return
      const dx = e.clientX - s.startX
      const dy = e.clientY - s.startY
      if (!s.dragging) {
        if (Math.hypot(dx, dy) < MOVE_THRESHOLD) return
        s.dragging = true
        onDragStart?.()
      }
      onDragMove?.(dx, dy)
    }

    function onPointerUp(e) {
      const s = stateRef.current
      if (!s.active) return
      s.active = false
      const dx = e.clientX - s.startX
      const dy = e.clientY - s.startY

      if (s.dragging) {
        onDragEnd?.(dx, dy)
        return
      }

      const now = Date.now()
      if (now - s.lastTapAt < DOUBLE_TAP_MS) {
        clearTimeout(s.tapTimer)
        s.lastTapAt = 0
        onDoubleTap?.()
      } else {
        s.lastTapAt = now
        clearTimeout(s.tapTimer)
        s.tapTimer = setTimeout(() => onTap?.(), DOUBLE_TAP_MS)
      }
    }

    return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDragStart, onDragMove, onDragEnd, onTap, onDoubleTap])
}
