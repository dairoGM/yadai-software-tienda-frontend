import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import { useCart } from '../context/CartContext'
import Stars from '../components/Stars'
import LoadingOverlay from '../components/LoadingOverlay'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8027'

export default function ProductoPage() {
  const { id } = useParams()
  const { add, items } = useCart()
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [resena, setResena] = useState({ puntuacion: 5, comentario: '', userName: '', compro: false })
  const [enviando, setEnviando] = useState(false)
  const [resenaOk, setResenaOk] = useState(false)
  const [resenaError, setResenaError] = useState('')

  useEffect(() => {
    setLoading(true); setImgIdx(0)
    api.getProducto(id).then(setProducto).catch(() => setProducto(null)).finally(() => { setLoading(false); window.hideSplash?.() })
  }, [id])

  const inCart = items.some(i => i.id === parseInt(id))

  function handleAdd() { add(producto) }

  async function submitResena(e) {
    e.preventDefault()
    setResenaError('')
    if (!resena.userName.trim()) { setResenaError('Por favor ingresa tu nombre.'); return }
    setEnviando(true)
    try {
      await api.crearResena(id, {
        puntuacion: resena.puntuacion,
        comentario: resena.comentario,
        userName:   resena.userName.trim(),
        compro:     resena.compro,
      })
      setResenaOk(true)
      setResena({ puntuacion: 5, comentario: '', userName: '', compro: false })
      const data = await api.getProducto(id)
      setProducto(data)
    } catch (err) { setResenaError(err.message || 'No se pudo enviar la reseña.') }
    finally { setEnviando(false) }
  }


  if (loading) return <LoadingOverlay text="Cargando producto..." />

  if (!producto) return (
    <div style={{ textAlign: 'center', padding: '6rem 1rem', paddingTop: 'calc(64px + 4rem)', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <p style={{ color: '#8888A8', marginBottom: '1rem' }}>Producto no encontrado.</p>
      <Link to="/" style={{ color: '#6C63FF', fontWeight: 600, fontSize: '0.875rem' }}>← Volver al catálogo</Link>
    </div>
  )

  const imagenes = producto.imagenes || []

  return (
    <div style={s.page}>
      {/* Breadcrumb */}
      <div style={s.breadcrumb}>
        <Link to="/" style={s.bcLink}>Catálogo</Link>
        <span style={{ color: '#22223A' }}>/</span>
        <span style={{ color: '#8888A8', fontSize: '0.82rem' }}>{producto.nombre}</span>
      </div>

      {/* Principal */}
      <div style={s.main}>
        {/* Galería */}
        <div style={s.gallery}>
          <div style={s.mainImg}>
            {imagenes[imgIdx]
              ? <img src={`${API}/uploads/productos/${imagenes[imgIdx].imagenName}`} alt={producto.nombre}
                     style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.15 }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E8E8F0" strokeWidth="1" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
            }
            {imagenes.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => (i - 1 + imagenes.length) % imagenes.length)} style={s.arrow}>‹</button>
                <button onClick={() => setImgIdx(i => (i + 1) % imagenes.length)} style={{ ...s.arrow, left: 'auto', right: '0.75rem' }}>›</button>
              </>
            )}
          </div>
          {imagenes.length > 1 && (
            <div style={s.thumbs}>
              {imagenes.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  style={{ ...s.thumb, borderColor: i === imgIdx ? '#6C63FF' : 'rgba(255,255,255,0.08)', boxShadow: i === imgIdx ? '0 0 0 3px rgba(108,99,255,0.3)' : 'none' }}>
                  <img src={`${API}/uploads/productos/${img.imagenName}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={s.info}>
          {producto.promedioResenas > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Stars value={producto.promedioResenas} size={15} />
              <span style={{ fontSize: '0.8rem', color: '#8888A8' }}>
                {producto.promedioResenas.toFixed(1)} · {producto.totalResenas} reseña{producto.totalResenas !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <h1 style={s.title}>{producto.nombre}</h1>

          <div style={s.price}>${parseFloat(producto.precioVenta).toFixed(2)}</div>

          {producto.descripcion && <p style={s.desc}>{producto.descripcion}</p>}

          <div style={s.stockPill}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: producto.cantidadVenta > 0 ? '#00D4AA' : '#EF4444', flexShrink: 0, boxShadow: producto.cantidadVenta > 0 ? '0 0 6px #00D4AA' : 'none' }} />
            {producto.cantidadVenta > 0 ? `${producto.cantidadVenta} en stock` : 'Sin stock'}
          </div>

          <button
            onClick={handleAdd}
            disabled={inCart || producto.cantidadVenta <= 0}
            style={{
              ...s.addBtn,
              background: inCart
                ? 'rgba(108,99,255,0.15)'
                : producto.cantidadVenta <= 0
                  ? 'rgba(255,255,255,0.04)'
                  : 'linear-gradient(135deg,#6C63FF,#5A52E0)',
              color: inCart ? '#6C63FF' : producto.cantidadVenta <= 0 ? '#8888A8' : '#fff',
              border: inCart ? '1px solid rgba(108,99,255,0.3)' : 'none',
              cursor: (inCart || producto.cantidadVenta <= 0) ? 'default' : 'pointer',
              boxShadow: (!inCart && producto.cantidadVenta > 0) ? '0 6px 20px rgba(108,99,255,0.4)' : 'none',
            }}
          >
            {inCart ? '✓ Ya está en tu carrito' : producto.cantidadVenta <= 0 ? 'Sin stock disponible' : '+ Agregar al carrito'}
          </button>

          {inCart && (
            <Link to="/carrito" style={s.goCart}>
              Ver carrito y coordinar pedido →
            </Link>
          )}
        </div>
      </div>

      {/* Reseñas */}
      <div style={s.reviews}>
        <h2 style={s.reviewsTitle}>
          Reseñas {producto.resenas?.length > 0 && <span style={{ color: '#8888A8', fontWeight: 500, fontSize: '1rem' }}>({producto.resenas.length})</span>}
        </h2>

        {producto.resenas?.length > 0 && (
          <div style={s.reviewList}>
            {producto.resenas.map((r, i) => (
              <div key={i} style={s.reviewCard}>
                <div style={s.reviewHeader}>
                  <div style={s.reviewAvatar}>{r.nombreUsuario?.[0]?.toUpperCase() || '?'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {r.nombreUsuario}
                      {r.compro && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA', borderRadius: 20, padding: '0.1rem 0.45rem', fontSize: '0.65rem', fontWeight: 700 }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Compra verificada
                        </span>
                      )}
                    </div>
                    <Stars value={r.puntuacion} size={12} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#8888A8' }}>{r.fechaFormateada}</span>
                </div>
                {r.comentario && <p style={{ fontSize: '0.85rem', color: '#8888A8', marginTop: '0.65rem', lineHeight: 1.65 }}>{r.comentario}</p>}
              </div>
            ))}
          </div>
        )}

        {producto.resenas?.length === 0 && (
          <p style={{ color: '#8888A8', fontSize: '0.875rem', marginBottom: '1.75rem' }}>Sé el primero en dejar una reseña.</p>
        )}

        <div style={s.reviewForm}>
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#E8E8F0', marginBottom: '1.25rem' }}>
            Deja tu reseña
          </h3>

          {resenaOk && (
            <div style={s.successMsg}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              ¡Gracias por tu reseña! Ya está publicada.
            </div>
          )}

          {resenaError && (
            <div style={{ ...s.successMsg, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', marginBottom: '0.75rem' }}>
              {resenaError}
            </div>
          )}

          <form onSubmit={submitResena} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={s.formLabel}>Tu nombre <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                value={resena.userName}
                onChange={e => setResena(r => ({ ...r, userName: e.target.value }))}
                placeholder="¿Cómo te llamas?"
                style={{ ...s.textarea, resize: 'none', height: 'auto', padding: '0.7rem 0.875rem' }}
              />
            </div>
            <div>
              <label style={s.formLabel}>Valoración</label>
              <Stars value={resena.puntuacion} size={28} interactive onChange={v => setResena(r => ({ ...r, puntuacion: v }))} />
            </div>
            <div>
              <label style={s.formLabel}>Tu experiencia <span style={{ color: '#8888A8', fontWeight: 400 }}>(opcional)</span></label>
              <textarea
                value={resena.comentario}
                onChange={e => setResena(r => ({ ...r, comentario: e.target.value }))}
                placeholder="¿Qué te pareció el producto?"
                rows={3} style={s.textarea}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={resena.compro}
                onChange={e => setResena(r => ({ ...r, compro: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: '#00D4AA', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.85rem', color: '#8888A8' }}>
                Compré este producto
                <span style={{ display: 'inline-block', marginLeft: '0.4rem', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA', borderRadius: 20, padding: '0.1rem 0.5rem', fontSize: '0.68rem', fontWeight: 700, verticalAlign: 'middle' }}>
                  Verificado
                </span>
              </span>
            </label>
            <button type="submit" disabled={enviando} style={s.submitBtn}>
              {enviando ? 'Enviando…' : 'Publicar reseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    maxWidth: 1100, margin: '0 auto',
    padding: 'calc(64px + clamp(1.5rem,3vw,2.5rem)) clamp(1rem,3vw,2rem) clamp(2rem,4vw,3rem)',
    fontFamily: "'Inter',system-ui,sans-serif",
  },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' },
  bcLink: { color: '#6C63FF', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 },
  main: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '3rem', marginBottom: '4rem', alignItems: 'start' },

  gallery: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  mainImg: {
    aspectRatio: '1',
    background: '#12121A',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.06)',
    overflow: 'hidden', position: 'relative',
  },
  arrow: {
    position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
    background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, width: 36, height: 36,
    fontSize: '1.3rem', cursor: 'pointer', color: '#E8E8F0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  thumbs: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap' },
  thumb: {
    width: 64, height: 64, borderRadius: 10,
    overflow: 'hidden', padding: 0, cursor: 'pointer',
    flexShrink: 0, background: '#12121A',
    border: '2px solid', transition: 'border-color .15s, box-shadow .15s',
  },

  info: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  title: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2.1rem)',
    lineHeight: 1.15, color: '#E8E8F0', letterSpacing: '-0.03em',
  },
  price: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 900, fontSize: 'clamp(2rem,4vw,2.75rem)',
    background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums',
  },
  desc: { color: '#8888A8', fontSize: '0.92rem', lineHeight: 1.75 },
  stockPill: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '0.5rem 0.85rem',
    fontSize: '0.82rem', color: '#E8E8F0', fontWeight: 500,
    width: 'fit-content',
  },
  addBtn: {
    width: '100%', padding: '1rem', borderRadius: 14,
    fontSize: '0.95rem', fontWeight: 700, fontFamily: 'inherit',
    transition: 'opacity .15s, transform .15s',
    letterSpacing: '-0.01em',
  },
  goCart: {
    textAlign: 'center', color: '#6C63FF', fontSize: '0.85rem',
    textDecoration: 'none', fontWeight: 600, display: 'block',
  },

  reviews: { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '3rem' },
  reviewsTitle: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.75rem', color: '#E8E8F0',
    letterSpacing: '-0.02em',
  },
  reviewList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' },
  reviewCard: {
    background: '#12121A',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14, padding: '1.1rem 1.25rem',
  },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
  },

  reviewForm: {
    background: '#12121A',
    border: '1px solid rgba(108,99,255,0.2)',
    borderRadius: 18, padding: '1.75rem',
  },
  formLabel: { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#8888A8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' },
  textarea: {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '0.8rem',
    fontSize: '0.875rem', fontFamily: 'inherit',
    resize: 'vertical', outline: 'none', color: '#E8E8F0', boxSizing: 'border-box',
    transition: 'border-color .2s',
  },
  submitBtn: {
    alignSelf: 'flex-start',
    background: 'linear-gradient(135deg,#6C63FF,#5A52E0)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '0.7rem 1.4rem', fontSize: '0.875rem', fontWeight: 700,
    fontFamily: 'inherit', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(108,99,255,0.4)',
  },
  loginForReview: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '0.75rem 1.25rem',
    fontSize: '0.875rem', fontWeight: 600, color: '#E8E8F0',
    fontFamily: 'inherit', cursor: 'pointer',
  },
  successMsg: {
    background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)',
    borderRadius: 10, padding: '0.75rem 1rem',
    color: '#00D4AA', fontSize: '0.85rem', marginBottom: '1rem',
    display: 'flex', alignItems: 'center', gap: '0.6rem',
  },
}
