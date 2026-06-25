import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tienda_cart')) || [] }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('tienda_cart', JSON.stringify(items))
  }, [items])

  function add(producto) {
    setItems(prev => {
      const exists = prev.find(i => i.id === producto.id)
      if (exists) return prev.map(i => i.id === producto.id
        ? { ...i, qty: Math.min(i.qty + 1, i.cantidadVenta) } : i)
      return [...prev, { ...producto, qty: 1 }]
    })
  }

  function remove(id) { setItems(prev => prev.filter(i => i.id !== id)) }

  function changeQty(id, qty) {
    if (qty <= 0) { remove(id); return }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }

  function clear() { setItems([]) }

  const total = items.reduce((s, i) => s + parseFloat(i.precioVenta) * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, changeQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() { return useContext(CartContext) }
