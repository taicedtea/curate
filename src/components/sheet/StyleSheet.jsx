import { BottomSheet } from './BottomSheet.jsx'
import { FRAME_STYLES } from '../canvas/PhotoFrame.jsx'

const WALL_COLORS = [
  { label: 'Paper', value: '#f5f5f0' },
  { label: 'Warm Gray', value: '#d8d3cb' },
  { label: 'Stone', value: '#a8a29e' },
  { label: 'Charcoal', value: '#27272a' },
  { label: 'Black', value: '#0a0a0a' },
  { label: 'Sage', value: '#a9b8a3' },
  { label: 'Terracotta', value: '#c17a5a' },
  { label: 'Blush', value: '#e8cdc4' },
  { label: 'Navy', value: '#2b3a55' },
]

export function StyleSheet({ open, onClose, wallColor, onWallColorChange, frameStyle, onFrameStyleChange, spacing, onSpacingChange }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Style">
      <div className="space-y-6">
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Wall Color</h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {WALL_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => onWallColorChange(c.value)}
                className={[
                  'flex shrink-0 flex-col items-center gap-1.5 rounded-full p-0.5',
                  wallColor === c.value ? 'ring-2 ring-amber-500' : '',
                ].join(' ')}
              >
                <span className="block h-10 w-10 rounded-full border border-black/10" style={{ backgroundColor: c.value }} />
                <span className="text-[10px] text-zinc-500">{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Frame Style</h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {Object.entries(FRAME_STYLES).map(([key, style]) => (
              <button
                key={key}
                onClick={() => onFrameStyleChange(key)}
                className={[
                  'flex shrink-0 flex-col items-center gap-1.5 rounded-lg p-1.5',
                  frameStyle === key ? 'bg-amber-50 ring-2 ring-amber-500' : '',
                ].join(' ')}
              >
                <span className={`block h-10 w-10 bg-zinc-200 ${style.className}`} />
                <span className="text-[10px] text-zinc-500">{style.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Spacing</h3>
            <span className="text-xs text-zinc-400">{spacing}px</span>
          </div>
          <input
            type="range"
            min={8}
            max={48}
            step={2}
            value={spacing}
            onChange={(e) => onSpacingChange(Number(e.target.value))}
            className="w-full accent-amber-600"
          />
        </section>
      </div>
    </BottomSheet>
  )
}
