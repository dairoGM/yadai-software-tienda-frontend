import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

const SECTIONS = ['hero', 'categorias', 'beneficios', 'productos']

export default function Navbar() {
  const { count } = useCart()
  const { theme, toggle } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [scrolled, setScrolled] = useState(false)
  const loc = useLocation()
  const navigate = useNavigate()
  const isHome = loc.pathname === '/'

  // Scroll-spy: only on home route
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20)
    if (!isHome) return
    let current = 'hero'
    for (const id of SECTIONS) {
      const el = document.getElementById(id)
      if (el && el.getBoundingClientRect().top <= 80) current = id
    }
    setActiveSection(current)
  }, [isHome])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleSectionClick = (id) => {
    setMobileOpen(false)
    if (isHome) {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Navigate to home with hash so CatalogoPage can scroll on mount
      navigate('/', { state: { scrollTo: id } })
    }
  }

  // Nav links — home sections get scroll-spy, others are routes
  const links = [
    { label: 'Inicio',      type: 'section', id: 'hero',       to: '/' },
    { label: 'Categorías',  type: 'section', id: 'categorias', to: '/' },
    { label: 'Beneficios',  type: 'section', id: 'beneficios', to: '/' },
    { label: 'Productos',   type: 'section', id: 'productos',  to: '/' },
    { label: 'Testimonios', type: 'route',   to: '/testimonios' },
    { label: 'Contacto',    type: 'route',   to: '/contacto' },
  ]

  const isLinkActive = (l) => {
    if (l.type === 'section') return isHome && activeSection === l.id
    return loc.pathname.startsWith(l.to)
  }

  const navBg = scrolled
    ? 'rgba(10,10,15,0.95)'
    : 'rgba(10,10,15,0.7)'

  return (
    <nav style={{ ...s.nav, background: navBg }}>
      <div style={s.inner}>
        {/* Logo */}
        <Link to="/" style={s.logo} onClick={() => handleSectionClick('hero')}>
          <div style={s.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16,18 22,12 16,6"/>
              <polyline points="8,6 2,12 8,18"/>
            </svg>
          </div>
          <div style={s.logoTexts}>
            <span style={s.logoText}>YA&amp;DAI Software</span>
            <span style={s.logoSub}>Tienda</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div style={s.links}>
          {links.map(l => {
            const active = isLinkActive(l)
            if (l.type === 'section') {
              return (
                <button key={l.id} onClick={() => handleSectionClick(l.id)}
                  style={{ ...s.link, ...(active ? s.linkActive : {}) }}>
                  {l.label}
                </button>
              )
            }
            return (
              <Link key={l.to} to={l.to}
                style={{ ...s.link, ...(active ? s.linkActive : {}) }}>
                {l.label}
              </Link>
            )
          })}
        </div>

        {/* Right */}
        <div style={s.right}>
          {/* Theme toggle */}
          <button onClick={toggle} style={s.iconBtn} aria-label="Cambiar tema" title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            {theme === 'dark'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
            }
          </button>

          <Link to="/carrito" style={s.cartBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {count > 0 && <span style={s.cartBadge}>{count > 9 ? '9+' : count}</span>}
          </Link>

          <button onClick={() => setMobileOpen(v => !v)} style={s.hamburger} aria-label="Menú">
            {mobileOpen
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={s.mobileMenu}>
          {links.map(l => {
            const active = isLinkActive(l)
            if (l.type === 'section') {
              return (
                <button key={l.id} onClick={() => { handleSectionClick(l.id); setMobileOpen(false) }}
                  style={{ ...s.mobileLink, ...(active ? s.mobileLinkActive : {}) }}>
                  {l.label}
                </button>
              )
            }
            return (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                style={{ ...s.mobileLink, ...(active ? s.mobileLinkActive : {}) }}>
                {l.label}
              </Link>
            )
          })}
          <Link to="/carrito" onClick={() => setMobileOpen(false)} style={s.mobileLink}>
            Carrito {count > 0 && <span style={{ background: 'rgba(108,99,255,0.2)', color: '#6C63FF', borderRadius: 20, padding: '0.1rem 0.5rem', fontSize: '0.75rem', marginLeft: '0.4rem', fontWeight: 700 }}>{count}</span>}
          </Link>
        </div>
      )}
    </nav>
  )
}

const s = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(108,99,255,0.15)',
    fontFamily: "'Inter',system-ui,sans-serif",
    transition: 'background .3s',
  },
  inner: {
    maxWidth: 1280, margin: '0 auto',
    padding: '0 clamp(1rem,3vw,2rem)',
    height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
  },
  logo: { textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, cursor: 'pointer' },
  logoTexts: { display: 'flex', flexDirection: 'column', gap: 0 },
  logoIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  logoText: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '0.92rem', color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.2 },
  logoSub: { fontSize: '0.65rem', color: 'var(--text-2)', fontWeight: 500, letterSpacing: '0.04em', lineHeight: 1.2 },
  links: { display: 'flex', gap: '0.1rem', flex: 1, justifyContent: 'center' },
  link: {
    textDecoration: 'none', padding: '0.4rem 0.7rem', borderRadius: 8,
    fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-2)',
    transition: 'all .15s', background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: "'Inter',system-ui,sans-serif",
  },
  linkActive: { background: 'rgba(108,99,255,0.15)', color: '#6C63FF', fontWeight: 600 },
  right: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 },
  iconBtn: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, width: 38, height: 38,
    cursor: 'pointer', color: 'var(--text-2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color .15s, color .15s',
  },
  cartBtn: {
    position: 'relative', textDecoration: 'none', color: 'var(--text-2)',
    width: 40, height: 40, borderRadius: 10,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color .15s, color .15s',
  },
  cartBadge: {
    position: 'absolute', top: -5, right: -5,
    background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    color: '#fff', borderRadius: '50%',
    width: 18, height: 18, fontSize: '0.58rem', fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid var(--bg)',
  },
  hamburger: {
    display: 'none', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, width: 38, height: 38,
    cursor: 'pointer', color: 'var(--text-2)',
    alignItems: 'center', justifyContent: 'center',
  },
  mobileMenu: {
    padding: '0.75rem 1rem 1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column', gap: '0.25rem',
    background: 'rgba(10,10,15,0.97)',
  },
  mobileLink: {
    textDecoration: 'none', padding: '0.65rem 0.75rem',
    borderRadius: 8, fontSize: '0.9rem', fontWeight: 500,
    color: '#E8E8F0', display: 'flex', alignItems: 'center',
    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
    fontFamily: "'Inter',system-ui,sans-serif", width: '100%',
  },
  mobileLinkActive: { background: 'rgba(108,99,255,0.12)', color: '#6C63FF' },
}
