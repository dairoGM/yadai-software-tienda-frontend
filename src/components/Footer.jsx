import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'

export default function Footer() {
  const year = new Date().getFullYear()
  const { whatsapp, horario, envios } = useConfig()
  const navigate = useNavigate()
  const location = useLocation()

  function handleSection(id) {
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/', { state: { scrollTo: id } })
    }
  }

  return (
    <footer style={s.footer}>
        <div style={s.inner}>

          {/* Columna marca */}
          <div style={s.col}>
            <div style={s.logoRow}>
              <div style={s.logoIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16,18 22,12 16,6"/>
                  <polyline points="8,6 2,12 8,18"/>
                </svg>
              </div>
              <span style={s.brandText}>YA&amp;DAI Software Tienda</span>
            </div>
            <p style={s.tagline}>Tu tienda online de soluciones digitales a la medida.</p>
          </div>

          {/* Columna navegación */}
          <div style={s.col}>
            <p style={s.colTitle}>Tienda</p>
            <div style={s.linkList}>
              <button onClick={() => handleSection('categorias')} style={s.linkBtn}>Categorías</button>
              <button onClick={() => handleSection('beneficios')} style={s.linkBtn}>Beneficios</button>
              <button onClick={() => handleSection('productos')} style={s.linkBtn}>Productos</button>
              <button onClick={() => handleSection('testimonios')} style={s.linkBtn}>Testimonios</button>
              <button onClick={() => handleSection('contacto')} style={s.linkBtn}>Contacto</button>
              <Link to="/carrito" style={s.link}>Carrito</Link>
            </div>
          </div>

          {/* Columna info legal */}
          <div style={s.col}>
            <p style={s.colTitle}>Legal</p>
            <div style={s.linkList}>
              <Link to="/info/metodos-pago" style={s.link}>Métodos de pago</Link>
              <Link to="/info/garantia" style={s.link}>Garantía</Link>
              <Link to="/info/devoluciones" style={s.link}>Devoluciones</Link>
              <Link to="/info/privacidad" style={s.link}>Privacidad</Link>
              <Link to="/info/terminos" style={s.link}>Términos</Link>
            </div>
          </div>

          {/* Columna contacto */}
          <div style={s.col}>
            <p style={s.colTitle}>Contacto</p>
            <div style={s.linkList}>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`}
                  target="_blank" rel="noreferrer"
                  style={s.link}
                >
                  📱 WhatsApp
                </a>
              )}
              {horario && <span style={s.info}>🕐 {horario}</span>}
              {envios && <span style={s.info}>🚚 {envios}</span>}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={s.bottom}>
          <p style={s.copy}>
            © {year} YA&amp;DAI Software · Soluciones digitales a la medida
          </p>
        </div>
    </footer>
  )
}

const s = {
  footer: {
    background: 'var(--bg-2)',
    borderTop: '1px solid rgba(108,99,255,0.12)',
    fontFamily: "'Inter',system-ui,sans-serif",
  },
  inner: {
    maxWidth: 1200, margin: '0 auto',
    padding: 'clamp(2rem,4vw,3rem) clamp(1rem,3vw,2rem) 1.5rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
    gap: '2rem',
  },
  col: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  logoIcon: {
    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
    background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  brandText: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 700, fontSize: '0.95rem',
    background: 'linear-gradient(135deg,#fff,var(--text-2))',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  tagline: { fontSize: '0.8rem', color: 'var(--text-2)', margin: 0, lineHeight: 1.5 },
  colTitle: {
    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--text-2)', margin: 0,
  },
  linkList: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  link: {
    fontSize: '0.82rem', color: 'var(--text-2)', textDecoration: 'none',
    transition: 'color .15s',
  },
  linkBtn: {
    fontSize: '0.82rem', color: 'var(--text-2)', textDecoration: 'none',
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
    textAlign: 'left', transition: 'color .15s',
  },
  info: { fontSize: '0.82rem', color: 'var(--text-2)' },
  bottom: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '1rem clamp(1rem,3vw,2rem)',
    textAlign: 'center',
  },
  copy: { fontSize: '0.78rem', color: 'var(--text-2)', margin: 0 },
}
