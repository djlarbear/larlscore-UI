import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message?: string;
};

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Dashboard runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ backgroundColor: '#0d0d0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', color: '#fff' }}>
          <div style={{ maxWidth: '560px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#FF3B30', marginBottom: '12px' }}>⚠️ Dashboard crashed</h2>
            <p style={{ color: '#A0A0A0', marginBottom: '8px' }}>A runtime error occurred in the UI. Backend data may still be healthy.</p>
            <p style={{ color: '#777', fontSize: '12px', marginBottom: '16px' }}>{this.state.message || 'No error message available'}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ width: '100%', padding: '12px', backgroundColor: '#0A84FF', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
