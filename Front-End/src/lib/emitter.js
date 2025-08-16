export function createEmitter({ token, audioCtx, onLog, onComplete }) {
  const PREAMBLE_FREQ = 18500
  const FREQ_1 = 19000
  const FREQ_0 = 20000
  const PREAMBLE_MS = 200
  const BIT_MS = 80

  let oscillator = null
  let gain = null
  let stopFlag = false

  const tokenBits = tokenToBits(token)

  function tokenToBits(str) {
    const bytes = Array.from(str).map(c => c.charCodeAt(0))
    const bits = []
    bytes.forEach(b => {
      for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1)
    })
    return bits
  }

  async function emit() {
    gain = audioCtx.createGain()
    gain.gain.value = 0.1
    gain.connect(audioCtx.destination)
    oscillator = audioCtx.createOscillator()
    oscillator.type = 'sine'
    oscillator.connect(gain)

    // Emit preamble
    oscillator.frequency.value = PREAMBLE_FREQ
    oscillator.start()
    await sleep(PREAMBLE_MS)
    for (let bit of tokenBits) {
      if (stopFlag) break
      oscillator.frequency.value = bit ? FREQ_1 : FREQ_0
      await sleep(BIT_MS)
    }
    oscillator.stop()
    oscillator.disconnect()
    gain.disconnect()
    onComplete && onComplete()
  }

  emit()

  function stop() { stopFlag = true }

  return { stop }
}

function sleep(ms) { return new Promise(res => setTimeout(res, ms)) }
