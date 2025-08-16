import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { createDecoder } from '../lib/decoder'

export default function Merchant() {
  const [status, setStatus] = useState('idle') // idle | listening | decoding | success | error
  const [log, setLog] = useState([])
  const [token, setToken] = useState('')
  const mediaStreamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const decoderRef = useRef(null)

  function pushLog(msg) {
    setLog(l => [msg, ...l].slice(0, 50))
  }

  async function startListening() {
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
        onLog: (m) => pushLog(m),
        onToken: async (decodedToken) => {
          pushLog('Decoded token: ' + decodedToken)
          setToken(decodedToken)
          try {
            const res = await axios.post('/api/payments/verify', { token: decodedToken })
            setStatus('success')
            pushLog('Payment verified successfully.')
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

  function stopListening() {
    if (decoderRef.current) decoderRef.current.stop()
    if (audioCtxRef.current) audioCtxRef.current.close()
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
    }
    setStatus('idle')
    pushLog('Stopped listening.')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">SonicPay – Merchant</h1>
      <p className="opacity-80 mb-4">Listen for ultrasonic payments and decode tokens in real time.</p>

      <div className="flex gap-3 mb-4">
        <button className="px-4 py-2 rounded bg-black text-white" onClick={startListening} disabled={status==='listening' || status==='decoding'}>
          {status === 'listening' || status === 'decoding' ? 'Listening…' : 'Start Listening'}
        </button>
        <button className="px-4 py-2 rounded bg-gray-300" onClick={stopListening}>Stop</button>
        <span className={`px-3 py-2 rounded text-sm ${status==='success'? 'bg-green-100 text-green-700': status==='error'? 'bg-red-100 text-red-700':'bg-gray-100'}`}>
          Status: {status}
        </span>
      </div>

      {token && (
        <div className="p-3 rounded bg-green-50 border border-green-200 mb-4">
          <div className="text-sm opacity-70">Decoded Token</div>
          <pre className="text-xs whitespace-pre-wrap">{token}</pre>
        </div>
      )}

      <div className="p-3 rounded bg-gray-50 border border-gray-200">
        <div className="text-sm opacity-70 mb-2">Log</div>
        <ul className="text-xs space-y-1">
          {log.map((m, i) => <li key={i}>• {m}</li>)}
        </ul>
      </div>
    </div>
  )
}