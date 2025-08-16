import React from 'react'

export default function LogPanel({ log }) {
  return (
    <div className="p-3 rounded bg-gray-50 border border-gray-200 max-h-60 overflow-y-auto">
      <div className="text-sm opacity-70 mb-2">Log</div>
      <ul className="text-xs space-y-1">
        {log.map((m, i) => <li key={i}>• {m}</li>)}
      </ul>
    </div>
  )
}