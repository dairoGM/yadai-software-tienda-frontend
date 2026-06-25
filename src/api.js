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

export const api = {
  getProductos:    ()         => get('/api/productos'),
  getProducto:     (id)       => get(`/api/productos/${id}`),
  crearResena:     (id, data) => post(`/api/productos/${id}/resenas`, data),
  crearPedido:     (data)     => post('/api/pedidos', data),
  getCategorias:   ()         => get('/api/categorias'),
  getResenas:      ()         => get('/api/resenas'),
  getPaginas:      ()         => get('/api/paginas'),
  getPagina:       (slug)     => get(`/api/paginas/${slug}`),
  getConfig:       ()         => get('/api/config'),
}
