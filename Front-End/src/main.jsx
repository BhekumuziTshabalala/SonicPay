import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Merchant from './pages/Merchant.jsx'
// import Customer from './pages/Customer.jsx'
import './index.css'

import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen p-6">
          <nav className="mb-6 flex gap-4">
            <Link to="/merchant">Merchant</Link>
            <Link to="/customer">Customer</Link>
          </nav>
          <Routes>
            <Route path="/merchant" element={<Merchant />} />
            {/* <Route path="/customer" element={<Customer />} /> */}
            <Route path="*" element={<Merchant />} />
          </Routes>
        </div>
    </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
