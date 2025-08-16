import { useEffect, useRef } from 'react'

export default function useSSE(url, onMessage) {
  const evtRef = useRef(null)

  useEffect(() => {
    if (!url) return () => {}
    if (typeof onMessage !== 'function') onMessage = () => {}

    let evtSource
    try {
      evtSource = new EventSource(url)
      evtRef.current = evtSource
    } catch (err) {
      console.error('SSE initialization failed:', err)
      return () => {}
    }

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        try { onMessage(data) } catch (ex) { console.error('SSE onMessage handler error:', ex) }
      } catch (err) {
        console.error('SSE parse error:', err)
      }
    }
    evtSource.onerror = (err) => {
      console.error('SSE error:', err)
      try { evtSource.close() } catch (e) {}
    }
    return () => {
      try { evtSource && evtSource.close() } catch (e) {}
    }
  }, [url, onMessage])
}
