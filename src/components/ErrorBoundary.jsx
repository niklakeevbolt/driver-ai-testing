import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            background: '#f0f2f5',
            color: '#191f1c',
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ marginBottom: 16, lineHeight: 1.5 }}>
            The prototype failed to load. Try a hard refresh, or open the browser console for details.
          </p>
          <pre
            style={{
              padding: 16,
              borderRadius: 12,
              background: '#fff',
              overflow: 'auto',
              fontSize: 13,
              whiteSpace: 'pre-wrap',
            }}
          >
            {this.state.error?.message || String(this.state.error)}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}
