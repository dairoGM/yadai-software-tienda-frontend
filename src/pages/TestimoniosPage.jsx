import { useState, useEffect } from 'react'
import { api } from '../api'
import Stars from '../components/Stars'

export default function TestimoniosPage() {
  const [resenas, setResenas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getResenas()
      .then(setResenas)
      .catch(() => setResenas([]))
      .finally(() => setLoading(false))
  }, [])

  const promedio = resenas.length > 0
    ? (resenas.reduce((s, r) => s + r.puntuacion, 0) / resenas.length).toFixed(1)
    : null

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', paddingTop: 64 }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6C63FF', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
    </div>
  )

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.tag}>Opiniones reales</div>
        <h1 style={s.title}>Testimonios de clientes</h1>
        <p style={s.sub}>Lo que nuestros clientes dicen sobre los productos que han adquirido</p>

        {promedio && (
          <div style={s.statsRow}>
            <div style={s.stat}>
              <span style={s.statNum}>{promedio}</span>
              <Stars value={parseFloat(promedio)} size={20} />
            </div>
            <div style={s.statDivider} />
            <div style={s.stat}>
              <span style={s.statNum}>{resenas.length}</span>
              <span style={s.statLabel}>reseñas totales</span>
            </div>
            <div style={s.statDivider} />
            <div style={s.stat}>
              <span style={s.statNum}>{resenas.filter(r => r.compro).length}</span>
              <span style={s.statLabel}>compradores verificados</span>
            </div>
          </div>
        )}
      </div>

      {resenas.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, color: '#E8E8F0', marginTop: '1.5rem' }}>Todavía no hay reseñas</h2>
          <p style={{ color: '#8888A8', fontSize: '0.9rem', marginTop: '0.5rem' }}>Sé el primero en compartir tu experiencia.</p>
        </div>
      ) : (
        <div style={s.grid}>
          {resenas.map((r, i) => (
            <div key={i} style={s.card}>
              <div style={s.cardTop}>
                <div style={s.avatar}>{r.nombreUsuario?.[0]?.toUpperCase() || '?'}</div>
                <div style={{ flex: 1 }}>
                  <div style={s.name}>
                    {r.nombreUsuario}
                    {r.compro && (
                      <span style={s.verified}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ flexShrink: 0 }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Compra verificada
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <Stars value={r.puntuacion} size={13} />
                    <span style={{ fontSize: '0.72rem', color: '#8888A8' }}>{r.fechaFormateada}</span>
                  </div>
                </div>
              </div>

              {r.comentario && (
                <p style={s.comment}>&ldquo;{r.comentario}&rdquo;</p>
              )}

              <div style={s.product}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8888A8" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                {r.productoNombre}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  page: {
    maxWidth: 1200, margin: '0 auto',
    padding: 'calc(64px + clamp(2rem,4vw,3.5rem)) clamp(1rem,3vw,2rem) clamp(3rem,6vw,5rem)',
    fontFamily: "'Inter',system-ui,sans-serif",
  },
  hero: { textAlign: 'center', marginBottom: 'clamp(2.5rem,5vw,4rem)' },
  tag: {
    display: 'inline-block',
    background: 'rgba(0,212,170,0.1)',
    border: '1px solid rgba(0,212,170,0.2)',
    color: '#00D4AA', borderRadius: 20,
    padding: '0.3rem 0.9rem', fontSize: '0.75rem', fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem',
  },
  title: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 900, fontSize: 'clamp(2rem,5vw,3.5rem)',
    color: '#E8E8F0', letterSpacing: '-0.04em',
    background: 'linear-gradient(135deg,#E8E8F0 30%,#8888A8)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    margin: '0 0 1rem',
  },
  sub: { color: '#8888A8', fontSize: 'clamp(0.9rem,2vw,1.1rem)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 2rem' },
  statsRow: {
    display: 'inline-flex', alignItems: 'center', gap: '2rem',
    background: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, padding: '1.1rem 2rem',
    flexWrap: 'wrap', justifyContent: 'center',
  },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' },
  statNum: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 900, fontSize: '1.6rem', color: '#E8E8F0',
    background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    lineHeight: 1,
  },
  statLabel: { fontSize: '0.72rem', color: '#8888A8', fontWeight: 500 },
  statDivider: { width: 1, height: 40, background: 'rgba(255,255,255,0.06)' },

  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0' },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 18,
    background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 12px 32px rgba(108,99,255,0.3)',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
    gap: '1.25rem',
  },
  card: {
    background: '#12121A',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.85rem',
  },
  cardTop: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' },
  avatar: {
    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.9rem',
  },
  name: {
    fontWeight: 700, fontSize: '0.9rem', color: '#E8E8F0',
    display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
  },
  verified: {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)',
    color: '#00D4AA', borderRadius: 20,
    padding: '0.15rem 0.5rem', fontSize: '0.65rem', fontWeight: 700,
  },
  comment: {
    color: '#C8C8D8', fontSize: '0.875rem', lineHeight: 1.7,
    fontStyle: 'italic', margin: 0,
  },
  product: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    color: '#8888A8', fontSize: '0.75rem',
    borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.75rem',
  },
}
