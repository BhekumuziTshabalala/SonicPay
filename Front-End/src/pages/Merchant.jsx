import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { createDecoder } from '../lib/decoder'
import StatusPill from '../components/StatusPill'
import LogPanel from '../components/LogPanel'

export default function Merchant() {
  const [status, setStatus] = useState('idle')
  const [log, setLog] = useState([])
  const [token, setToken] = useState('')

  const mediaStreamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const decoderRef = useRef(null)

  const pushLog = (msg) => setLog(l => [msg, ...l].slice(0, 50))

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

  const stopListening = () => {
    if (decoderRef.current) decoderRef.current.stop()
    if (audioCtxRef.current) audioCtxRef.current.close()
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop())
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
        <StatusPill status={status} />
      </div>

      {token && (
        <div className="p-3 rounded bg-green-50 border border-green-200 mb-4">
          <div className="text-sm opacity-70">Decoded Token</div>
          <pre className="text-xs whitespace-pre-wrap">{token}</pre>
        </div>
      )}

      <LogPanel log={log} />
    </div>
  )
}