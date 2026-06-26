import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { ConfigProvider } from './context/ConfigContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import ProductoPage from './pages/ProductoPage'
import CarritoPage from './pages/CarritoPage'
import CategoriasPage from './pages/CategoriasPage'
import PaginaEstaticaPage from './pages/PaginaEstaticaPage'

export default function App() {
  return (
    <ThemeProvider>
      <ConfigProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <main style={{ minHeight: '100vh' }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/categorias" element={<CategoriasPage />} />
              <Route path="/testimonios" element={<Navigate to="/" replace />} />
              <Route path="/contacto" element={<Navigate to="/" replace />} />
              <Route path="/producto/:id" element={<ProductoPage />} />
              <Route path="/carrito" element={<CarritoPage />} />
              <Route path="/info/:slug" element={<PaginaEstaticaPage />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </CartProvider>
      </ConfigProvider>
    </ThemeProvider>
  )
}
