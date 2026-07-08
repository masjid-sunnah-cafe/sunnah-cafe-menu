import { Routes, Route } from 'react-router-dom'
import MenuPage  from './pages/MenuPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<MenuPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*"      element={<MenuPage />} />
    </Routes>
  )
}
