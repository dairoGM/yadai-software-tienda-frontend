import { Link } from 'react-router-dom'

const PAGINAS = [
  { slug: 'metodos-pago',       label: 'Métodos de Pago',          icon: '💳' },
  { slug: 'garantia',           label: 'Garantía',                 icon: '🛡️' },
  { slug: 'devoluciones',       label: 'Política de Devoluciones', icon: '↩️' },
  { slug: 'privacidad',         label: 'Política de Privacidad',   icon: '🔒' },
  { slug: 'terminos',           label: 'Términos y Condiciones',   icon: '📄' },
]

export default function PreFooter() {
  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <div style={s.links}>
          {PAGINAS.map(p => (
            <Link key={p.slug} to={`/info/${p.slug}`} style={s.link}>
              <span style={s.linkIcon}>{p.icon}</span>
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap: {
    background: 'var(--bg-2)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '1.5rem clamp(1rem,3vw,2rem)',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto',
    display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
  },
  label: {
    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--text-2)',
    margin: 0, whiteSpace: 'nowrap', flexShrink: 0,
  },
  links: {
    display: 'flex', gap: '0.35rem', flexWrap: 'wrap', flex: 1,
  },
  link: {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    textDecoration: 'none',
    fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-2)',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, padding: '0.35rem 0.75rem',
    transition: 'color .15s, border-color .15s, background .15s',
  },
  linkIcon: { fontSize: '0.9rem' },
}
