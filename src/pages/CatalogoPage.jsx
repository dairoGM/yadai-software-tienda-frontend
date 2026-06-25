import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { api } from '../api'
import ProductSlider from '../components/ProductSlider'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8027'

const BENEFICIOS = [
  { icon: '✦', title: 'Calidad Garantizada', desc: 'Todos nuestros productos pasan por control de calidad antes de llegar a tus manos.', color: '#6C63FF' },
  { icon: '💎', title: 'Mejores Precios', desc: 'Precios competitivos sin sacrificar calidad. Encuentra lo que necesitas sin pagar de más.', color: '#00D4AA' },
  { icon: '⚡', title: 'Envío Rápido', desc: 'Coordinamos la entrega por WhatsApp para que recibas tu pedido lo antes posible.', color: '#F59E0B' },
  { icon: '🔒', title: 'Compra Segura', desc: 'Tu información está protegida. Realizamos la gestión directo por WhatsApp, sin datos sensibles en línea.', color: '#EF4444' },
  { icon: '💬', title: 'Soporte 24/7', desc: 'Estamos disponibles para resolver tus dudas por WhatsApp en cualquier momento.', color: '#8B5CF6' },
  { icon: '⭐', title: 'Clientes Felices', desc: 'Miles de clientes satisfechos respaldan la calidad de nuestros productos y servicio.', color: '#EC4899' },
]

