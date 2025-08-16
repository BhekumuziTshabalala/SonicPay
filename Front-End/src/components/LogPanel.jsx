import React from 'react'

export default function LogPanel({ log }) {
  const safeLog = Array.isArray(log) ? log : []
  return (
    <div className="p-3 rounded bg-gray-50 border border-gray-200 max-h-60 overflow-y-auto">
      <div className="text-sm opacity-70 mb-2">Log</div>
      <ul className="text-xs space-y-1">
        {safeLog.map((m, i) => <li key={i}>• {String(m)}</li>)}
      </ul>
    </div>
  )
}