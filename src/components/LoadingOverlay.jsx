import { useEffect, useState } from 'react'

export default function LoadingOverlay() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 80)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return <div style={{ minHeight: '60vh' }} />

  return (
    <div style={s.wrap}>
      {/* Barra superior */}
      <div style={s.bar}>
        <div style={s.barFill} />
      </div>

      {/* Skeleton de contenido */}
      <div style={s.skeleton}>
        <div style={{ ...s.block, width: '40%', height: 32, marginBottom: '1.5rem' }} />
        <div style={{ ...s.block, width: '100%', height: 18, marginBottom: '0.75rem' }} />
        <div style={{ ...s.block, width: '85%', height: 18, marginBottom: '0.75rem' }} />
        <div style={{ ...s.block, width: '70%', height: 18, marginBottom: '2rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={s.card}>
              <div style={{ ...s.block, width: '100%', height: 140, marginBottom: '0.75rem', borderRadius: 8 }} />
              <div style={{ ...s.block, width: '70%', height: 14, marginBottom: '0.5rem' }} />
              <div style={{ ...s.block, width: '45%', height: 14 }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        @keyframes npBar {
          0%   { width: 0%; }
          60%  { width: 75%; }
          100% { width: 90%; }
        }
      `}</style>
    </div>
  )
}

const shimmerBg = 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)'

const s = {
  wrap: {
    minHeight: '80vh',
    padding: 'clamp(5rem,10vw,7rem) clamp(1rem,5vw,3rem) 3rem',
  },
  bar: {
    position: 'fixed', top: 0, left: 0, right: 0,
    height: 2.5, zIndex: 9999, pointerEvents: 'none',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #6C63FF, #00D4AA)',
    boxShadow: '0 0 8px rgba(108,99,255,0.6)',
    animation: 'npBar 6s cubic-bezier(0.1,0.05,0,1) forwards',
  },
  skeleton: {
    maxWidth: 1200, margin: '0 auto',
  },
  block: {
    borderRadius: 6,
    background: shimmerBg,
    backgroundSize: '1200px 100%',
    animation: 'shimmer 1.4s ease-in-out infinite',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '1rem',
  },
}