export default function CatalogoPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('nombre')
  const [searchParams, setSearchParams] = useSearchParams()
  const categoriaFiltro = searchParams.get('categoria') ? parseInt(searchParams.get('categoria')) : null
  const productosRef = useRef(null)
  const loc = useLocation()

  useEffect(() => {
    Promise.all([api.getProductos(), api.getCategorias()])
      .then(([prods, cats]) => { setProductos(prods); setCategorias(cats) })
      .catch(() => setError('No se pudo cargar el catálogo. Verifica tu conexión.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading && categoriaFiltro && productosRef.current) {
      const timeout = setTimeout(() => {
        productosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [loading, categoriaFiltro])

  // Scroll to section when navigating from another route (Navbar passes state.scrollTo)
  useEffect(() => {
    const target = loc.state?.scrollTo
    if (!target) return
    const attempt = (tries = 0) => {
      const el = document.getElementById(target)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      } else if (tries < 10) {
        setTimeout(() => attempt(tries + 1), 80)
      }
    }
    attempt()
  }, [loc.state?.scrollTo])

  const categoriaActual = categorias.find(c => c.id === categoriaFiltro)

  const filtered = useMemo(() => {
    let list = [...productos]
    if (categoriaFiltro) list = list.filter(p => p.categoriaId === categoriaFiltro)
    if (q.trim()) {
      const lq = q.toLowerCase()
      list = list.filter(p => p.nombre.toLowerCase().includes(lq) || p.descripcion?.toLowerCase().includes(lq))
    }
    if (sort === 'precio_asc')  list.sort((a, b) => a.precioVenta - b.precioVenta)
    if (sort === 'precio_desc') list.sort((a, b) => b.precioVenta - a.precioVenta)
    if (sort === 'valoracion')  list.sort((a, b) => (b.promedioResenas || 0) - (a.promedioResenas || 0))
    if (sort === 'nombre')      list.sort((a, b) => a.nombre.localeCompare(b.nombre))
    return list
  }, [productos, q, sort, categoriaFiltro])

  return (
    <div style={s.page}>
      {/* HERO ── section id for scroll-spy */}
      <section id="hero" style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.orb1} />
          <div style={s.orb2} />
          <span style={s.eyebrow}>Catálogo de productos</span>
          <h1 style={s.heroTitle}>Encuentra lo que<br />necesitas</h1>
          <p style={s.heroSub}>
            Explora nuestros productos, elige los que quieras y coordina tu pedido por WhatsApp en segundos.
          </p>
          <div style={s.heroSearch}>
            <div style={s.searchWrap}>
              <svg style={s.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar productos…" style={s.searchInput} />
              {q && (
                <button onClick={() => setQ('')} style={s.clearBtn} aria-label="Limpiar">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} style={s.select}>
              <option value="nombre" style={s.option}>Nombre A–Z</option>
              <option value="precio_asc" style={s.option}>Precio: menor a mayor</option>
              <option value="precio_desc" style={s.option}>Precio: mayor a menor</option>
              <option value="valoracion" style={s.option}>Mejor valorados</option>
            </select>
          </div>
        </div>
      </section>

      {/* Intermediate sections only show when NOT searching */}
      {!q.trim() && (
        <>
          {/* CATEGORÍAS BENTO ── section id for scroll-spy */}
          <section id="categorias" style={s.catSection}>
            <div style={s.sectionInner}>
              <div style={s.sectionHeader}>
                <span style={s.sectionEyebrow}>Navega por sección</span>
                <h2 style={s.sectionTitle}>Explora por Categoría</h2>
                <p style={s.sectionSub}>Selecciona una categoría para descubrir todos sus productos</p>
              </div>

              {!loading && categorias.length > 0 && (
                <BentoGrid
                  categorias={categorias}
                  categoriaFiltro={categoriaFiltro}
                  setSearchParams={setSearchParams}
                />
              )}
            </div>
          </section>

          {/* BENEFICIOS ── section id for scroll-spy */}
          <section id="beneficios" style={s.benfSection}>
            <div style={s.sectionInner}>
              <div style={s.sectionHeader}>
                <span style={s.sectionEyebrow}>¿Por qué nosotros?</span>
                <h2 style={s.sectionTitle}>¿Por Qué Elegir Nuestros Productos?</h2>
                <p style={s.sectionSub}>Comprometidos con brindarte la mejor experiencia de compra</p>
              </div>
              <div style={s.benfGrid}>
                {BENEFICIOS.map(b => <BeneficioCard key={b.title} b={b} />)}
              </div>
            </div>
          </section>
        </>
      )}

      {/* PRODUCTOS ── section id for scroll-spy */}
      <section id="productos" ref={productosRef} style={{ ...s.productosSection, ...(q.trim() ? s.searchingResults : {}) }}>
        <div style={s.sectionInner}>
          {q.trim() && (
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h2 style={s.sectionTitle}>Resultados para "{q}"</h2>
              <p style={s.sectionSub}>Hemos encontrado {filtered.length} producto{filtered.length !== 1 ? 's' : ''}</p>
            </div>
          )}
          
          {loading && (
            <div style={s.grid}>
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          )}
          {error && (
            <div style={s.stateBox}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ color: 'var(--text-2)', marginTop: '0.75rem' }}>{error}</p>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div style={s.stateBox}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#8888A8" strokeWidth="1" strokeLinecap="round" style={{ opacity: 0.4 }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <p style={{ color: 'var(--text-2)', marginTop: '1rem', fontSize: '0.95rem' }}>
                {q ? `Sin resultados para "${q}"` : 'No hay productos disponibles.'}
              </p>
              {q && <button onClick={() => setQ('')} style={s.clearSearch}>Limpiar búsqueda</button>}
            </div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <>
              {categoriaActual && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={s.filterChip}>
                    {categoriaActual.nombre}
                    <button onClick={() => setSearchParams({})} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6C63FF', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}>×</button>
                  </span>
                </div>
              )}
              <ProductSlider productos={filtered} />
            </>
          )}
        </div>
      </section>
    </div>
  )
}

// ── Bento grid ──────────────────────────────────────────────────────────────
function BentoGrid({ categorias, categoriaFiltro, setSearchParams }) {
  const toggle = (cat) => setSearchParams(categoriaFiltro === cat.id ? {} : { categoria: cat.id })
  const [narrow, setNarrow] = useState(typeof window !== 'undefined' && window.innerWidth < 720)

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 720)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (narrow) {
    // Simple 2-col grid on small screens
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridAutoRows: '160px', gap: '0.75rem' }}>
        {categorias.map(cat => (
          <BentoCard key={cat.id} cat={cat} active={categoriaFiltro === cat.id} toggle={toggle} style={{}} />
        ))}
      </div>
    )
  }

  const featured = categorias.slice(0, 2)
  const rest = categorias.slice(2)

  return (
    <div style={bs.grid}>
      {featured.map((cat, i) => (
        <BentoCard key={cat.id} cat={cat} active={categoriaFiltro === cat.id} toggle={toggle}
          style={{ ...bs.featuredCard, ...(i === 0 ? bs.featuredLeft : bs.featuredRight) }} large />
      ))}
      {rest.map(cat => (
        <BentoCard key={cat.id} cat={cat} active={categoriaFiltro === cat.id} toggle={toggle}
          style={bs.regularCard} />
      ))}
    </div>
  )
}

