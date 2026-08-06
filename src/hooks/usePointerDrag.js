import { useRef, useMemo } from 'react'

const DRAG_THRESHOLD = 4 // px of movement before a tap becomes a drag
const LONG_PRESS_MS = 500

/**
 * Unified pointer-event gesture handling for a single wall photo frame:
 * tap-to-select, one-finger drag, two-finger pinch-resize, and long-press.
 * Pointer Events cover mouse + touch + pen with one code path, so this same
 * hook is what makes desktop drag "just work" — no separate mouse handling.
 *
 * Canvas is never CSS-scaled, so screen px deltas equal canvas px deltas.
 */
export function useFrameGestures({
  disabled = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onPinchStart,
  onPinchMove,
  onPinchEnd,
  onLongPress,
} = {}) {
  const stateRef = useRef({
    pointers: new Map(),
    mode: 'idle', // idle | pending | dragging | pinching
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    longPressTimer: null,
    pinchStartDistance: 0,
  })

  const handlers = useMemo(() => {
    function clearLongPress() {
      const s = stateRef.current
      if (s.longPressTimer) {
        clearTimeout(s.longPressTimer)
        s.longPressTimer = null
      }
    }

    function distance(pts) {
      const [a, b] = pts
      return Math.hypot(a.x - b.x, a.y - b.y)
    }

    function onPointerDown(e) {
      if (disabled) return
      const s = stateRef.current
      e.currentTarget.setPointerCapture(e.pointerId)
      s.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (s.pointers.size === 1) {
        s.mode = 'pending'
        s.startX = s.lastX = e.clientX
        s.startY = s.lastY = e.clientY
        clearLongPress()
        s.longPressTimer = setTimeout(() => {
          if (s.mode === 'pending') {
            s.mode = 'longpress-done'
            onLongPress?.({ x: s.startX, y: s.startY })
          }
        }, LONG_PRESS_MS)
      } else if (s.pointers.size === 2) {
        clearLongPress()
        if (s.mode === 'dragging') onDragEnd?.()
        s.mode = 'pinching'
        const pts = [...s.pointers.values()]
        s.pinchStartDistance = distance(pts) || 1
        onPinchStart?.()
      }
    }

    function onPointerMove(e) {
      const s = stateRef.current
      if (!s.pointers.has(e.pointerId)) return
      s.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (s.mode === 'pinching' && s.pointers.size === 2) {
        const pts = [...s.pointers.values()]
        const ratio = distance(pts) / s.pinchStartDistance
        onPinchMove?.(ratio)
        return
      }

      if (s.mode === 'pending' || s.mode === 'dragging') {
        const dx = e.clientX - s.startX
        const dy = e.clientY - s.startY
        if (s.mode === 'pending') {
          if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
          clearLongPress()
          s.mode = 'dragging'
          onDragStart?.()
        }
        const stepX = e.clientX - s.lastX
        const stepY = e.clientY - s.lastY
        s.lastX = e.clientX
        s.lastY = e.clientY
        onDragMove?.(stepX, stepY)
      }
    }

    function endGesture(e) {
      const s = stateRef.current
      const wasPending = s.mode === 'pending'
      const wasDragging = s.mode === 'dragging'
      const wasPinching = s.mode === 'pinching'

      s.pointers.delete(e.pointerId)
      clearLongPress()

      if (wasPinching) {
        onPinchEnd?.()
        s.mode = s.pointers.size > 0 ? 'idle' : 'idle'
        return
      }
      if (wasDragging) {
        onDragEnd?.()
      } else if (wasPending) {
        onSelect?.()
      }
      if (s.pointers.size === 0) s.mode = 'idle'
    }

    return {
      onPointerDown,
      onPointerMove,
      onPointerUp: endGesture,
      onPointerCancel: endGesture,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, onSelect, onDragStart, onDragMove, onDragEnd, onPinchStart, onPinchMove, onPinchEnd, onLongPress])

  return handlers
}
