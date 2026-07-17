import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MenuPage  from './pages/MenuPage'

// The admin panel and its heavy form/dialog deps load only when visited.
const AdminPage = lazy(() => import('./pages/AdminPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderStatusPage = lazy(() => import('./pages/OrderStatusPage'))

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<MenuPage />} />
      <Route
        path="/cart"
        element={
          <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
            <CartPage />
          </Suspense>
        }
      />
      <Route
        path="/checkout"
        element={
          <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
            <CheckoutPage />
          </Suspense>
        }
      />
      <Route
        path="/admin"
        element={
          <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
            <AdminPage />
          </Suspense>
        }
      />
      <Route
        path="/order/:orderId"
        element={
          <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
            <OrderStatusPage />
          </Suspense>
        }
      />
      <Route path="*"      element={<MenuPage />} />
    </Routes>
  )
}
