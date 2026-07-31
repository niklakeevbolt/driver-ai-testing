import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, componentStack: '' }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ componentStack: info?.componentStack ?? '' })
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
            The prototype failed to load. This often means your browser cached an older JavaScript bundle.
            Hard-refresh this page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows) or open it in a private window.
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
            {this.state.componentStack ? `\n${this.state.componentStack}` : ''}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}
