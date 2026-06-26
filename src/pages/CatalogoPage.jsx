import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { api } from '../api'
import ProductSlider from '../components/ProductSlider'
import LoadingOverlay from '../components/LoadingOverlay'

const BENEFICIOS = [
  { icon: '✦', title: 'Calidad Garantizada', desc: 'Todos nuestros productos pasan por control de calidad antes de llegar a tus manos.', color: '#6C63FF' },
  { icon: '💎', title: 'Mejores Precios', desc: 'Precios competitivos sin sacrificar calidad. Encuentra lo que necesitas sin pagar de más.', color: '#00D4AA' },
  { icon: '⚡', title: 'Envío Rápido', desc: 'Coordinamos la entrega por WhatsApp para que recibas tu pedido lo antes posible.', color: '#F59E0B' },
  { icon: '🔒', title: 'Compra Segura', desc: 'Tu información está protegida. Realizamos la gestión directo por WhatsApp, sin datos sensibles en línea.', color: '#EF4444' },
  { icon: '💬', title: 'Soporte 24/7', desc: 'Estamos disponibles para resolver tus dudas por WhatsApp en cualquier momento.', color: '#8B5CF6' },
  { icon: '⭐', title: 'Clientes Felices', desc: 'Miles de clientes satisfechos respaldan la calidad de nuestros productos y servicio.', color: '#EC4899' },
]

const PAGE_SIZE = 12

