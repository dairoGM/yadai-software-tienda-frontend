import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import { useTheme } from '../context/ThemeContext'
import LoadingOverlay from '../components/LoadingOverlay'

export default function PaginaEstaticaPage() {
  const { slug } = useParams()
  const { dark } = useTheme()
  const [pagina, setPagina] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getPagina(slug)
      .then(setPagina)
      .catch(() => setPagina(null))
      .finally(() => { setLoading(false); window.hideSplash?.() })
  }, [slug])

  if (loading) return <LoadingOverlay text="Cargando página..." />

  if (!pagina) return (
    <div style={{ textAlign: 'center', padding: 'calc(64px + 4rem) 1rem', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Página no encontrada.</p>
      <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>← Volver al inicio</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 'calc(64px + 2.5rem) clamp(1rem,3vw,2rem) 4rem', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <Link to="/" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2rem' }}>
        ← Inicio
      </Link>
      <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
        {pagina.titulo}
      </h1>
      <div style={{ height: 3, width: 48, background: 'linear-gradient(90deg,#6C63FF,#00D4AA)', borderRadius: 2, marginBottom: '2.5rem' }} />
      <div
        style={{ color: 'var(--text-2)', lineHeight: 1.85, fontSize: '0.95rem' }}
        dangerouslySetInnerHTML={{ __html: pagina.contenido }}
      />
      <p style={{ marginTop: '3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Última actualización: {pagina.updatedAt}
      </p>
    </div>
  )
}
