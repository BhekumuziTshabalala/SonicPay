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
    return { success: true };
  } catch (err) {
    return { success: false, error: err.response?.data?.message || err.message };
  }
}


  async function register(data) {
    const res = await axios.post('/api/auth/register', data)
    setUser(res.data)
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