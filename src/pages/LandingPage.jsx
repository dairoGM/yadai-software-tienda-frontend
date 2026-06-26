import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { api } from '../api'
import { useConfig } from '../context/ConfigContext'
import ProductSlider from '../components/ProductSlider'
import Stars from '../components/Stars'
import LoadingOverlay from '../components/LoadingOverlay'

const BENEFICIOS = [
  { icon: '✦', title: 'Calidad Garantizada', desc: 'Todos nuestros productos pasan por control de calidad antes de llegar a tus manos.', color: '#6C63FF' },
  { icon: '💎', title: 'Mejores Precios', desc: 'Precios competitivos sin sacrificar calidad. Encuentra lo que necesitas sin pagar de más.', color: '#00D4AA' },
  { icon: '⚡', title: 'Envío Rápido', desc: 'Coordinamos la entrega por WhatsApp para que recibas tu pedido lo antes posible.', color: '#F59E0B' },
  { icon: '🔒', title: 'Compra Segura', desc: 'Tu información está protegida. Realizamos la gestión directo por WhatsApp, sin datos sensibles en línea.', color: '#EF4444' },
  { icon: '💬', title: 'Soporte 24/7', desc: 'Estamos disponibles para resolver tus dudas por WhatsApp en cualquier momento.', color: '#8B5CF6' },
  { icon: '⭐', title: 'Clientes Felices', desc: 'Miles de clientes satisfechos respaldan la calidad de nuestros productos y servicio.', color: '#EC4899' },
]

const OPCIONES_WA = [
  { icon: '📦', label: 'Consulta de productos', msg: '¡Hola! Quisiera obtener más información sobre sus productos.' },
  { icon: '🚚', label: 'Información de envíos', msg: '¡Hola! Quisiera saber más sobre las opciones de envío y entrega.' },
  { icon: '🔄', label: 'Devoluciones', msg: '¡Hola! Necesito información sobre el proceso de devolución.' },
  { icon: '💬', label: 'Consulta general', msg: '¡Hola! Tengo una consulta general y me gustaría recibir asistencia.' },
]

const PAGE_SIZE_PROD = 12
const PAGE_SIZE_RES = 10

