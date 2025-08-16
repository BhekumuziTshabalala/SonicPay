import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useToasts } from '../contexts/ToastContext'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const toasts = useToasts ? useToasts() : null

  useEffect(() => {
    let mounted = true
    async function fetchMe() {
      try {
        const res = await axios.get('/api/auth/me')
        if (mounted) setUser(res.data)
      } catch (e) {
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchMe().catch(err => {
      console.error('Auth check failed:', err)
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  async function login(email, password) {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setUser(res.data);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed'
      try { toasts?.add(message, { type: 'error' }) } catch(e){}
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
      try { toasts?.add(message, { type: 'error' }) } catch(e){}
      throw new Error(message)
    }
  }

  async function logout() {
    setUser(null);
    try { await axios.post('/api/auth/logout'); } catch(e) { console.error('Logout failed:', e); }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}