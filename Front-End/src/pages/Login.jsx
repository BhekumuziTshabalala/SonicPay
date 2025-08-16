import React, { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/role-select')
    } catch (err) {
      setError(err.message || 'Invalid credentials or server error')
    }
  }

  return (
    <div className="app-container">
      <div className="glass max-w-md mx-auto" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2>Welcome back</h2>
          <div className="text-muted">Sign in to continue</div>
        </div>

        {error && <div style={{ color: '#c0392b', marginBottom: '0.6rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="form-row">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <div className="form-actions">
            <a href="/register" className="text-muted" style={{ marginRight: 'auto' }}>Create an account</a>
            <button type="submit" className="btn">Sign in</button>
          </div>
        </form>

        <div style={{ marginTop: '1rem' }} className="text-muted center">Demo admin: <strong>admin</strong> / <strong>admin</strong></div>
      </div>
    </div>
  )
}