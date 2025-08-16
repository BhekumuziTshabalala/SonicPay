import React, { useState, useRef, useEffect, useContext } from 'react'
import axios from 'axios'
import { createEmitter } from '../lib/emitter'
import StatusPill from '../components/StatusPill'
import LogPanel from '../components/LogPanel'
import TransactionTable from '../components/TransactionTable'
import { QRCodeCanvas } from "qrcode.react";
import { AuthContext } from '../context/AuthContext'
import useSSE from '../hooks/useSSE'

export default function Customer() {
  const { user } = useContext(AuthContext)
  const [amount, setAmount] = useState('')
  const [merchantId, setMerchantId] = useState('')
  const [status, setStatus] = useState('idle')
  const [log, setLog] = useState([])
  const [token, setToken] = useState('')
  const [qrVisible, setQrVisible] = useState(false)
  const [transactions, setTransactions] = useState([])

  const audioCtxRef = useRef(null)
  const emitterRef = useRef(null)

  const pushLog = (msg) => setLog(l => [msg, ...l].slice(0, 50))

  // Fetch transaction history
  const fetchHistory = async () => {
    if (!user) return
    try {
      const res = await axios.get(`/api/payments/history?userId=${user.id}`)
      // Ensure we always store an array (backend may return null/object)
      setTransactions(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      pushLog('Failed to fetch transactions: ' + err.message)
    }
  }

  useEffect(() => { fetchHistory() }, [user])

  // SSE real-time updates
  useSSE(user ? `/api/payments/stream?userId=${user.id}` : null, (payment) => {
    pushLog(`Payment confirmed: ${payment.amount} to ${payment.merchantId}`)
    // Guard previous value in case it's not an array
    setTransactions(prev => [payment, ...(Array.isArray(prev) ? prev : [])].slice(0, 50))
  })

  async function generateToken() {
    if (!amount || !merchantId) {
      pushLog('Amount and Merchant ID are required')
      return
    }

    setStatus('generating')
    setQrVisible(false)
    try {
      const res = await axios.post('/api/payments/create', { amount, merchantId })
      const newToken = res.data.token
      setToken(newToken)
      pushLog('Token generated: ' + newToken)
      setStatus('idle')
    } catch (err) {
      pushLog('Failed to generate token: ' + (err.response?.data?.message || err.message))
      setStatus('error')
    }
  }

  function startEmit() {
    if (!token) {
      pushLog('No token to emit')
      return
    }

    setStatus('emitting')
    try {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      emitterRef.current = createEmitter({
        token,
        audioCtx: audioCtxRef.current,
        onLog: pushLog,
        onComplete: async () => {
          setStatus('success')
          pushLog('Emission complete')
          // Confirm token with backend
          try {
            await axios.post('/api/payments/verify', { token })
            pushLog('Payment confirmed by backend')
            fetchHistory()
          } catch (err) {
            pushLog('Backend confirmation failed: ' + err.message)
          }
        }
      })
    } catch (err) {
      pushLog('Emission failed: ' + err.message)
      setStatus('error')
      setQrVisible(true)
    }
  }

  function stopEmit() {
    if (emitterRef.current) emitterRef.current.stop()
    if (audioCtxRef.current) audioCtxRef.current.close()
    setStatus('idle')
    pushLog('Stopped emission')
  }

  function showQR() {
    if (!token) {
      pushLog('No token to display')
      return
    }
    setQrVisible(true)
    pushLog('QR code displayed')
  }

  return (
    <div>
      <div className="glass" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <h1 className="text-2xl font-bold mb-2">SonicPay – Customer</h1>
        <p className="text-muted mb-4">Generate ultrasonic payment tokens and send to merchants.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <input type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
          <input type="text" placeholder="Merchant ID" value={merchantId} onChange={e=>setMerchantId(e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn" onClick={generateToken}>Generate Token</button>
            <button className="btn" onClick={startEmit}>Emit Sound</button>
            <button className="btn secondary" onClick={stopEmit}>Stop</button>
            <button className="btn secondary" onClick={showQR}>Show QR</button>
          </div>
        </div>

        <StatusPill status={status} />

        {token && qrVisible && (
          <div className="" style={{ padding: '1rem', borderRadius: 8, background: '#f0fff7', border: '1px solid #e1f6ea', marginTop: '0.75rem', textAlign: 'center' }}>
            <div className="mb-2 text-sm text-muted">Token QR</div>
            <QRCodeCanvas value={token} size={160} />
          </div>
        )}

        <LogPanel log={log} />
      </div>

      <div className="glass" style={{ padding: '1rem' }}>
        <h2 className="text-xl font-semibold mt-2 mb-2">Transaction History</h2>
        <TransactionTable transactions={(Array.isArray(transactions) ? transactions : []).map(tx => ({
          ...tx,
          party: tx.merchantId
        }))} />
      </div>
    </div>
  )
}
