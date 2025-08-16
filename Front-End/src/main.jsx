import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Merchant from './pages/Merchant.jsx'
// import Customer from './pages/Customer.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import RoleSelect from './pages/RoleSelect.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen p-6 bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/role-select" element={<RoleSelect />} />
            <Route path="/merchant" element={<Merchant />} />
            {/* <Route path="/customer" element={<Customer />} /> */}
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)