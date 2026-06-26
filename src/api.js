const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8027'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// Cache en memoria — se resetea al recargar la página
const _cache = new Map()
async function cached(key, fetcher) {
  if (_cache.has(key)) return _cache.get(key)
  const p = fetcher()
  _cache.set(key, p)
  p.catch(() => _cache.delete(key)) // limpiar si falla
  return p
}

export const api = {
  // Productos paginados con filtros (server-side)
  getProductos: (params = {}) => {
    const { page = 1, limit = 12, categoria, q, sort } = params
    const qs = new URLSearchParams({ page, limit })
    if (categoria) qs.set('categoria', categoria)
    if (q)        qs.set('q', q)
    if (sort)     qs.set('sort', sort)
    const key = `productos:${qs.toString()}`
    return cached(key, () => get(`/api/productos?${qs}`))
  },

  // Categorías — pocas, se cachean indefinidamente
  getCategorias: () => cached('categorias', () => get('/api/categorias')),

  // Reseñas paginadas
  getResenas: (params = {}) => {
    const { page = 1, limit = 10 } = params
    const key = `resenas:${page}:${limit}`
    return cached(key, () => get(`/api/resenas?page=${page}&limit=${limit}`))
  },

  getProducto:  (id)       => get(`/api/productos/${id}`),
  crearResena:  (id, data) => post(`/api/productos/${id}/resenas`, data),
  crearPedido:  (data)     => post('/api/pedidos', data),
  getPaginas:   ()         => get('/api/paginas'),
  getPagina:    (slug)     => get(`/api/paginas/${slug}`),
  getConfig:    ()         => get('/api/config'),

  // Invalidar cache (útil tras crear reseña)
  invalidate: (prefix) => {
    for (const key of _cache.keys()) {
      if (key.startsWith(prefix)) _cache.delete(key)
    }
  },
}