function BentoCard({ cat, active, toggle, style, large }) {
  const [hovered, setHovered] = useState(false)
  const on = active || hovered

  return (
    <button
      onClick={() => toggle(cat)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...bs.card,
        ...style,
        border: active ? '2px solid #6C63FF' : `2px solid ${hovered ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: active ? '0 0 0 4px rgba(108,99,255,0.18), 0 12px 40px rgba(0,0,0,0.4)' : hovered ? '0 8px 30px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.2)',
        transform: on ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
      }}>
      {/* Background image or gradient */}
      {cat.imagenName
        ? <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8027'}/uploads/categorias/${cat.imagenName}`}
            alt="" style={bs.bgImg} />
        : <div style={{ ...bs.bgGrad, background: `linear-gradient(135deg, rgba(108,99,255,${on ? 0.18 : 0.08}), rgba(0,212,170,${on ? 0.12 : 0.04}))` }} />
      }
      {/* Overlay */}
      <div style={{ ...bs.overlay, opacity: on ? 0.7 : 0.5 }} />

      {/* Content */}
      <div style={bs.cardContent}>
        <span style={{ ...bs.countBadge, opacity: on ? 1 : 0.8 }}>
          {cat.totalProductos} producto{cat.totalProductos !== 1 ? 's' : ''}
        </span>
        <div>
          <div style={{ ...bs.cardName, fontSize: large ? '1.25rem' : '0.95rem' }}>{cat.nombre}</div>
          {cat.descripcion && large && (
            <div style={bs.cardDesc}>{cat.descripcion}</div>
          )}
        </div>
        <div style={{ ...bs.arrow, opacity: on ? 1 : 0, transform: on ? 'translateX(0)' : 'translateX(-6px)' }}>
          {active ? '✓ Filtrando' : 'Ver productos →'}
        </div>
      </div>
    </button>
  )
}

const bs = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridAutoRows: '200px',
    gap: '1rem',
  },
  featuredCard: { gridRow: 'span 2' },
  featuredLeft: { gridColumn: 'span 2' },
  featuredRight: { gridColumn: 'span 2' },
  regularCard: { gridColumn: 'span 1' },
  card: {
    position: 'relative', overflow: 'hidden',
    borderRadius: 20, cursor: 'pointer',
    background: '#12121A', padding: 0,
    fontFamily: "'Inter',system-ui,sans-serif",
    transition: 'all .25s cubic-bezier(.4,0,.2,1)',
    display: 'flex', flexDirection: 'column',
    textAlign: 'left',
  },
  bgImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
  bgGrad: { position: 'absolute', inset: 0, zIndex: 0, transition: 'background .25s' },
  overlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%)',
    zIndex: 1, transition: 'opacity .25s',
  },
  cardContent: {
    position: 'relative', zIndex: 2,
    padding: '1rem 1.1rem', height: '100%',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between',
  },
  countBadge: {
    alignSelf: 'flex-start',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff', borderRadius: 20,
    padding: '0.2rem 0.65rem', fontSize: '0.7rem', fontWeight: 600,
    transition: 'opacity .2s',
  },
  cardName: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
    marginBottom: '0.25rem',
  },
  cardDesc: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 },
  arrow: {
    fontSize: '0.78rem', color: '#6C63FF', fontWeight: 700,
    transition: 'all .25s',
  },
}

// ── Beneficio card ───────────────────────────────────────────────────────────
function BeneficioCard({ b }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...ben.card,
        borderColor: hovered ? b.color + '55' : 'rgba(255,255,255,0.07)',
        boxShadow: hovered ? `0 0 30px ${b.color}22, 0 8px 24px rgba(0,0,0,0.3)` : '0 2px 12px rgba(0,0,0,0.15)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        background: hovered ? `linear-gradient(135deg, rgba(${hexToRgb(b.color)},0.08) 0%, var(--card-bg) 100%)` : 'var(--card-bg)',
      }}>
      <div style={{ ...ben.iconWrap, background: `${b.color}22`, boxShadow: hovered ? `0 0 20px ${b.color}55` : 'none' }}>
        <span style={ben.icon}>{b.icon}</span>
      </div>
      <h3 style={ben.title}>{b.title}</h3>
      <p style={ben.desc}>{b.desc}</p>
    </div>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

const ben = {
  card: {
    borderRadius: 20, border: '1px solid',
    padding: '1.75rem 1.5rem',
    display: 'flex', flexDirection: 'column', gap: '0.85rem',
    transition: 'all .3s cubic-bezier(.4,0,.2,1)',
    cursor: 'default',
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'box-shadow .3s',
  },
  icon: { fontSize: '1.5rem', lineHeight: 1 },
  title: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 700, fontSize: '1rem',
    color: 'var(--text)', letterSpacing: '-0.02em', margin: 0,
  },
  desc: { color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 },
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ aspectRatio: '4/3', background: 'var(--bg-2)', animation: 'pulse 1.6s ease-in-out infinite' }} />
      <div style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        <div style={{ height: 13, borderRadius: 4, background: 'var(--bg-2)', width: '70%', animation: 'pulse 1.6s ease-in-out infinite' }} />
        <div style={{ height: 11, borderRadius: 4, background: 'var(--bg-2)', width: '45%', animation: 'pulse 1.6s ease-in-out infinite' }} />
        <div style={{ height: 28, borderRadius: 8, background: 'var(--bg-2)', marginTop: '0.5rem', animation: 'pulse 1.6s ease-in-out infinite' }} />
      </div>
    </div>
  )
}

