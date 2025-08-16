import React, { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const { register } = useContext(AuthContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roles, setRoles] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const toggleRole = (role) => {
    setRoles(r => r.includes(role) ? r.filter(x=>x!==role) : [...r, role])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (roles.length === 0) { setError('Select at least one role'); return; }
    try {
      await register({ name, email, password, roles })
      navigate('/role-select')
    } catch (err) {
      setError(err.message || ('Registration failed'))
    }
  }

  return (
    <div className="app-container">
      <div className="glass max-w-md mx-auto" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2>Create account</h2>
          <div className="text-muted">Start accepting payments</div>
        </div>

        {error && <div style={{ color: '#c0392b', marginBottom: '0.6rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="form-row">
          <input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><input type="checkbox" checked={roles.includes('merchant')} onChange={()=>toggleRole('merchant')} /> Merchant</label>
            <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><input type="checkbox" checked={roles.includes('customer')} onChange={()=>toggleRole('customer')} /> Customer</label>
          </div>

          <div className="form-actions">
            <a href="/login" className="text-muted" style={{ marginRight: 'auto' }}>Already have an account?</a>
            <button type="submit" className="btn">Create account</button>
          </div>
        </form>

      </div>
    </div>
  )
}