import { freqToBin, powerAtFreq } from './audioUtils'

const PREAMBLE_FREQ = 18500
const FREQ_1 = 19000
const FREQ_0 = 20000
const PREAMBLE_MS = 200
const BIT_MS = 80

export function createDecoder({ analyser, audioCtx, onToken, onLog }) {
  const fftSize = analyser.fftSize
  const sampleRate = audioCtx.sampleRate
  const preambleBin = freqToBin(PREAMBLE_FREQ, sampleRate, fftSize)
  const bin1 = freqToBin(FREQ_1, sampleRate, fftSize)
  const bin0 = freqToBin(FREQ_0, sampleRate, fftSize)

  const freqData = new Float32Array(analyser.frequencyBinCount)
  let state = 'searchPreamble'
  let bufBits = []
  let lastSwitch = performance.now()
  let preambleSeenAt = null

  function decodeTick() {
    analyser.getFloatFrequencyData(freqData)

    const pPreamble = powerAtFreq(analyser, freqData, preambleBin, 2)
    const p1 = powerAtFreq(analyser, freqData, bin1, 2)
    const p0 = powerAtFreq(analyser, freqData, bin0, 2)

    const now = performance.now()

    if (state === 'searchPreamble') {
      if (pPreamble > p1 + 5 && pPreamble > p0 + 5) {
        if (!preambleSeenAt) preambleSeenAt = now
        if (now - preambleSeenAt > PREAMBLE_MS) {
          onLog && onLog('Preamble locked')
          state = 'readLen'
          lastSwitch = now
          bufBits = []
        }
      } else {
        preambleSeenAt = null
      }
    } else {
      if (now - lastSwitch >= BIT_MS) {
        const bit = p1 > p0 ? 1 : 0
        bufBits.push(bit)
        lastSwitch = now

        if (state === 'readLen' && bufBits.length === 8) {
          const len = bitsToByte(bufBits)
          onLog && onLog('Payload length: ' + len)
          state = { kind: 'readPayload', need: len * 8 }
          bufBits = []
        } else if (state.kind === 'readPayload' && bufBits.length === state.need) {
          const bytes = bitsToBytes(bufBits)
          state = 'readCrc'
          bufBits = []
          decodeTick._payload = bytesToBase64(bytes)
          onLog && onLog('Payload decoded')
        } else if (state === 'readCrc' && bufBits.length === 8) {
          const crc = bitsToByte(bufBits)
          const ok = crc8(decodeTick._payload) === crc
          if (ok) onToken && onToken(decodeTick._payload)
          state = 'searchPreamble'
          bufBits = []
          preambleSeenAt = null
        }
      }
    }

    decodeTick._raf = requestAnimationFrame(decodeTick)
  }

  function stop() { cancelAnimationFrame(decodeTick._raf) }
  decodeTick()
  return { stop }
}

function bitsToByte(bits) {
  return bits.reduce((acc, b) => (acc << 1) | b, 0)
}

function bitsToBytes(bits) {
  const out = []
  for (let i = 0; i < bits.length; i += 8) out.push(bitsToByte(bits.slice(i, i + 8)))
  return out
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes))
}

function crc8(str) {
  let crc = 0x00
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i)
    for (let j = 0; j < 8; j++) crc = (crc & 0x80) ? ((crc << 1) ^ 0x07) & 0xFF : (crc << 1) & 0xFF
  }
  return crc & 0xFF
}