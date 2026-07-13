import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MenuPage  from './pages/MenuPage'

// The admin panel and its heavy form/dialog deps load only when visited.
const AdminPage = lazy(() => import('./pages/AdminPage'))

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<MenuPage />} />
      <Route
        path="/admin"
        element={
          <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
            <AdminPage />
          </Suspense>
        }
      />
      <Route path="*"      element={<MenuPage />} />
    </Routes>
  )
}