const s = {
  page: { fontFamily: "'Inter',system-ui,sans-serif", minHeight: '100vh' },

  hero: {
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%)',
    borderBottom: '1px solid rgba(108,99,255,0.15)',
    paddingTop: 64,
  },
  heroInner: {
    maxWidth: 800, margin: '0 auto',
    padding: 'clamp(3.5rem,7vw,6rem) clamp(1rem,3vw,2rem) clamp(2.5rem,5vw,4rem)',
    textAlign: 'center', position: 'relative', zIndex: 1,
  },
  orb1: {
    position: 'absolute', top: '-80px', left: '10%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-60px', right: '5%',
    width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: '0.72rem', fontWeight: 700,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: '#6C63FF', marginBottom: '1rem',
    background: 'rgba(108,99,255,0.12)',
    border: '1px solid rgba(108,99,255,0.25)',
    borderRadius: 100, padding: '0.3rem 0.9rem',
  },
  heroTitle: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 800, fontSize: 'clamp(2rem,5vw,3.5rem)',
    lineHeight: 1.1, letterSpacing: '-0.04em',
    color: 'var(--text)', marginBottom: '1rem',
  },
  heroSub: {
    color: 'var(--text-2)', fontSize: 'clamp(0.9rem,2vw,1.05rem)',
    lineHeight: 1.75, maxWidth: 520, margin: '0 auto 2.5rem',
  },
  heroSearch: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' },
  searchWrap: { position: 'relative', flex: '1 1 260px', maxWidth: 440 },
  searchIcon: {
    position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
    color: 'var(--text-2)', pointerEvents: 'none',
  },
  searchInput: {
    width: '100%', padding: '0.8rem 2.5rem 0.8rem 2.75rem',
    background: 'var(--bg-2)',
    border: '1px solid var(--input-border)',
    borderRadius: 12, fontSize: '0.9rem',
    fontFamily: 'inherit', outline: 'none',
    color: 'var(--text)', boxSizing: 'border-box',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease',
  },
  clearBtn: {
    position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6,
    cursor: 'pointer', color: 'var(--text-2)',
    width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  select: {
    background: 'var(--bg-2)',
    border: '1px solid var(--input-border)',
    borderRadius: 12, padding: '0.8rem 2.5rem 0.8rem 1rem',
    fontSize: '0.875rem', fontFamily: 'inherit',
    outline: 'none', cursor: 'pointer', color: 'var(--text)',
    backdropFilter: 'blur(8px)',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236C63FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    transition: 'all 0.2s ease',
  },
  option: {
    background: 'var(--bg-2)',
    color: 'var(--text)',
    padding: '10px',
  },

  sectionInner: { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1rem,3vw,2rem)' },
  sectionHeader: { textAlign: 'center', marginBottom: '2.5rem' },
  sectionEyebrow: {
    display: 'inline-block',
    background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
    color: '#6C63FF', borderRadius: 20,
    padding: '0.25rem 0.85rem', fontSize: '0.72rem', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem',
  },
  sectionTitle: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2.2rem)',
    color: 'var(--text)', letterSpacing: '-0.03em', margin: '0 0 0.5rem',
  },
  sectionSub: { color: 'var(--text-2)', fontSize: '0.9rem', margin: 0 },

  catSection: { padding: 'clamp(3rem,6vw,5rem) 0 0' },
  benfSection: { padding: 'clamp(3rem,6vw,5rem) 0' },
  benfGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
    gap: '1.25rem',
  },

  productosSection: { padding: 'clamp(2rem,4vw,3rem) 0 clamp(3rem,6vw,5rem)' },
  searchingResults: { paddingTop: '0.5rem', marginTop: '-1rem' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' },
  count: { fontSize: '0.82rem', color: 'var(--text-2)' },
  filterChip: {
    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
    background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)',
    color: '#6C63FF', borderRadius: 20, padding: '0.25rem 0.7rem',
    fontSize: '0.78rem', fontWeight: 600,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
    gap: '1.25rem',
  },
  stateBox: {
    textAlign: 'center', padding: '5rem 1rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  clearSearch: {
    marginTop: '1rem', background: 'rgba(108,99,255,0.1)',
    border: '1px solid rgba(108,99,255,0.25)',
    borderRadius: 10, padding: '0.55rem 1.25rem',
    color: '#6C63FF', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600,
  },
}
