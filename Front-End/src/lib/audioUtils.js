export function freqToBin(freq, sampleRate, fftSize) {
  // Bin width = sampleRate / fftSize
  return Math.round(freq / (sampleRate / fftSize))
}

export function powerAtFreq(analyser, freqData, targetBin, windowBins = 1) {
  // Average a small window around the target bin for robustness
  const N = analyser.frequencyBinCount
  let sum = 0
  let count = 0
  for (let i = -windowBins; i <= windowBins; i++) {
    const b = Math.min(N - 1, Math.max(0, targetBin + i))
    sum += freqData[b]
    count++
  }
  // WebAudio gives dB (negative values). Higher is louder.
  return sum / count
}