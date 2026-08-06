import { useFrameGestures } from '../../hooks/usePointerDrag.js'

export const FRAME_STYLES = {
  none: { label: 'None', className: 'border-0 shadow-md' },
  'thin-black': { label: 'Thin Black', className: 'border-[5px] border-zinc-950 shadow-md' },
  'thin-white': { label: 'Thin White', className: 'border-[5px] border-white shadow-md' },
  mat: { label: 'Mat', className: 'border-[16px] border-white shadow-lg' },
  shadow: { label: 'Shadow Only', className: 'border-0 shadow-2xl' },
}

export function PhotoFrame({
  photo,
  x,
  y,
  width,
  height,
  scale,
  pinchRatio = 1,
  selected,
  dragging,
  frameStyle,
  zIndex,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onPinchStart,
  onPinchMove,
  onPinchEnd,
  onLongPress,
}) {
  const gestureHandlers = useFrameGestures({
    onSelect,
    onDragStart,
    onDragMove,
    onDragEnd,
    onPinchStart,
    onPinchMove,
    onPinchEnd,
    onLongPress,
  })

  const frame = FRAME_STYLES[frameStyle] ?? FRAME_STYLES.none

  return (
    <div
      {...gestureHandlers}
      role="button"
      tabIndex={0}
      aria-label={photo.caption || 'Photo'}
      className={[
        'absolute left-0 top-0 touch-none select-none bg-white',
        'transition-shadow',
        frame.className,
        selected ? 'outline outline-2 outline-offset-2 outline-amber-500' : '',
        dragging ? 'shadow-2xl' : '',
      ].join(' ')}
      style={{
        width: width * scale,
        height: height * scale,
        transform: `translate(${x * scale}px, ${y * scale}px) scale(${pinchRatio})`,
        transformOrigin: 'center center',
        zIndex,
        boxSizing: 'border-box',
      }}
    >
      <img
        src={photo.url}
        alt={photo.caption || ''}
        draggable={false}
        className="h-full w-full select-none object-cover"
      />
    </div>
  )
}
