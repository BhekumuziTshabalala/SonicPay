import React from 'react'

export default function StatusPill({ status }) {
  const colors = {
    idle: 'bg-gray-100 text-gray-700',
    listening: 'bg-yellow-100 text-yellow-800',
    decoding: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700'
  }
  return (
    <span className={`px-3 py-2 rounded text-sm ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      Status: {status}
    </span>
  )
}