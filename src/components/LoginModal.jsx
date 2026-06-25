import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'

export default function LoginModal({ open, onClose }) {
  const { login } = useAuth()

  const googleLogin = useGoogleLogin({
    onSuccess: async (token) => {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      })
      login(await res.json())
      onClose()
    },
  })

  if (!open) return null

  return (
    <div onClick={onClose} style={s.backdrop}>
      <div onClick={e => e.stopPropagation()} style={s.box}>
        <button onClick={onClose} style={s.close} aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Logo icon */}
        <div style={s.iconWrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16,18 22,12 16,6"/>
            <polyline points="8,6 2,12 8,18"/>
            <line x1="19" y1="9" x2="13" y2="21"/>
          </svg>
        </div>

        <h2 style={s.title}>Inicia sesión para continuar</h2>
        <p style={s.sub}>Necesitas una cuenta Google para agregar productos al carrito y dejar reseñas.</p>

        <button onClick={() => googleLogin()} style={s.googleBtn}>
          <GoogleSvg />
          Continuar con Google
        </button>

        <p style={s.legal}>Tus datos se usan únicamente para gestionar tus pedidos.</p>
      </div>
    </div>
  )
}

function GoogleSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  )
}

const s = {
  backdrop: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
  box: {
    background: '#12121A',
    border: '1px solid rgba(108,99,255,0.25)',
    borderRadius: 20, padding: '2.5rem 2rem',
    maxWidth: 400, width: '100%',
    textAlign: 'center', position: 'relative',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.1)',
    animation: 'fadeIn .25s ease',
    fontFamily: "'Inter',system-ui,sans-serif",
  },
  close: {
    position: 'absolute', top: '1rem', right: '1rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, width: 30, height: 30,
    cursor: 'pointer', color: '#8888A8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  iconWrap: {
    width: 60, height: 60, borderRadius: 16,
    background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.25rem',
    boxShadow: '0 8px 24px rgba(108,99,255,0.4)',
  },
  title: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 700, fontSize: '1.35rem',
    color: '#E8E8F0', marginBottom: '0.6rem', letterSpacing: '-0.02em',
  },
  sub: { color: '#8888A8', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: '1.75rem' },
  googleBtn: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.75rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, padding: '0.9rem',
    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
    color: '#E8E8F0', fontFamily: 'inherit',
    transition: 'background .2s, border-color .2s',
  },
  legal: { marginTop: '1.25rem', fontSize: '0.7rem', color: '#8888A8', lineHeight: 1.6 },
}
