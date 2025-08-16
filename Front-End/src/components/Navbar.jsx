import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {
      console.error('Logout error:', e)
    }
  }

  const lockApp = () => {
    try { localStorage.removeItem('sonicpay.adminUnlocked') } catch (e) {}
    try { window.location.reload() } catch (e) {}
  }

  return (
    <div className="glass navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ fontWeight: 700, color: '#1f2d46' }}>SonicPay</div>
        <div className="text-muted">Light demo</div>
      </div>
      <div className="nav-links">
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/role-select">Portal</Link>
            <button onClick={handleLogout} className="btn secondary">Sign out</button>
            <button onClick={lockApp} className="btn secondary" title="Lock app and require admin unlock on next load">Lock App</button>
          </>
        )}
      </div>
    </div>
  )
}