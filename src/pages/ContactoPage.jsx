import { useConfig } from '../context/ConfigContext'

const OPCIONES = [
  { icon: '📦', label: 'Consulta de productos',  msg: '¡Hola! Quisiera obtener más información sobre sus productos.' },
  { icon: '🚚', label: 'Información de envíos',  msg: '¡Hola! Quisiera saber más sobre las opciones de envío y entrega.' },
  { icon: '🔄', label: 'Devoluciones',            msg: '¡Hola! Necesito información sobre el proceso de devolución.' },
  { icon: '💬', label: 'Consulta general',        msg: '¡Hola! Tengo una consulta general y me gustaría recibir asistencia.' },
]

export default function ContactoPage() {
  const { whatsapp: WA, horario, envios } = useConfig()

  const abrirWA = (msg) =>
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank')

  return (
    <div style={s.page}>

      {/* ── Hero ── */}
      <div style={s.hero}>
        <div style={s.heroOrb1} />
        <div style={s.heroOrb2} />
        <div style={s.heroInner}>
          <span style={s.badge}>
            <span style={s.dot} />
            Disponible ahora
          </span>
          <h1 style={s.heroTitle}>
            Hablemos por<br />
            <span style={s.heroGrad}>WhatsApp</span>
          </h1>
          <p style={s.heroSub}>
            Atención directa, sin formularios ni esperas. Respuesta en minutos.
          </p>
          <button
            onClick={() => abrirWA('¡Hola! Me gustaría obtener más información.')}
            style={s.heroBtn}
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

      {/* ── Info cards row ── */}
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

      {/* ── Topics ── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>¿En qué podemos ayudarte?</h2>
          <p style={s.sectionSub}>Selecciona un tema para iniciar la conversación directamente</p>
        </div>
        <div style={s.topicsGrid}>
          {OPCIONES.map(item => (
            <TopicCard key={item.label} item={item} onClick={() => abrirWA(item.msg)} />
          ))}
        </div>
      </div>

    </div>
  )
}

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

import { useState } from 'react'

const s = {
  page: {
    fontFamily: "'Inter',system-ui,sans-serif",
    minHeight: '100vh',
  },

  /* Hero */
  hero: {
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%)',
    borderBottom: '1px solid rgba(108,99,255,0.1)',
    paddingTop: 64,
  },
  heroOrb1: {
    position: 'absolute', top: '-100px', left: '5%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,211,102,0.1) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  heroOrb2: {
    position: 'absolute', bottom: '-80px', right: '5%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  heroInner: {
    maxWidth: 700, margin: '0 auto',
    padding: 'clamp(4rem,8vw,7rem) clamp(1rem,3vw,2rem) clamp(3rem,6vw,5rem)',
    textAlign: 'center', position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)',
    color: '#25D366', borderRadius: 100, padding: '0.35rem 1rem',
    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
  },
  dot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#25D366', boxShadow: '0 0 8px #25D366',
    animation: 'pulse 2s ease-in-out infinite',
  },
  heroTitle: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 900, fontSize: 'clamp(2.5rem,6vw,4.5rem)',
    lineHeight: 1.05, letterSpacing: '-0.04em',
    color: 'var(--text)', margin: 0,
  },
  heroGrad: {
    background: 'linear-gradient(135deg,#25D366,#00D4AA)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  heroSub: {
    color: 'var(--text-2)', fontSize: 'clamp(1rem,2vw,1.15rem)',
    lineHeight: 1.7, maxWidth: 440, margin: 0,
  },
  heroBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.65rem',
    background: 'linear-gradient(135deg,#25D366,#1da851)',
    color: '#fff', border: 'none', borderRadius: 16,
    padding: '1rem 2.25rem', fontSize: '1rem', fontWeight: 700,
    fontFamily: 'inherit', cursor: 'pointer',
    boxShadow: '0 12px 32px rgba(37,211,102,0.4)',
    transition: 'transform .2s cubic-bezier(.4,0,.2,1), box-shadow .2s',
  },

  /* Info row */
  infoRow: {
    maxWidth: 1200, margin: '0 auto',
    padding: 'clamp(2.5rem,5vw,4rem) clamp(1rem,3vw,2rem) 0',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
    gap: '1rem',
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
  infoLabel: { fontSize: '0.72rem', color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' },
  infoValue: { fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 },
  infoAction: {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)',
    color: '#25D366', borderRadius: 8, padding: '0.4rem 0.9rem',
    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', alignSelf: 'flex-start',
    transition: 'background .15s',
  },

  /* Section */
  section: {
    maxWidth: 1200, margin: '0 auto',
    padding: 'clamp(2.5rem,5vw,4rem) clamp(1rem,3vw,2rem) clamp(3rem,6vw,5rem)',
  },
  sectionHeader: { textAlign: 'center', marginBottom: '2.5rem' },
  sectionTitle: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2rem)',
    color: 'var(--text)', letterSpacing: '-0.03em', margin: '0 0 0.5rem',
  },
  sectionSub: { color: 'var(--text-2)', fontSize: '0.9rem', margin: 0 },
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
