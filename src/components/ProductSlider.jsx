import { useState, useRef, useEffect } from 'react'
import ProductCard from './ProductCard'

const PAGE_SIZES = [4, 8]

export default function ProductSlider({ productos }) {
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(8)
  const topRef = useRef(null)

  // Reset to page 0 when products list changes (filter applied)
  useEffect(() => { setPage(0) }, [productos])

  const totalPages = Math.ceil(productos.length / perPage)
  const slice = productos.slice(page * perPage, page * perPage + perPage)

  const goTo = (p) => {
    setPage(p)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <div>
      {/* Controls row */}
      <div style={s.controls} ref={topRef}>
        <p style={s.count}>
          <span style={{ color: '#6C63FF', fontWeight: 700 }}>{productos.length}</span>
          {' '}producto{productos.length !== 1 ? 's' : ''}
          {totalPages > 1 && (
            <span style={{ color: 'var(--text-2)', fontWeight: 400 }}>
              {' '}· Página {page + 1} de {totalPages}
            </span>
          )}
        </p>
        <div style={s.perPageRow}>
          <span style={s.perPageLabel}>Ver</span>
          {PAGE_SIZES.map(n => (
            <button key={n} onClick={() => { setPerPage(n); setPage(0) }}
              style={{ ...s.perPageBtn, ...(perPage === n ? s.perPageActive : {}) }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={s.grid}>
        {slice.map(p => <ProductCard key={p.id} p={p} />)}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={s.pagination}>
          <button onClick={() => goTo(page - 1)} disabled={page === 0} style={{ ...s.pgBtn, ...(page === 0 ? s.pgDisabled : {}) }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => {
            const show = i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1
            if (!show) {
              if (i === page - 2 || i === page + 2) return <span key={i} style={s.pgDots}>…</span>
              return null
            }
            return (
              <button key={i} onClick={() => goTo(i)}
                style={{ ...s.pgBtn, ...(i === page ? s.pgActive : {}) }}>
                {i + 1}
              </button>
            )
          })}

          <button onClick={() => goTo(page + 1)} disabled={page === totalPages - 1} style={{ ...s.pgBtn, ...(page === totalPages - 1 ? s.pgDisabled : {}) }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      )}
    </div>
  )
}

const s = {
  controls: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem',
  },
  count: { fontSize: '0.82rem', color: 'var(--text-2)', margin: 0 },
  perPageRow: { display: 'flex', alignItems: 'center', gap: '0.35rem' },
  perPageLabel: { fontSize: '0.78rem', color: 'var(--text-2)', marginRight: '0.15rem' },
  perPageBtn: {
    background: 'var(--input-bg)', border: '1px solid var(--input-border)',
    borderRadius: 8, padding: '0.3rem 0.7rem', fontSize: '0.8rem',
    fontFamily: 'inherit', cursor: 'pointer', color: 'var(--text-2)',
    transition: 'all .15s',
  },
  perPageActive: {
    background: 'rgba(108,99,255,0.15)', borderColor: 'rgba(108,99,255,0.4)',
    color: '#6C63FF', fontWeight: 700,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
    gap: '1.25rem',
    marginBottom: '2rem',
  },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.35rem', flexWrap: 'wrap',
  },
  pgBtn: {
    width: 38, height: 38, borderRadius: 10,
    border: '1px solid var(--input-border)',
    background: 'var(--input-bg)',
    color: 'var(--text-2)', fontFamily: 'inherit', fontSize: '0.85rem',
    fontWeight: 500, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .15s',
  },
  pgActive: {
    background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
    borderColor: 'transparent', color: '#fff', fontWeight: 700,
    boxShadow: '0 4px 12px rgba(108,99,255,0.35)',
  },
  pgDisabled: { opacity: 0.3, cursor: 'not-allowed' },
  pgDots: { color: 'var(--text-2)', fontSize: '0.85rem', padding: '0 0.25rem', alignSelf: 'center' },
}
