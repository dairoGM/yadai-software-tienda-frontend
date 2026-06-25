import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useConfig } from '../context/ConfigContext'
import { api } from '../api'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8027'

export default function CarritoPage() {
  const { items, remove, changeQty, clear, total } = useCart()
  const { whatsapp: WA } = useConfig()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [notas, setNotas] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [nombreError, setNombreError] = useState('')

  async function handlePedido() {
    if (items.length === 0) return
    if (!nombre.trim()) { setNombreError('Por favor ingresa tu nombre para continuar.'); return }
    setNombreError('')

    const itemsText = items.map(i => `• ${i.nombre} x${i.qty} ($${parseFloat(i.precioVenta).toFixed(2)} c/u)`).join('\n')
    const totalText = `$${parseFloat(total).toFixed(2)}`
    const msg = `Hola! Quisiera hacer un pedido:\n\n${itemsText}\n\nTotal: ${totalText}\nNombre: ${nombre}${correo ? `\nCorreo: ${correo}` : ''}${notas ? `\nNotas: ${notas}` : ''}`

    setEnviando(true)
    try {
      await api.crearPedido({
        items: items.map(i => ({
          productoEnVentaId: i.id,
          cantidad: i.qty,
          precioUnitario: i.precioVenta.toString()
        })),
        clienteNombre: nombre,
        clienteEmail: correo || null,
        nota: notas,
      })
    } catch { /* si falla el API igual abrimos WhatsApp */ }

    clear()
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank')
    navigate('/')
    setEnviando(false)
  }

  if (items.length === 0) return (
    <div style={s.empty}>
      <div style={s.emptyIcon}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, color: '#E8E8F0', marginTop: '1.5rem', letterSpacing: '-0.02em' }}>Tu carrito está vacío</h2>
      <p style={{ color: '#8888A8', fontSize: '0.9rem', marginTop: '0.5rem' }}>Agrega productos desde el catálogo.</p>
      <Link to="/" style={s.goShop}>Ir al catálogo</Link>
    </div>
  )

  const totalUnidades = items.reduce((a, i) => a + i.qty, 0)

  return (
    <div style={s.page}>
      <h1 style={s.title}>Tu carrito</h1>

      <div style={s.layout}>
        {/* Items */}
        <div style={s.items}>
          {items.map(item => (
            <div key={item.id} style={s.item}>
              <div style={s.itemImg}>
                {item.imagenPrincipal
                  ? <img src={`${API}/uploads/productos/${item.imagenPrincipal}`} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8888A8" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.4 }}>
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                }
              </div>
              <div style={s.itemInfo}>
                <Link to={`/producto/${item.id}`} style={s.itemName}>{item.nombre}</Link>
                <div style={{ fontSize: '0.78rem', color: '#8888A8', marginTop: '0.15rem' }}>
                  ${parseFloat(item.precioVenta).toFixed(2)} / unidad
                </div>
                <div style={s.qtyRow}>
                  <button onClick={() => changeQty(item.id, item.qty - 1)} style={s.qtyBtn} disabled={item.qty <= 1}>−</button>
                  <span style={s.qtyNum}>{item.qty}</span>
                  <button onClick={() => changeQty(item.id, item.qty + 1)} style={s.qtyBtn} disabled={item.qty >= (item.cantidadVenta || 99)}>+</button>
                  <button onClick={() => remove(item.id)} style={s.removeBtn}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div style={s.itemTotal}>${(parseFloat(item.precioVenta) * item.qty).toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div style={s.summary}>
          <h2 style={s.summaryTitle}>Resumen del pedido</h2>

          <div style={s.summaryRow}>
            <span style={{ color: '#8888A8', fontSize: '0.875rem' }}>
              Subtotal ({totalUnidades} producto{totalUnidades !== 1 ? 's' : ''})
            </span>
            <span style={{ fontWeight: 700, color: '#E8E8F0' }}>${parseFloat(total).toFixed(2)}</span>
          </div>

          <div style={s.divider} />

          <div style={{ ...s.summaryRow, marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 800, color: '#E8E8F0', fontFamily: "'Space Grotesk',sans-serif", fontSize: '1rem' }}>Total</span>
            <span style={{
              fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.35rem',
              background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              fontVariantNumeric: 'tabular-nums',
            }}>${parseFloat(total).toFixed(2)}</span>
          </div>

          <div style={s.divider} />

          {/* Datos cliente */}
          <div style={s.formSection}>
            <label style={s.formLabel}>
              Tu nombre <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              value={nombre} onChange={e => { setNombre(e.target.value); setNombreError('') }}
              placeholder="¿Cómo te llamamos?"
              style={{ ...s.input, ...(nombreError ? { borderColor: 'rgba(239,68,68,0.5)' } : {}) }}
            />
            {nombreError && <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>{nombreError}</span>}
          </div>

          <div style={s.formSection}>
            <label style={s.formLabel}>
              Correo electrónico <span style={{ fontWeight: 400, color: '#8888A8' }}>(opcional)</span>
            </label>
            <input
              type="email"
              value={correo} onChange={e => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              style={s.input}
            />
          </div>

          <div style={s.formSection}>
            <label style={s.formLabel}>
              Notas <span style={{ fontWeight: 400, color: '#8888A8' }}>(opcional)</span>
            </label>
            <textarea
              value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Dirección, horario, alguna aclaración…"
              rows={3} style={{ ...s.input, resize: 'vertical' }}
            />
          </div>

          <button
            onClick={handlePedido}
            disabled={enviando}
            style={{ ...s.waBtn, opacity: enviando ? 0.6 : 1, cursor: enviando ? 'default' : 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
            </svg>
            {enviando ? 'Procesando…' : 'Pedir por WhatsApp'}
          </button>

          <p style={s.waNote}>
            Abriremos WhatsApp con tu pedido listo. Coordinaremos entrega y pago por ahí.
          </p>

          <button onClick={clear} style={s.clearBtn}>Vaciar carrito</button>
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
  title: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 900, fontSize: 'clamp(1.6rem,3vw,2.2rem)',
    color: '#E8E8F0', letterSpacing: '-0.03em', marginBottom: '2rem',
  },
  layout: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: '2rem', alignItems: 'start' },

  items: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  item: {
    display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '1rem',
    background: '#12121A',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, padding: '1.1rem', alignItems: 'start',
  },
  itemImg: {
    width: 80, height: 80, borderRadius: 10, overflow: 'hidden',
    background: '#1A1A26',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  itemInfo: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  itemName: {
    textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
    color: '#E8E8F0', lineHeight: 1.35,
  },
  itemTotal: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 800, fontSize: '1rem',
    background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
  },
  qtyRow: { display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 7,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    cursor: 'pointer', fontSize: '1rem', color: '#E8E8F0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  qtyNum: { fontWeight: 700, fontSize: '0.9rem', minWidth: 22, textAlign: 'center', color: '#E8E8F0' },
  removeBtn: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
    borderRadius: 7, color: '#EF4444', cursor: 'pointer',
    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginLeft: '0.25rem',
  },

  summary: {
    background: '#12121A',
    border: '1px solid rgba(108,99,255,0.2)',
    borderRadius: 18, padding: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '1rem',
    position: 'sticky', top: '80px',
  },
  summaryTitle: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 700, fontSize: '1rem', color: '#E8E8F0',
  },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  divider: { borderTop: '1px solid rgba(255,255,255,0.06)' },

  formSection: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  formLabel: { fontSize: '0.72rem', fontWeight: 700, color: '#8888A8', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '0.7rem 0.875rem',
    fontSize: '0.875rem', fontFamily: 'inherit',
    outline: 'none', color: '#E8E8F0',
    width: '100%', boxSizing: 'border-box',
    transition: 'border-color .2s',
  },

  waBtn: {
    background: 'linear-gradient(135deg,#25D366,#1da851)',
    color: '#fff', border: 'none', borderRadius: 12, padding: '0.95rem',
    width: '100%', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem',
    boxShadow: '0 6px 20px rgba(37,211,102,0.3)',
    transition: 'opacity .15s',
  },
  waNote: { fontSize: '0.72rem', color: '#8888A8', textAlign: 'center', lineHeight: 1.55 },
  clearBtn: {
    background: 'rgba(239,68,68,0.06)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#EF4444', borderRadius: 8, padding: '0.5rem',
    width: '100%', cursor: 'pointer', fontFamily: 'inherit',
    fontSize: '0.75rem', fontWeight: 600,
  },

  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '70vh', padding: '2rem',
    fontFamily: "'Inter',system-ui,sans-serif", textAlign: 'center',
    paddingTop: 'calc(64px + 2rem)',
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 20,
    background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 12px 32px rgba(108,99,255,0.35)',
  },
  goShop: {
    marginTop: '1.75rem',
    background: 'linear-gradient(135deg,#6C63FF,#5A52E0)',
    color: '#fff', textDecoration: 'none', borderRadius: 12,
    padding: '0.75rem 1.75rem', fontWeight: 700, fontSize: '0.9rem',
    boxShadow: '0 6px 20px rgba(108,99,255,0.4)',
  },
}
