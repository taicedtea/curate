/** Combine multiple pointer-event handler objects (e.g. a swipe hook and a
 * pinch hook watching the same element) into one, calling every handler
 * registered for a given event name. */
export function mergeHandlers(...handlerObjs) {
  const keys = new Set(handlerObjs.flatMap((h) => Object.keys(h || {})))
  const merged = {}
  for (const key of keys) {
    merged[key] = (e) => {
      for (const h of handlerObjs) h?.[key]?.(e)
    }
  }
  return merged
}
