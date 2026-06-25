import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { ConfigProvider } from './context/ConfigContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CatalogoPage from './pages/CatalogoPage'
import ProductoPage from './pages/ProductoPage'
import CarritoPage from './pages/CarritoPage'
import CategoriasPage from './pages/CategoriasPage'
import ContactoPage from './pages/ContactoPage'
import TestimoniosPage from './pages/TestimoniosPage'
import PaginaEstaticaPage from './pages/PaginaEstaticaPage'

export default function App() {
  return (
    <ThemeProvider>
      <ConfigProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<CatalogoPage />} />
              <Route path="/categorias" element={<CategoriasPage />} />
              <Route path="/contacto" element={<ContactoPage />} />
              <Route path="/testimonios" element={<TestimoniosPage />} />
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
