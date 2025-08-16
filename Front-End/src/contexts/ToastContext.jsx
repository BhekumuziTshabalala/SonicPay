import React, { createContext, useState, useCallback, useContext } from 'react'

const ToastContext = createContext(undefined)

export function useToasts() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToasts must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const add = useCallback((message, { type = 'info', duration = 4000 } = {}) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message: String(message), type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
  }, [])
  const remove = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), [])

  const colorFor = (type) => {
    switch(type) {
      case 'success': return { bg: 'linear-gradient(180deg, rgba(230,255,240,0.9), rgba(245,255,250,0.85))', border: 'rgba(34,139,76,0.12)', accent: '#1f9d55' }
      case 'error': return { bg: 'linear-gradient(180deg, rgba(255,240,240,0.95), rgba(255,245,245,0.9))', border: 'rgba(200,50,50,0.12)', accent: '#c0392b' }
      default: return { bg: 'linear-gradient(180deg, rgba(250,250,255,0.95), rgba(245,250,255,0.9))', border: 'rgba(30,40,80,0.06)', accent: '#4f56e6' }
    }
  }

  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}
      <div aria-live="polite" style={{ position: 'fixed', right: 16, top: 16, zIndex: 99999 }}>
        {toasts.map(t => {
          const c = colorFor(t.type)
          return (
            <div key={t.id} style={{ marginBottom: 8 }}>
              <div style={{ padding: '0.6rem 0.9rem', borderRadius: 12, minWidth: 220, boxShadow: '0 10px 30px rgba(35,50,80,0.08)', background: c.bg, border: `1px solid ${c.border}`, backdropFilter: 'blur(6px) saturate(120%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontSize: 14, color: '#0f1720', fontWeight: 600 }}>{t.message}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => remove(t.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: c.accent }}>✕</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastContext
