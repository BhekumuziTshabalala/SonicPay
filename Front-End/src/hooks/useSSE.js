import { useEffect } from 'react'

export default function useSSE(url, onMessage) {
  useEffect(() => {
    const evtSource = new EventSource(url)
    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (err) {
        console.error('SSE parse error:', err)
      }
    }
    evtSource.onerror = (err) => {
      console.error('SSE error:', err)
      evtSource.close()
    }
    return () => evtSource.close()
  }, [url, onMessage])
}
