export function freqToBin(freq, sampleRate, fftSize) {
  return Math.round(freq / (sampleRate / fftSize))
}

export function powerAtFreq(analyser, freqData, targetBin, windowBins = 1) {
  const N = analyser.frequencyBinCount
  let sum = 0
  let count = 0
  for (let i = -windowBins; i <= windowBins; i++) {
    const b = Math.min(N - 1, Math.max(0, targetBin + i))
    sum += freqData[b]
    count++
  }
  return sum / count
}