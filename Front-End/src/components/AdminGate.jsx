import React, { useState } from 'react'

export default function AdminGate({ onAuthenticate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    // local gate: accept admin@admin.com / admin
    if (email === 'admin@admin.com' && password === 'admin') {
      try { localStorage.setItem('sonicpay.adminUnlocked', '1') } catch(e) {}
      onAuthenticate()
    } else {
      setError('Invalid admin credentials')
    }
  }

  return (
    <div className="admin-overlay">
      <div className="glass admin-modal">
        <h2 className="center">Admin Access Required</h2>
        <p className="text-muted center">Please sign in with the administrator account to continue.</p>
        {error && <div style={{ color: '#c0392b', marginTop: '0.5rem' }}>{error}</div>}
        <form onSubmit={submit} style={{ marginTop: '1rem', display: 'grid', gap: '0.6rem' }}>
          <input type="email" placeholder="Admin Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Admin Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button className="btn secondary" type="button" onClick={()=>{ setEmail('admin@admin.com'); setPassword('admin'); }}>Fill Demo</button>
            <button className="btn" type="submit">Unlock</button>
          </div>
        </form>
        <p className="text-muted center" style={{ marginTop: '0.85rem' }}>Default demo admin: <strong>admin@admin.com</strong> / <strong>admin</strong></p>
      </div>
    </div>
  )
}
