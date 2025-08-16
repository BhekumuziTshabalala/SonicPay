import React, { useEffect, useRef, useState, useContext } from 'react'
import axios from 'axios'
import { createDecoder } from '../lib/decoder'
import StatusPill from '../components/StatusPill'
import LogPanel from '../components/LogPanel'
import TransactionTable from '../components/TransactionTable'
import { AuthContext } from '../context/AuthContext'

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
            fetchHistory() // Refresh transaction table
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">SonicPay – Merchant</h1>
      <p className="opacity-80 mb-4">Listen for ultrasonic payments and decode tokens in real time.</p>

      <div className="flex gap-3 mb-4">
        <button className="px-4 py-2 rounded bg-black text-white" onClick={startListening} disabled={status==='listening' || status==='decoding'}>
          {status === 'listening' || status === 'decoding' ? 'Listening…' : 'Start Listening'}
        </button>
        <button className="px-4 py-2 rounded bg-gray-300" onClick={stopListening}>Stop</button>
        <StatusPill status={status} />
      </div>

      {token && (
        <div className="p-3 rounded bg-green-50 border border-green-200 mb-4">
          <div className="text-sm opacity-70">Decoded Token</div>
          <pre className="text-xs whitespace-pre-wrap">{token}</pre>
        </div>
      )}

      <LogPanel log={log} />

      <h2 className="text-xl font-semibold mt-6 mb-2">Transaction History</h2>
      <TransactionTable transactions={transactions.map(tx => ({
        ...tx,
        party: tx.customerId
      }))} />
    </div>
  )
}
