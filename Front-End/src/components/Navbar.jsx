import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white shadow p-4 rounded mb-6 flex gap-4">
      <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
      <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
    </nav>
  )
}