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
    if (roles.length === 0) { setError('Select at least one role'); return; }
    try {
      await register({ name, email, password, roles })
      navigate('/role-select')
    } catch (err) {
      setError('Registration failed: ' + err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} className="border p-2 rounded" required />
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="border p-2 rounded" required />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="border p-2 rounded" required />
        <div className="flex gap-2">
          <label className="flex items-center gap-1"><input type="checkbox" checked={roles.includes('merchant')} onChange={()=>toggleRole('merchant')} /> Merchant</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={roles.includes('customer')} onChange={()=>toggleRole('customer')} /> Customer</label>
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Register</button>
      </form>
      <p className="mt-4 text-sm">Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a></p>
    </div>
  )
}