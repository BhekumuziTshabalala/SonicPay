import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setUser(res.data);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed'
      throw new Error(message)
    }
  }

  async function register(data) {
    try {
      const res = await axios.post('/api/auth/register', data)
      setUser(res.data)
      return res.data
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed'
      throw new Error(message)
    }
  }

  async function logout() {
    setUser(null);
    try { await axios.post('/api/auth/logout'); } catch(e) { console.error(e); }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}