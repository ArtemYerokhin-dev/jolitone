import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import ReviewsPage from './pages/ReviewsPage'
import CheckoutPage from './pages/CheckoutPage'
import AdminPage from './pages/AdminPage'
import FavoritesPage from './pages/FavoritesPage'
import NewArrivalsPage from './pages/NewArrivalsPage'
import BestsellersPage from './pages/BestsellersPage'
import MyOrdersPage from './pages/MyOrdersPage'
import EmailVerifiedPage from './pages/EmailVerifiedPage'
import OrderTrackPage from './pages/OrderTrackPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function PublicApp() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/email-verified" element={<EmailVerifiedPage />} />
        <Route path="/novynky" element={<NewArrivalsPage />} />
        <Route path="/bestsellery" element={<BestsellersPage />} />
        <Route path="/track" element={<OrderTrackPage />} />
      </Routes>
    </Layout>
  )
}

const basename = import.meta.env.BASE_URL === '/' ? '/' : '/jolitone'

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <ScrollToTop />
            <Routes>
              {/* Адмін — окремо, без шапки і футера */}
              <Route path="/admin" element={<AdminPage />} />
              {/* Публічний сайт */}
              <Route path="*" element={<PublicApp />} />
            </Routes>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
