import { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_COLS, GRID_ROWS } from './constants.js'

/** Auto-arrange placement for a freshly-added photo (Flow A step 3: "Canvas
 * opens with photos auto-arranged in a grid"). `index` is the photo's slot
 * among all photos ever placed on this wall — existing photos keep whatever
 * position the photographer dragged them to, only new ones get gridded. */
export function computeGridSlot(index, aspectRatio, spacing) {
  const col = index % GRID_COLS
  const row = Math.floor(index / GRID_COLS) % GRID_ROWS

  const cellWidth = (CANVAS_WIDTH - spacing * (GRID_COLS + 1)) / GRID_COLS
  const cellHeight = (CANVAS_HEIGHT - spacing * (GRID_ROWS + 1)) / GRID_ROWS

  let width = cellWidth
  let height = width / aspectRatio
  if (height > cellHeight) {
    height = cellHeight
    width = height * aspectRatio
  }

  const cellX = spacing + col * (cellWidth + spacing)
  const cellY = spacing + row * (cellHeight + spacing)

  return {
    x: cellX + (cellWidth - width) / 2,
    y: cellY + (cellHeight - height) / 2,
    width,
    height,
  }
}
