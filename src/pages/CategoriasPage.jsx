import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8027'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.getCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={s.spinner}>
      <div style={s.ring} />
    </div>
  )

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroTag}>Explorar</div>
        <h1 style={s.heroTitle}>Categorías</h1>
        <p style={s.heroSub}>Encuentra exactamente lo que buscas navegando por nuestras categorías</p>
      </div>

      {categorias.length === 0 ? (
        <div style={s.empty}>
          <p style={{ color: '#8888A8' }}>No hay categorías disponibles por el momento.</p>
        </div>
      ) : (
        <div style={s.grid}>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate(`/?categoria=${cat.id}`)}
              style={s.card}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)'
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(108,99,255,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'
              }}
            >
              {/* Imagen o placeholder */}
              <div style={s.imgWrap}>
                {cat.imagenName
                  ? <img src={`${API}/uploads/categorias/${cat.imagenName}`} alt={cat.nombre} style={s.img} />
                  : <div style={s.imgPlaceholder}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#cg)" strokeWidth="1.2" strokeLinecap="round">
                        <defs>
                          <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6C63FF"/>
                            <stop offset="100%" stopColor="#00D4AA"/>
                          </linearGradient>
                        </defs>
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                }
              </div>

              {/* Info */}
              <div style={s.body}>
                <div style={s.name}>{cat.nombre}</div>
                {cat.descripcion && <p style={s.desc}>{cat.descripcion}</p>}
                <div style={s.footer}>
                  <span style={s.countBadge}>
                    {cat.totalProductos} producto{cat.totalProductos !== 1 ? 's' : ''}
                  </span>
                  <span style={s.arrow}>Ver →</span>
                </div>
              </div>
            </button>
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
  spinner: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', paddingTop: 64,
  },
  ring: {
    width: 44, height: 44,
    border: '3px solid rgba(108,99,255,0.2)',
    borderTopColor: '#6C63FF',
    borderRadius: '50%',
    animation: 'spin .7s linear infinite',
  },
  hero: {
    textAlign: 'center', marginBottom: 'clamp(2.5rem,5vw,4rem)',
  },
  heroTag: {
    display: 'inline-block',
    background: 'rgba(108,99,255,0.12)',
    border: '1px solid rgba(108,99,255,0.25)',
    color: '#6C63FF', borderRadius: 20,
    padding: '0.3rem 0.9rem', fontSize: '0.75rem', fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem',
  },
  heroTitle: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 900, fontSize: 'clamp(2rem,5vw,3.5rem)',
    color: '#E8E8F0', letterSpacing: '-0.04em',
    background: 'linear-gradient(135deg,#E8E8F0 30%,#8888A8)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    margin: '0 0 1rem',
  },
  heroSub: {
    color: '#8888A8', fontSize: 'clamp(0.9rem,2vw,1.1rem)', lineHeight: 1.7,
    maxWidth: 520, margin: '0 auto',
  },
  empty: { textAlign: 'center', padding: '4rem 0' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
    gap: '1.5rem',
  },
  card: {
    background: '#12121A',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 20,
    overflow: 'hidden',
    cursor: 'pointer',
    textAlign: 'left',
    padding: 0,
    transition: 'transform .2s, border-color .2s, box-shadow .2s',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    fontFamily: "'Inter',system-ui,sans-serif",
  },
  imgWrap: {
    width: '100%', aspectRatio: '16/9', overflow: 'hidden',
    background: '#1A1A26',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,rgba(108,99,255,0.08),rgba(0,212,170,0.06))',
  },
  body: { padding: '1.25rem' },
  name: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 800, fontSize: '1.05rem', color: '#E8E8F0',
    letterSpacing: '-0.02em', marginBottom: '0.45rem',
  },
  desc: {
    color: '#8888A8', fontSize: '0.83rem', lineHeight: 1.65,
    marginBottom: '1rem',
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  countBadge: {
    background: 'rgba(108,99,255,0.12)',
    border: '1px solid rgba(108,99,255,0.2)',
    color: '#6C63FF', borderRadius: 20,
    padding: '0.25rem 0.7rem', fontSize: '0.75rem', fontWeight: 700,
  },
  arrow: {
    color: '#8888A8', fontSize: '0.82rem', fontWeight: 600,
    transition: 'color .15s',
  },
}
