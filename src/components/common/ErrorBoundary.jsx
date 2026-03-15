import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '1rem',
          background: '#0d0d14', padding: '2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#e0e0f0',
                       fontSize: '2rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#888', maxWidth: 400, lineHeight: 1.6 }}>
            An unexpected error occurred. Please refresh the page or go back to the dashboard.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.3)',
                borderRadius: 8, padding: '0.6rem 1.25rem', color: '#c8a96e',
                cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              ↺ Refresh
            </button>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/dashboard'; }}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '0.6rem 1.25rem', color: '#a0a0b0',
                cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              ← Dashboard
            </button>
          </div>
          {import.meta.env.DEV && (
            <pre style={{ marginTop: '1rem', fontSize: '0.72rem', color: '#666',
                          maxWidth: 600, textAlign: 'left', whiteSpace: 'pre-wrap',
                          background: 'rgba(255,0,0,0.05)', padding: '1rem',
                          borderRadius: 8, border: '1px solid rgba(255,0,0,0.1)' }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}