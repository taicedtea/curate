import { useRef, useMemo } from 'react'

/** Two-pointer pinch-to-zoom, reporting a scale ratio relative to gesture start. */
export function usePinch({ onPinchStart, onPinchMove, onPinchEnd } = {}) {
  const stateRef = useRef({ pointers: new Map(), startDistance: 0 })

  return useMemo(() => {
    function distance(pts) {
      const [a, b] = pts
      return Math.hypot(a.x - b.x, a.y - b.y)
    }

    function onPointerDown(e) {
      const s = stateRef.current
      e.currentTarget.setPointerCapture(e.pointerId)
      s.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (s.pointers.size === 2) {
        s.startDistance = distance([...s.pointers.values()]) || 1
        onPinchStart?.()
      }
    }

    function onPointerMove(e) {
      const s = stateRef.current
      if (!s.pointers.has(e.pointerId)) return
      s.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (s.pointers.size === 2) {
        onPinchMove?.(distance([...s.pointers.values()]) / s.startDistance)
      }
    }

    function onPointerUp(e) {
      const s = stateRef.current
      const wasPinching = s.pointers.size === 2
      s.pointers.delete(e.pointerId)
      if (wasPinching) onPinchEnd?.()
    }

    return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onPinchStart, onPinchMove, onPinchEnd])
}
