import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Stars from './Stars'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8027'

export default function ProductCard({ p }) {
  const { add, items } = useCart()
  const [flash, setFlash] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  const inCart = items.some(i => i.id === p.id)
  const agotado = p.cantidadVenta <= 0

  // Construir lista de imágenes — usar p.imagenes si existe, sino imagenPrincipal
  const imagenes = (p.imagenes && p.imagenes.length > 0)
    ? p.imagenes
    : (p.imagenPrincipal ? [p.imagenPrincipal] : [])

  const hasMultiple = imagenes.length > 1
  const currentImg = imagenes[imgIdx]
    ? `${API}/uploads/productos/${imagenes[imgIdx]}`
    : null

  function handleAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    add(p)
    setFlash(true)
    setTimeout(() => setFlash(false), 1400)
  }

  function prevImg(e) {
    e.preventDefault()
    e.stopPropagation()
    setImgIdx(i => (i - 1 + imagenes.length) % imagenes.length)
  }

  function nextImg(e) {
    e.preventDefault()
    e.stopPropagation()
    setImgIdx(i => (i + 1) % imagenes.length)
  }

  function goToImg(e, idx) {
    e.preventDefault()
    e.stopPropagation()
    setImgIdx(idx)
  }

  return (
    <>
      <Link
        to={`/producto/${p.id}`}
        style={{
          ...s.card,
          transform: hovered ? 'translateY(-6px)' : 'none',
          boxShadow: hovered ? '0 20px 50px rgba(108,99,255,0.18)' : '0 2px 8px rgba(0,0,0,0.3)',
          borderColor: hovered ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.06)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Imagen / Slider */}
        <div style={s.imgWrap}>
          {currentImg
            ? <img
                src={currentImg}
                alt={p.nombre}
                style={{ ...s.img, transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
              />
            : <div style={s.imgPlaceholder}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8888A8" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
          }

          {/* Flechas — solo si hay más de una imagen */}
          {hasMultiple && (
            <>
              <button onClick={prevImg} style={s.arrow} aria-label="Anterior">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button onClick={nextImg} style={{ ...s.arrow, left: 'auto', right: '0.4rem' }} aria-label="Siguiente">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </>
          )}

          {/* Dots */}
          {hasMultiple && (
            <div style={s.dots}>
              {imagenes.map((_, i) => (
                <button
                  key={i}
                  onClick={e => goToImg(e, i)}
                  aria-label={`Imagen ${i + 1}`}
                  style={{
                    ...s.dot,
                    width: i === imgIdx ? 16 : 6,
                    background: i === imgIdx ? '#6C63FF' : 'rgba(255,255,255,0.5)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          {agotado && <div style={s.outBadge}>Agotado</div>}
          {!agotado && inCart && <div style={s.inCartBadge}>En carrito</div>}

          {/* Contador de imágenes */}
          {hasMultiple && (
            <div style={s.counter}>{imgIdx + 1}/{imagenes.length}</div>
          )}
        </div>

        {/* Info */}
        <div style={s.body}>
          {p.totalResenas > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
              <Stars value={p.promedioResenas} size={12} />
              <span style={{ fontSize: '0.68rem', color: '#8888A8' }}>({p.totalResenas})</span>
            </div>
          )}

          <h3 style={s.name}>{p.nombre}</h3>

          {p.descripcion && <p style={s.desc}>{p.descripcion}</p>}

          <div style={s.footer}>
            <span style={s.price}>${parseFloat(p.precioVenta).toFixed(2)}</span>
            <button
              onClick={handleAdd}
              disabled={inCart || agotado}
              style={{
                ...s.addBtn,
                background: agotado
                  ? 'rgba(255,255,255,0.04)'
                  : inCart
                    ? 'rgba(108,99,255,0.15)'
                    : 'linear-gradient(135deg,#6C63FF,#5A52E0)',
                color: agotado ? '#8888A8' : inCart ? '#6C63FF' : '#fff',
                border: inCart ? '1px solid rgba(108,99,255,0.3)' : 'none',
                cursor: (inCart || agotado) ? 'default' : 'pointer',
                boxShadow: (!inCart && !agotado) ? '0 4px 14px rgba(108,99,255,0.4)' : 'none',
              }}
            >
              {inCart ? '✓' : flash ? '✓' : agotado ? '—' : '+'}
            </button>
          </div>
        </div>
      </Link>

    </>
  )
}

const s = {
  card: {
    textDecoration: 'none', display: 'flex', flexDirection: 'column',
    background: '#12121A',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, overflow: 'hidden',
    transition: 'transform .25s, box-shadow .25s, border-color .25s',
    fontFamily: "'Inter',system-ui,sans-serif",
  },
  imgWrap: {
    aspectRatio: '4/3', background: '#1A1A26',
    position: 'relative', overflow: 'hidden', flexShrink: 0,
  },
  img: {
    width: '100%', height: '100%', objectFit: 'cover',
    display: 'block', transition: 'transform .35s',
  },
  imgPlaceholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4,
  },

  /* Flechas del slider */
  arrow: {
    position: 'absolute', left: '0.4rem', top: '50%', transform: 'translateY(-50%)',
    background: 'rgba(10,10,15,0.65)', backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 7, width: 26, height: 26,
    cursor: 'pointer', color: '#E8E8F0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2, padding: 0,
    transition: 'background .15s',
  },

  /* Dots de paginación */
  dots: {
    position: 'absolute', bottom: '0.5rem', left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    zIndex: 2,
  },
  dot: {
    height: 6, borderRadius: 3,
    border: 'none', padding: 0, cursor: 'pointer',
    transition: 'width .2s, background .2s',
  },

  /* Contador top-right */
  counter: {
    position: 'absolute', top: '0.45rem', right: '0.45rem',
    background: 'rgba(10,10,15,0.65)', backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6, padding: '0.15rem 0.45rem',
    fontSize: '0.6rem', fontWeight: 700, color: '#E8E8F0',
    zIndex: 2,
  },

  outBadge: {
    position: 'absolute', top: '0.6rem', left: '0.6rem',
    background: 'rgba(239,68,68,0.9)', backdropFilter: 'blur(4px)',
    color: '#fff', fontSize: '0.62rem', fontWeight: 700,
    padding: '0.2rem 0.55rem', borderRadius: 6, zIndex: 2,
  },
  inCartBadge: {
    position: 'absolute', top: '0.6rem', left: '0.6rem',
    background: 'rgba(108,99,255,0.85)', backdropFilter: 'blur(4px)',
    color: '#fff', fontSize: '0.62rem', fontWeight: 700,
    padding: '0.2rem 0.55rem', borderRadius: 6, zIndex: 2,
  },

  body: { padding: '0.9rem', display: 'flex', flexDirection: 'column', flex: 1 },
  name: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 600, fontSize: '0.92rem', color: '#E8E8F0',
    lineHeight: 1.3,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
    marginBottom: '0.3rem',
  },
  desc: {
    fontSize: '0.75rem', color: '#8888A8', lineHeight: 1.5,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  footer: {
    marginTop: 'auto', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.75rem',
  },
  price: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 700, fontSize: '1.1rem',
    background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
  },
  addBtn: {
    width: 34, height: 34, borderRadius: 10,
    fontSize: '1rem', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'opacity .15s',
    fontFamily: 'inherit',
  },
}