export default function CatalogoPage() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [totalProductos, setTotalProductos] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false) // "ver más" páginas adicionales
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('nombre')
  const [searchParams, setSearchParams] = useSearchParams()
  const categoriaFiltro = searchParams.get('categoria') ? parseInt(searchParams.get('categoria')) : null
  const productosRef = useRef(null)
  const loc = useLocation()
  // Ref para evitar doble-fetch al montar cuando cambia categoriaFiltro
  const initialFetchDone = useRef(false)

  // ── Carga inicial: categorías + primera página de productos en paralelo ────
  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      api.getCategorias(),
      api.getProductos({ page: 1, limit: PAGE_SIZE, categoria: categoriaFiltro, q: '', sort: 'nombre' }),
    ])
      .then(([cats, prods]) => {
        setCategorias(cats)
        setProductos(prods.data)
        setTotalProductos(prods.total)
        setPage(1)
        initialFetchDone.current = true
      })
      .catch(() => setError('No se pudo cargar el catálogo. Verifica tu conexión.'))
      .finally(() => { setLoading(false); window.hideSplash?.() })
  }, []) // eslint-disable-line

  // ── Re-fetch cuando cambian filtros (tras carga inicial) ──────────────────
  const fetchFiltrado = useCallback((pg = 1, append = false) => {
    if (pg === 1) setLoading(true)
    else setLoadingMore(true)
    setError(null)
    api.getProductos({ page: pg, limit: PAGE_SIZE, categoria: categoriaFiltro, q: q.trim(), sort })
      .then(res => {
        setProductos(append ? prev => [...prev, ...res.data] : res.data)
        setTotalProductos(res.total)
        setPage(pg)
      })
      .catch(() => setError('No se pudo cargar el catálogo. Verifica tu conexión.'))
      .finally(() => { setLoading(false); setLoadingMore(false) })
  }, [categoriaFiltro, q, sort])

  useEffect(() => {
    if (!initialFetchDone.current) return
    fetchFiltrado(1, false)
  }, [categoriaFiltro, q, sort]) // eslint-disable-line

  // ── Si hay filtro de categoría, hacer scroll a productos ──────────────────
  useEffect(() => {
    if (!loading && categoriaFiltro && productosRef.current) {
      const t = setTimeout(() => {
        productosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
      return () => clearTimeout(t)
    }
  }, [loading, categoriaFiltro])

  // ── Scroll a sección cuando viene de otra ruta ────────────────────────────
  useEffect(() => {
    const target = loc.state?.scrollTo
    if (!target) return
    const attempt = (tries = 0) => {
      const el = document.getElementById(target)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      else if (tries < 10) setTimeout(() => attempt(tries + 1), 80)
    }
    attempt()
  }, [loc.state?.scrollTo])

  const categoriaActual = categorias.find(c => c.id === categoriaFiltro)
  const totalPages = Math.ceil(totalProductos / PAGE_SIZE)
  const hasMore = page < totalPages

  if (loading && productos.length === 0 && categorias.length === 0) return <LoadingOverlay />

  return (
    <div style={s.page}>
      {/* HERO */}
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
            </select>
          </div>
        </div>
      </section>

      {!q.trim() && (
        <>
          {/* CATEGORÍAS */}
          <section id="categorias" style={s.catSection}>
            <div style={s.sectionInner}>
              <div style={s.sectionHeader}>
                <span style={s.sectionEyebrow}>Navega por sección</span>
                <h2 style={s.sectionTitle}>Explora por Categoría</h2>
                <p style={s.sectionSub}>Selecciona una categoría para descubrir todos sus productos</p>
              </div>
              {categorias.length > 0 && (
                <BentoGrid
                  categorias={categorias}
                  categoriaFiltro={categoriaFiltro}
                  setSearchParams={setSearchParams}
                />
              )}
            </div>
          </section>

          {/* BENEFICIOS */}
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

      {/* PRODUCTOS */}
      <section id="productos" ref={productosRef} style={{ ...s.productosSection, ...(q.trim() ? s.searchingResults : {}) }}>
        <div style={s.sectionInner}>
          {q.trim() && (
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h2 style={s.sectionTitle}>Resultados para "{q}"</h2>
              {!loading && <p style={s.sectionSub}>{totalProductos} producto{totalProductos !== 1 ? 's' : ''} encontrado{totalProductos !== 1 ? 's' : ''}</p>}
            </div>
          )}

          {/* Chip de categoría activa */}
          {!q.trim() && categoriaActual && (
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={s.filterChip}>
                {categoriaActual.nombre}
                <button onClick={() => setSearchParams({})} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6C63FF', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}>×</button>
              </span>
            </div>
          )}

          {/* Skeleton mientras carga la primera página */}
          {loading && productos.length === 0 && (
            <div style={s.grid}>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} />)}
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

          {/* Estado vacío */}
          {!loading && !error && productos.length === 0 && (
            <div style={s.stateBox}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#8888A8" strokeWidth="1" strokeLinecap="round" style={{ opacity: 0.4 }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <p style={{ color: 'var(--text-2)', marginTop: '1rem', fontSize: '0.95rem' }}>
                {q ? `Sin resultados para "${q}"` : 'No hay productos disponibles en esta categoría.'}
              </p>
              {q && <button onClick={() => setQ('')} style={s.clearSearch}>Limpiar búsqueda</button>}
            </div>
          )}

          {/* Grid de productos */}
          {productos.length > 0 && (
            <>
              <ProductSlider productos={productos} />

              {/* Skeleton de páginas adicionales */}
              {loadingMore && (
                <div style={{ ...s.grid, marginTop: '1.25rem' }}>
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}
                </div>
              )}

              {/* Botón "Ver más" */}
              {!loadingMore && hasMore && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button onClick={() => fetchFiltrado(page + 1, true)} style={s.loadMoreBtn}>
                    Ver más productos ({totalProductos - productos.length} restantes)
                  </button>
                </div>
              )}

              {/* Nota cuando se muestran todos */}
              {!loadingMore && !hasMore && totalProductos > PAGE_SIZE && (
                <p style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: '0.8rem', marginTop: '2rem', opacity: 0.6 }}>
                  Mostrando todos los {totalProductos} productos
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

// ── Bento grid ──────────────────────────────────────────────────────────────
const BENTO_STYLES = [
  { bg: '#101B3B', border: '#1E336B', glow: '#3B82F6', icon: '📡', col: 2, row: 1, pop: true },
  { bg: '#471F08', border: '#7C360E', glow: '#F97316', icon: '⚡', col: 2, row: 2, pop: true },
  { bg: '#250E4C', border: '#4C1D95', glow: '#A855F7', icon: '📱', col: 2, row: 2, pop: false },
  { bg: '#1A1D23', border: '#374151', glow: '#9CA3AF', icon: '🔧', col: 2, row: 1, pop: false },
  { bg: '#2C120B', border: '#7F1D1D', glow: '#EF4444', icon: '🚗', col: 2, row: 2, pop: true },
  { bg: '#1C0A14', border: '#4A1132', glow: '#EC4899', icon: '👙', col: 1, row: 1, pop: false },
  { bg: '#271018', border: '#631B36', glow: '#F43F5E', icon: '🔒', col: 1, row: 1, pop: false },
  { bg: '#250E4C', border: '#4C1D95', glow: '#A855F7', icon: '👗', col: 2, row: 1, pop: false },
  { bg: '#252109', border: '#A16207', glow: '#F59E0B', icon: '🛵', col: 1, row: 1, pop: false },
  { bg: '#06261A', border: '#065F46', glow: '#10B981', icon: '💻', col: 1, row: 1, pop: true },
  { bg: '#0F172A', border: '#1E293B', glow: '#3B82F6', icon: '🏋️', col: 1, row: 1, pop: false },
  { bg: '#0A251B', border: '#114D35', glow: '#22C55E', icon: '🏠', col: 1, row: 1, pop: false },
]

function BentoGrid({ categorias, categoriaFiltro, setSearchParams }) {
  const toggle = (catId) => setSearchParams(catId === null ? {} : { categoria: catId })
  const [narrow, setNarrow] = useState(typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const totalProductos = categorias.reduce((sum, c) => sum + parseInt(c.totalProductos || 0), 0)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: narrow ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gridAutoRows: narrow ? '160px' : '150px',
      gridAutoFlow: 'dense',
      gap: '1rem',
    }}>
      <BentoCard
        cat={{ id: null, nombre: 'Todos', totalProductos }}
        active={!categoriaFiltro}
        toggle={toggle}
        styleDef={{ bg: '#0A251B', border: '#114D35', glow: '#22C55E', icon: '🛍️', col: 2, row: 2, pop: false }}
        narrow={narrow}
      />
      {categorias.map((cat, i) => (
        <BentoCard
          key={cat.id}
          cat={cat}
          active={categoriaFiltro === cat.id}
          toggle={toggle}
          styleDef={BENTO_STYLES[i % BENTO_STYLES.length]}
          narrow={narrow}
        />
      ))}
    </div>
  )
}

function BentoCard({ cat, active, toggle, styleDef, narrow }) {
  const [hovered, setHovered] = useState(false)
  const on = active || hovered
  const spanCol = narrow ? (styleDef.col === 2 ? 2 : 1) : styleDef.col
  const spanRow = narrow ? 1 : styleDef.row

  return (
    <button
      onClick={() => toggle(cat.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: '24px', cursor: 'pointer',
        background: styleDef.bg,
        border: `1px solid ${styleDef.border}`,
        fontFamily: "'Inter',system-ui,sans-serif",
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        display: 'flex', flexDirection: 'column', textAlign: 'left',
        gridColumn: `span ${spanCol}`, gridRow: `span ${spanRow}`,
        padding: '1.25rem',
        boxShadow: on ? `0 8px 32px ${styleDef.glow}20, inset 0 0 0 1px ${styleDef.glow}` : '0 4px 12px rgba(0,0,0,0.2)',
        transform: on ? 'scale(0.98)' : 'scale(1)',
      }}
    >
      <div style={{
        position: 'absolute', top: '20%', right: '10%',
        width: '50%', height: '50%',
        background: `radial-gradient(circle, ${styleDef.glow}40 0%, transparent 60%)`,
        filter: 'blur(30px)', zIndex: 0,
        opacity: on ? 1 : 0.6, transition: 'opacity 0.3s'
      }} />
      {cat.imagenName && (
        <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8027'}/uploads/categorias/${cat.imagenName}`}
          alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.1, zIndex: 0 }} />
      )}
      {styleDef.pop && (
        <div style={{
          position: 'absolute', top: '1rem', left: '1rem',
          background: 'linear-gradient(90deg, #F97316, #EA580C)',
          color: 'white', padding: '0.2rem 0.5rem', borderRadius: '20px',
          fontSize: '0.6rem', fontWeight: 800, zIndex: 2, letterSpacing: '0.05em',
          boxShadow: '0 2px 8px rgba(249,115,22,0.4)', display: 'flex', alignItems: 'center', gap: '0.2rem'
        }}>
          <span style={{ fontSize: '0.6rem' }}>+</span> POPULAR
        </div>
      )}
      {(!narrow || spanRow > 1 || spanCol === 1) && (
        <div style={{
          position: 'absolute',
          top: spanRow === 2 ? (narrow ? '0.75rem' : '1.5rem') : '1rem',
          right: spanRow === 2 ? (narrow ? '0.75rem' : '1.5rem') : '1rem',
          width: spanRow === 2 ? '64px' : '48px',
          height: spanRow === 2 ? '64px' : '48px',
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: spanRow === 2 ? '1.8rem' : '1.2rem',
          boxShadow: '0 8px 16px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.05)',
          zIndex: 2,
          transform: on ? 'translateY(-2px)' : 'none', transition: 'transform 0.3s'
        }}>
          {cat.imagenName
            ? <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8027'}/uploads/categorias/${cat.imagenName}`} style={{ width: '60%', height: '60%', objectFit: 'contain' }} alt="" />
            : <span style={{ filter: `drop-shadow(0 2px 4px ${styleDef.glow}60)` }}>{styleDef.icon}</span>
          }
        </div>
      )}
      <div style={{ marginTop: 'auto', position: 'relative', zIndex: 2 }}>
        <div style={{
          fontFamily: "'Inter',sans-serif", fontWeight: 800, color: '#FFFFFF',
          fontSize: (spanRow === 2 || spanCol === 2) ? '1.15rem' : '0.9rem',
          letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: '0.15rem',
          filter: active ? `drop-shadow(0 0 8px ${styleDef.glow}80)` : 'none',
          transition: 'filter 0.3s'
        }}>
          {cat.nombre}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
          {cat.totalProductos || 0} productos
        </div>
      </div>
    </button>
  )
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
    transition: 'all .3s cubic-bezier(.4,0,.2,1)', cursor: 'default',
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'box-shadow .3s',
  },
  icon: { fontSize: '1.5rem', lineHeight: 1 },
  title: {
    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1rem',
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
    display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
    letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6C63FF',
    marginBottom: '1rem', background: 'rgba(108,99,255,0.12)',
    border: '1px solid rgba(108,99,255,0.25)', borderRadius: 100, padding: '0.3rem 0.9rem',
  },
  heroTitle: {
    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800,
    fontSize: 'clamp(2rem,5vw,3.5rem)', lineHeight: 1.1, letterSpacing: '-0.04em',
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
    background: 'var(--bg-2)', border: '1px solid var(--input-border)',
    borderRadius: 12, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none',
    color: 'var(--text)', boxSizing: 'border-box', backdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease',
  },
  clearBtn: {
    position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6,
    cursor: 'pointer', color: 'var(--text-2)',
    width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  select: {
    background: 'var(--bg-2)', border: '1px solid var(--input-border)',
    borderRadius: 12, padding: '0.8rem 2.5rem 0.8rem 1rem',
    fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
    cursor: 'pointer', color: 'var(--text)', backdropFilter: 'blur(8px)',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236C63FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center',
    transition: 'all 0.2s ease',
  },
  option: { background: 'var(--bg-2)', color: 'var(--text)', padding: '10px' },
  sectionInner: { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1rem,3vw,2rem)' },
  sectionHeader: { textAlign: 'center', marginBottom: '2.5rem' },
  sectionEyebrow: {
    display: 'inline-block', background: 'rgba(108,99,255,0.1)',
    border: '1px solid rgba(108,99,255,0.2)', color: '#6C63FF', borderRadius: 20,
    padding: '0.25rem 0.85rem', fontSize: '0.72rem', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem',
  },
  sectionTitle: {
    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800,
    fontSize: 'clamp(1.5rem,3vw,2.2rem)', color: 'var(--text)',
    letterSpacing: '-0.03em', margin: '0 0 0.5rem',
  },
  sectionSub: { color: 'var(--text-2)', fontSize: '0.9rem', margin: 0 },
  catSection: { padding: 'clamp(3rem,6vw,5rem) 0 0' },
  benfSection: { padding: 'clamp(3rem,6vw,5rem) 0' },
  benfGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' },
  productosSection: { padding: 'clamp(2rem,4vw,3rem) 0 clamp(3rem,6vw,5rem)' },
  searchingResults: { paddingTop: '0.5rem', marginTop: '-1rem' },
  filterChip: {
    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
    background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)',
    color: '#6C63FF', borderRadius: 20, padding: '0.25rem 0.7rem',
    fontSize: '0.78rem', fontWeight: 600,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.25rem' },
  stateBox: {
    textAlign: 'center', padding: '5rem 1rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  clearSearch: {
    marginTop: '1rem', background: 'rgba(108,99,255,0.1)',
    border: '1px solid rgba(108,99,255,0.25)', borderRadius: 10,
    padding: '0.55rem 1.25rem', color: '#6C63FF', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600,
  },
  loadMoreBtn: {
    background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
    color: '#6C63FF', borderRadius: 12, padding: '0.75rem 2rem',
    cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600,
    transition: 'all .2s',
  },
}
