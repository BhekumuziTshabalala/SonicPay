import React, { useState, useRef, useEffect, useContext } from 'react'
import axios from 'axios'
import { createEmitter } from '../lib/emitter'
import StatusPill from '../components/StatusPill'
import LogPanel from '../components/LogPanel'
import TransactionTable from '../components/TransactionTable'
import { QRCodeCanvas } from "qrcode.react"; // new API
import { AuthContext } from '../context/AuthContext'

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
      setTransactions(res.data)
    } catch (err) {
      pushLog('Failed to fetch transactions: ' + err.message)
    }
  }

  useEffect(() => { fetchHistory() }, [user])

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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">SonicPay – Customer</h1>
      <p className="opacity-80 mb-4">Generate ultrasonic payment tokens and send to merchants.</p>

      <div className="flex flex-col gap-3 mb-4">
        <input type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)}
               className="border p-2 rounded" />
        <input type="text" placeholder="Merchant ID" value={merchantId} onChange={e=>setMerchantId(e.target.value)}
               className="border p-2 rounded" />
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={generateToken}>Generate Token</button>
          <button className="px-4 py-2 rounded bg-black text-white" onClick={startEmit}>Emit Sound</button>
          <button className="px-4 py-2 rounded bg-gray-300" onClick={stopEmit}>Stop</button>
          <button className="px-4 py-2 rounded bg-green-200" onClick={showQR}>Show QR</button>
        </div>
      </div>

      <StatusPill status={status} />

      {token && qrVisible && (
        <div className="p-4 rounded bg-green-50 border border-green-200 my-4 text-center">
          <div className="mb-2 text-sm opacity-70">Token QR</div>
          <QRCodeCanvas value={token} size={160} />
        </div>
      )}

      <LogPanel log={log} />

      <h2 className="text-xl font-semibold mt-6 mb-2">Transaction History</h2>
      <TransactionTable transactions={transactions.map(tx => ({
        ...tx,
        party: tx.merchantId
      }))} />
    </div>
  )
}
