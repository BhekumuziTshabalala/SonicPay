import React, { useEffect, useRef, useState, useContext } from 'react'
import axios from 'axios'
import { createDecoder } from '../lib/decoder'
import StatusPill from '../components/StatusPill'
import LogPanel from '../components/LogPanel'
import TransactionTable from '../components/TransactionTable'
import { AuthContext } from '../context/AuthContext'
import useSSE from '../hooks/useSSE'

export default function Merchant() {
  const { user } = useContext(AuthContext)
  const [status, setStatus] = useState('idle')
  const [log, setLog] = useState([])
  const [token, setToken] = useState('')
  const [transactions, setTransactions] = useState([])

  const mediaStreamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const decoderRef = useRef(null)

  const pushLog = (msg) => setLog(l => [msg, ...l].slice(0, 50))

  // Fetch transaction history
  const fetchHistory = async () => {
    if (!user) return
    try {
      const res = await axios.get(`/api/payments/history?userId=${user.id}`)
      setTransactions(res.data)
    } catch (err) {
      pushLog('Failed to fetch transactions: ' + err.message)
    }
  }

  useEffect(() => { fetchHistory() }, [user])

  // SSE real-time updates
  useSSE(user ? `/api/payments/stream?userId=${user.id}` : null, (payment) => {
    pushLog(`New payment received: ${payment.amount} from ${payment.customerId}`)
    setTransactions(prev => [payment, ...prev].slice(0, 50))
  })

  const startListening = async () => {
    try {
      setStatus('listening')
      pushLog('Requesting microphone...')
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const src = audioCtxRef.current.createMediaStreamSource(mediaStreamRef.current)
      analyserRef.current = audioCtxRef.current.createAnalyser()
      analyserRef.current.fftSize = 4096
      analyserRef.current.smoothingTimeConstant = 0.85
      src.connect(analyserRef.current)

      pushLog('Microphone connected. Initializing decoder...')
      setStatus('decoding')

      decoderRef.current = createDecoder({
        analyser: analyserRef.current,
        audioCtx: audioCtxRef.current,
        onLog: pushLog,
        onToken: async (decodedToken) => {
          pushLog('Decoded token: ' + decodedToken)
          setToken(decodedToken)
          try {
            await axios.post('/api/payments/verify', { token: decodedToken })
            pushLog('Payment verified successfully.')
            setStatus('success')
            fetchHistory()
          } catch (err) {
            setStatus('error')
            pushLog('Payment verification failed: ' + err.message)
          }
        }
      })

    } catch (e) {
      setStatus('error')
      pushLog('Microphone access failed: ' + e.message)
    }
  }

  const stopListening = () => {
    if (decoderRef.current) decoderRef.current.stop()
    if (audioCtxRef.current) audioCtxRef.current.close()
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop())
    setStatus('idle')
    pushLog('Stopped listening.')
  }

  return (
    <div>
      <div className="glass" style={{ padding: '1.25rem' }}>
        <h1 className="text-2xl font-bold mb-2">SonicPay – Merchant</h1>
        <p className="text-muted mb-4">Listen for ultrasonic payments and decode tokens in real time.</p>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
          <button className="btn" onClick={startListening} disabled={status==='listening' || status==='decoding'}>
            {status === 'listening' || status === 'decoding' ? 'Listening…' : 'Start Listening'}
          </button>
          <button className="btn secondary" onClick={stopListening}>Stop</button>
          <StatusPill status={status} />
        </div>

        {token && (
          <div style={{ padding: '0.75rem', borderRadius: 8, background: '#e9fbf0', border: '1px solid #d1f3da', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Decoded Token</div>
            <pre style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{token}</pre>
          </div>
        )}

        <LogPanel log={log} />

      </div>

      <div style={{ marginTop: '1rem' }} className="glass" >
        <h2 className="text-xl font-semibold mt-2 mb-2" style={{ padding: '1rem' }}>Transaction History</h2>
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <TransactionTable transactions={transactions.map(tx => ({
            ...tx,
            party: tx.customerId
          }))} />
        </div>
      </div>
    </div>
  )
}
