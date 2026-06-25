import { useState } from 'react'

export default function Stars({ value = 0, max = 5, size = 16, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(null) // null | 0.5 steps

  function scoreAt(i, e) {
    if (!interactive) return
    const rect = e.currentTarget.getBoundingClientRect()
    const half = e.clientX < rect.left + rect.width / 2
    return half ? i + 0.5 : i + 1
  }

  const display = hovered !== null ? hovered : value

  return (
    <div
      style={{ display: 'flex', gap: 2 }}
      onMouseLeave={() => interactive && setHovered(null)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const full  = display >= i + 1
        const half  = !full && display >= i + 0.5
        const empty = !full && !half

        return (
          <svg
            key={i}
            width={size} height={size} viewBox="0 0 24 24"
            style={{ cursor: interactive ? 'pointer' : 'default', flexShrink: 0 }}
            onMouseMove={e => interactive && setHovered(scoreAt(i, e))}
            onClick={e => interactive && onChange?.(scoreAt(i, e))}
          >
            <defs>
              <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#F59E0B"/>
                <stop offset="50%" stopColor="transparent"/>
              </linearGradient>
            </defs>
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill={full ? '#F59E0B' : half ? `url(#half-${i})` : 'none'}
              stroke={empty ? '#CBD5E1' : '#F59E0B'}
              strokeWidth="1.5"
            />
          </svg>
        )
      })}
    </div>
  )
}