export default function LandingPage() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [totalProductos, setTotalProductos] = useState(0)
  const [pageProd, setPageProd] = useState(1)
  const [loadingProd, setLoadingProd] = useState(true)
  const [loadingMoreProd, setLoadingMoreProd] = useState(false)
  const [errorProd, setErrorProd] = useState(null)

  const [resenas, setResenas] = useState([])
  const [totalRes, setTotalRes] = useState(0)
  const [pageRes, setPageRes] = useState(1)
  const [loadingMoreRes, setLoadingMoreRes] = useState(false)

  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('nombre')
  const [searchParams, setSearchParams] = useSearchParams()
  const categoriaFiltro = searchParams.get('categoria') ? parseInt(searchParams.get('categoria')) : null
  const productosRef = useRef(null)
  const loc = useLocation()
  const initialFetchDone = useRef(false)

  const { whatsapp: WA, horario, envios } = useConfig()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.getCategorias(),
      api.getProductos({ page: 1, limit: PAGE_SIZE_PROD, categoria: categoriaFiltro, q: '', sort: 'nombre' }),
      api.getResenas({ page: 1, limit: PAGE_SIZE_RES }),
    ])
      .then(([cats, prods, res]) => {
        setCategorias(cats)
        setProductos(prods.data)
        setTotalProductos(prods.total)
        setPageProd(1)
        setResenas(res.data)
        setTotalRes(res.total)
        setPageRes(1)
        initialFetchDone.current = true
      })
      .catch(() => setErrorProd('No se pudo cargar el catálogo. Verifica tu conexión.'))
      .finally(() => { setLoading(false); setLoadingProd(false); window.hideSplash?.() })
  }, []) // eslint-disable-line

  const fetchFiltrado = useCallback((pg = 1, append = false) => {
    if (pg === 1) setLoadingProd(true)
    else setLoadingMoreProd(true)
    setErrorProd(null)
    api.getProductos({ page: pg, limit: PAGE_SIZE_PROD, categoria: categoriaFiltro, q: q.trim(), sort })
      .then(res => {
        setProductos(append ? prev => [...prev, ...res.data] : res.data)
        setTotalProductos(res.total)
        setPageProd(pg)
      })
      .catch(() => setErrorProd('No se pudo cargar el catálogo. Verifica tu conexión.'))
      .finally(() => { setLoadingProd(false); setLoadingMoreProd(false) })
  }, [categoriaFiltro, q, sort])

  useEffect(() => {
    if (!initialFetchDone.current) return
    fetchFiltrado(1, false)
  }, [categoriaFiltro, q, sort]) // eslint-disable-line

  useEffect(() => {
    if (!loadingProd && categoriaFiltro && productosRef.current) {
      const t = setTimeout(() => {
        productosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
      return () => clearTimeout(t)
    }
  }, [loadingProd, categoriaFiltro])

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

  const loadMoreRes = () => {
    const next = pageRes + 1
    setLoadingMoreRes(true)
    api.getResenas({ page: next, limit: PAGE_SIZE_RES })
      .then(res => { setResenas(prev => [...prev, ...res.data]); setPageRes(next) })
      .catch(() => {})
      .finally(() => setLoadingMoreRes(false))
  }

  const abrirWA = (msg) => window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank')

  const categoriaActual = categorias.find(c => c.id === categoriaFiltro)
  const totalPagesProd = Math.ceil(totalProductos / PAGE_SIZE_PROD)
  const hasMoreProd = pageProd < totalPagesProd
  const hasMoreRes = resenas.length < totalRes

  const promedio = resenas.length > 0
    ? (resenas.reduce((s, r) => s + r.puntuacion, 0) / resenas.length).toFixed(1)
    : null

  if (loading && productos.length === 0 && categorias.length === 0) return <LoadingOverlay />

  return (
    <div style={s.page}>

      {/* ── HERO ── */}
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

      {/* ── CATEGORÍAS ── */}
      {!q.trim() && (
        <section id="categorias" style={s.sectionAlt}>
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
      )}

      {/* ── BENEFICIOS ── */}
      {!q.trim() && (
        <section id="beneficios" style={s.sectionBase}>
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
      )}

      {/* ── PRODUCTOS ── */}
      <section id="productos" ref={productosRef} style={{ ...s.sectionAlt, ...(q.trim() ? s.searchingResults : {}) }}>
        <div style={s.sectionInner}>
          {q.trim() && (
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h2 style={s.sectionTitle}>Resultados para "{q}"</h2>
              {!loadingProd && <p style={s.sectionSub}>{totalProductos} producto{totalProductos !== 1 ? 's' : ''} encontrado{totalProductos !== 1 ? 's' : ''}</p>}
            </div>
          )}

          {!q.trim() && (
            <div style={s.sectionHeader}>
              <span style={s.sectionEyebrow}>Nuestro catálogo</span>
              <h2 style={s.sectionTitle}>Todos los Productos</h2>
              <p style={s.sectionSub}>Descubre nuestra colección completa de productos</p>
            </div>
          )}

          {!q.trim() && categoriaActual && (
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={s.filterChip}>
                {categoriaActual.nombre}
                <button onClick={() => setSearchParams({})} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6C63FF', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}>×</button>
              </span>
            </div>
          )}

          {loadingProd && productos.length === 0 && (
            <div style={s.grid}>
              {Array.from({ length: PAGE_SIZE_PROD }).map((_, i) => <Skeleton key={i} />)}
            </div>
          )}

          {errorProd && (
            <div style={s.stateBox}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ color: 'var(--text-2)', marginTop: '0.75rem' }}>{errorProd}</p>
            </div>
          )}

          {!loadingProd && !errorProd && productos.length === 0 && (
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

          {productos.length > 0 && (
            <>
              <ProductSlider productos={productos} />

              {loadingMoreProd && (
                <div style={{ ...s.grid, marginTop: '1.25rem' }}>
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}
                </div>
              )}

              {!loadingMoreProd && hasMoreProd && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button onClick={() => fetchFiltrado(pageProd + 1, true)} style={s.loadMoreBtn}>
                    Ver más productos ({totalProductos - productos.length} restantes)
                  </button>
                </div>
              )}

              {!loadingMoreProd && !hasMoreProd && totalProductos > PAGE_SIZE_PROD && (
                <p style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: '0.8rem', marginTop: '2rem', opacity: 0.6 }}>
                  Mostrando todos los {totalProductos} productos
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section id="testimonios" style={{ ...s.sectionBase, background: 'var(--bg-2)', position: 'relative' }}>
        <div style={s.testiGradient} />
        <div style={s.sectionInner}>
          <div style={s.sectionHeader}>
            <span style={{ ...s.sectionEyebrow, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA' }}>Opiniones reales</span>
            <h2 style={s.sectionTitle}>Testimonios de Clientes</h2>
            <p style={s.sectionSub}>Lo que nuestros clientes dicen sobre los productos que han adquirido</p>
          </div>

          {promedio && (
            <div style={s.statsRow}>
              <div style={s.stat}>
                <span style={s.statNum}>{promedio}</span>
                <Stars value={parseFloat(promedio)} size={20} />
              </div>
              <div style={s.statDivider} />
              <div style={s.stat}>
                <span style={s.statNum}>{totalRes}</span>
                <span style={s.statLabel}>reseñas totales</span>
              </div>
              <div style={s.statDivider} />
              <div style={s.stat}>
                <span style={s.statNum}>{resenas.filter(r => r.compro).length}</span>
                <span style={s.statLabel}>compradores verificados</span>
              </div>
            </div>
          )}

          {resenas.length === 0 ? (
            <div style={s.stateBox}>
              <p style={{ color: 'var(--text-2)' }}>Todavía no hay reseñas.</p>
            </div>
          ) : (
            <>
              <div style={s.resenaGrid}>
                {resenas.map((r, i) => (
                  <div key={i} style={s.resenaCard}>
                    <div style={s.cardTop}>
                      <div style={s.avatar}>{r.nombreUsuario?.[0]?.toUpperCase() || '?'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={s.resenaName}>
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
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>{r.fechaFormateada}</span>
                        </div>
                      </div>
                    </div>
                    {r.comentario && <p style={s.resenaComment}>&ldquo;{r.comentario}&rdquo;</p>}
                    <div style={s.resenaProduct}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                      {r.productoNombre}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                {hasMoreRes ? (
                  <button onClick={loadMoreRes} disabled={loadingMoreRes} style={s.loadMoreBtn}>
                    {loadingMoreRes ? 'Cargando…' : `Ver más reseñas (${totalRes - resenas.length} restantes)`}
                  </button>
                ) : (
                  totalRes > PAGE_SIZE_RES && (
                    <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', opacity: 0.7 }}>
                      Mostrando todas las {totalRes} reseñas
                    </p>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" style={s.sectionBase}>
        <div style={s.contactoHero}>
          <div style={s.contactoOrb1} />
          <div style={s.contactoOrb2} />
          <div style={s.contactoHeroInner}>
            <span style={s.contactoBadge}>
              <span style={s.contactoDot} />
              Disponible ahora
            </span>
            <h2 style={s.contactoTitle}>
              Hablemos por<br />
              <span style={s.contactoGrad}>WhatsApp</span>
            </h2>
            <p style={s.contactoSub}>
              Atención directa, sin formularios ni esperas. Respuesta en minutos.
            </p>
            <button
              onClick={() => abrirWA('¡Hola! Me gustaría obtener más información.')}
              style={s.contactoBtn}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Iniciar conversación
            </button>
          </div>
        </div>

        <div style={s.sectionInner}>
          <div style={s.infoRow}>
            <InfoCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>}
              iconBg="linear-gradient(135deg,#25D366,#1da851)"
              iconGlow="rgba(37,211,102,0.35)"
              label="WhatsApp"
              value={WA ? `+${WA}` : '—'}
              action={() => abrirWA('¡Hola!')}
              actionLabel="Abrir chat"
            />
            <InfoCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>}
              iconBg="linear-gradient(135deg,#6C63FF,#8B85FF)"
              iconGlow="rgba(108,99,255,0.35)"
              label="Horario de atención"
              value={horario || 'Lunes a Sábado'}
            />
            <InfoCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
              iconBg="linear-gradient(135deg,#00D4AA,#00B894)"
              iconGlow="rgba(0,212,170,0.35)"
              label="Cobertura de envíos"
              value={envios || 'Envíos a domicilio'}
            />
            <InfoCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
              iconBg="linear-gradient(135deg,#F59E0B,#D97706)"
              iconGlow="rgba(245,158,11,0.35)"
              label="Tiempo de respuesta"
              value="Menos de 1 hora"
            />
          </div>

          <div style={s.topicsSection}>
            <div style={s.sectionHeader}>
              <h3 style={{ ...s.sectionTitle, fontSize: 'clamp(1.2rem,2.5vw,1.75rem)' }}>¿En qué podemos ayudarte?</h3>
              <p style={s.sectionSub}>Selecciona un tema para iniciar la conversación directamente</p>
            </div>
            <div style={s.topicsGrid}>
              {OPCIONES_WA.map(item => (
                <TopicCard key={item.label} item={item} onClick={() => abrirWA(item.msg)} />
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

// ── BentoGrid ────────────────────────────────────────────────────────────────
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

// ── BeneficioCard ─────────────────────────────────────────────────────────────
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

// ── Skeleton ──────────────────────────────────────────────────────────────────
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

// ── InfoCard ──────────────────────────────────────────────────────────────────
function InfoCard({ icon, iconBg, iconGlow, label, value, action, actionLabel }) {
  return (
    <div style={s.infoCard}>
      <div style={{ ...s.infoIconWrap, background: iconBg, boxShadow: `0 8px 24px ${iconGlow}` }}>
        <span style={{ color: '#fff' }}>{icon}</span>
      </div>
      <div style={s.infoCardBody}>
        <div style={s.infoLabel}>{label}</div>
        <div style={s.infoValue}>{value}</div>
      </div>
      {action && (
        <button onClick={action} style={s.infoAction}>
          {actionLabel}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
    </div>
  )
}

// ── TopicCard ─────────────────────────────────────────────────────────────────
function TopicCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...s.topicCard,
        borderColor: hovered ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.07)',
        background: hovered ? 'rgba(108,99,255,0.05)' : 'var(--card-bg)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.1)',
      }}>
      <span style={s.topicIcon}>{item.icon}</span>
      <div style={s.topicBody}>
        <div style={s.topicLabel}>{item.label}</div>
        <div style={s.topicHint}>Toca para abrir WhatsApp</div>
      </div>
      <div style={{ ...s.topicArrow, opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(-6px)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </button>
  )
}

const s = {
  page: { fontFamily: "'Inter',system-ui,sans-serif", minHeight: '100vh' },

  hero: {
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%)',
    borderBottom: '1px solid rgba(108,99,255,0.1)',
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

  sectionBase: {
    borderTop: '1px solid rgba(108,99,255,0.1)',
    padding: 'clamp(3rem,6vw,5rem) 0',
  },
  sectionAlt: {
    borderTop: '1px solid rgba(108,99,255,0.1)',
    background: 'var(--bg-2)',
    padding: 'clamp(3rem,6vw,5rem) 0',
  },
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
  benfGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' },

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
  searchingResults: { paddingTop: '0.5rem', marginTop: '-1rem' },

  testiGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '300px',
    background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  statsRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem',
    background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, padding: '1.1rem 2rem', flexWrap: 'wrap',
    marginBottom: '2.5rem',
  },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' },
  statNum: {
    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 900, fontSize: '1.6rem',
    color: 'var(--text)', background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    lineHeight: 1,
  },
  statLabel: { fontSize: '0.72rem', color: 'var(--text-2)', fontWeight: 500 },
  statDivider: { width: 1, height: 40, background: 'rgba(255,255,255,0.06)' },
  resenaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' },
  resenaCard: {
    background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.06)',
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
  resenaName: {
    fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)',
    display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
  },
  verified: {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)',
    color: '#00D4AA', borderRadius: 20, padding: '0.15rem 0.5rem',
    fontSize: '0.65rem', fontWeight: 700,
  },
  resenaComment: { color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.7, fontStyle: 'italic', margin: 0 },
  resenaProduct: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    color: 'var(--text-2)', fontSize: '0.75rem',
    borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.75rem',
  },

  contactoHero: {
    position: 'relative', overflow: 'hidden',
    borderBottom: '1px solid rgba(108,99,255,0.1)',
    paddingBottom: 0,
  },
  contactoOrb1: {
    position: 'absolute', top: '-100px', left: '5%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,211,102,0.08) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  contactoOrb2: {
    position: 'absolute', bottom: '-80px', right: '5%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  contactoHeroInner: {
    maxWidth: 700, margin: '0 auto',
    padding: 'clamp(3rem,6vw,5rem) clamp(1rem,3vw,2rem) clamp(2.5rem,5vw,4rem)',
    textAlign: 'center', position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem',
  },
  contactoBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)',
    color: '#25D366', borderRadius: 100, padding: '0.35rem 1rem',
    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
  },
  contactoDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#25D366', boxShadow: '0 0 8px #25D366',
    animation: 'pulse 2s ease-in-out infinite',
  },
  contactoTitle: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 900, fontSize: 'clamp(2rem,5vw,3.5rem)',
    lineHeight: 1.05, letterSpacing: '-0.04em',
    color: 'var(--text)', margin: 0,
  },
  contactoGrad: {
    background: 'linear-gradient(135deg,#25D366,#00D4AA)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  contactoSub: {
    color: 'var(--text-2)', fontSize: 'clamp(0.9rem,2vw,1.05rem)',
    lineHeight: 1.7, maxWidth: 440, margin: 0,
  },
  contactoBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.65rem',
    background: 'linear-gradient(135deg,#25D366,#1da851)',
    color: '#fff', border: 'none', borderRadius: 16,
    padding: '1rem 2.25rem', fontSize: '1rem', fontWeight: 700,
    fontFamily: 'inherit', cursor: 'pointer',
    boxShadow: '0 12px 32px rgba(37,211,102,0.4)',
    transition: 'transform .2s cubic-bezier(.4,0,.2,1), box-shadow .2s',
  },

  infoRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
    gap: '1rem',
    marginBottom: '3rem',
    paddingTop: 'clamp(2rem,4vw,3rem)',
  },
  infoCard: {
    background: 'var(--card-bg)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 18, padding: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  infoIconWrap: {
    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  infoCardBody: { flex: 1 },
  infoLabel: {
    fontSize: '0.72rem', color: 'var(--text-2)', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem',
  },
  infoValue: { fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 },
  infoAction: {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)',
    color: '#25D366', borderRadius: 8, padding: '0.4rem 0.9rem',
    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', alignSelf: 'flex-start', transition: 'background .15s',
  },

  topicsSection: { paddingBottom: 'clamp(2rem,4vw,3rem)' },
  topicsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
    gap: '1rem',
  },
  topicCard: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    border: '1px solid', borderRadius: 16, padding: '1.25rem 1.5rem',
    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
    transition: 'all .25s cubic-bezier(.4,0,.2,1)',
  },
  topicIcon: { fontSize: '1.75rem', flexShrink: 0 },
  topicBody: { flex: 1 },
  topicLabel: { fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.2rem' },
  topicHint: { fontSize: '0.75rem', color: 'var(--text-2)' },
  topicArrow: { color: '#6C63FF', flexShrink: 0, transition: 'all .25s' },
}
