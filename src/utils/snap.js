// Snap logic lives here (with the drag handler that calls it), not in the
// guide visuals — SnapGuides.jsx only renders whatever this returns.
const THRESHOLD = 10

/**
 * Given a photo's proposed rect (x, y = top-left, in canvas px) plus the
 * canvas size and the other photos' committed rects, returns a possibly
 * adjusted x/y snapped to canvas center/edges or neighboring photo edges,
 * along with the guide lines that should be drawn for the current position.
 */
export function computeSnap(rect, canvasSize, otherRects) {
  const { width, height } = rect
  let { x, y } = rect
  const guides = []

  const targetsX = [
    { pos: 0, edge: 'left' },
    { pos: canvasSize.width / 2, edge: 'center' },
    { pos: canvasSize.width, edge: 'right' },
    ...otherRects.flatMap((r) => [
      { pos: r.x, edge: 'left' },
      { pos: r.x + r.width / 2, edge: 'center' },
      { pos: r.x + r.width, edge: 'right' },
    ]),
  ]
  const targetsY = [
    { pos: 0, edge: 'top' },
    { pos: canvasSize.height / 2, edge: 'center' },
    { pos: canvasSize.height, edge: 'bottom' },
    ...otherRects.flatMap((r) => [
      { pos: r.y, edge: 'top' },
      { pos: r.y + r.height / 2, edge: 'center' },
      { pos: r.y + r.height, edge: 'bottom' },
    ]),
  ]

  const candidatesX = [
    { at: x, from: 'left' },
    { at: x + width / 2, from: 'center' },
    { at: x + width, from: 'right' },
  ]
  for (const target of targetsX) {
    for (const candidate of candidatesX) {
      if (Math.abs(candidate.at - target.pos) <= THRESHOLD) {
        const offset = target.pos - candidate.at
        x += offset
        guides.push({ axis: 'vertical', position: target.pos })
        break
      }
    }
  }

  const candidatesY = [
    { at: y, from: 'top' },
    { at: y + height / 2, from: 'center' },
    { at: y + height, from: 'bottom' },
  ]
  for (const target of targetsY) {
    for (const candidate of candidatesY) {
      if (Math.abs(candidate.at - target.pos) <= THRESHOLD) {
        const offset = target.pos - candidate.at
        y += offset
        guides.push({ axis: 'horizontal', position: target.pos })
        break
      }
    }
  }

  return { x, y, guides }
}
