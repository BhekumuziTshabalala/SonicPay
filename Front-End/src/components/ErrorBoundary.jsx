import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    try { console.error('Uncaught error in component tree:', error, info) } catch (e) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ maxWidth: 720 }} className="glass">
            <h2>Something went wrong</h2>
            <p className="text-muted">An unexpected error occurred. Try reloading the page.</p>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {String(this.state.error)}
            </details>
            <div style={{ marginTop: '1rem' }}>
              <button className="btn" onClick={() => window.location.reload()}>Reload</button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
