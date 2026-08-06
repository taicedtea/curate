/** Purely presentational — renders whatever guides the drag handler computed
 * (src/utils/snap.js). Never computes snapping itself. */
export function SnapGuides({ guides, scale }) {
  if (!guides.length) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {guides.map((g, i) =>
        g.axis === 'vertical' ? (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-amber-500"
            style={{ left: g.position * scale }}
          />
        ) : (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-amber-500"
            style={{ top: g.position * scale }}
          />
        ),
      )}
    </div>
  )
}
