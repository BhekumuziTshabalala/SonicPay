import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Merchant from './pages/Merchant.jsx'
import Customer from './pages/Customer.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import RoleSelect from './pages/RoleSelect.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import AdminGate from './components/AdminGate.jsx'

function AppWrapper() {
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem('sonicpay.adminUnlocked')
      if (v === '1') setUnlocked(true)
    } catch (e) { /* ignore */ }
  }, [])

  return (
    <AuthProvider>
      {!unlocked && <AdminGate onAuthenticate={() => setUnlocked(true)} />}
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/role-select" element={<RoleSelect />} />
            <Route path="/merchant" element={<Merchant />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
)