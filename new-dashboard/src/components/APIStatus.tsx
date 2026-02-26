/**
 * APIStatus - Real-time API health monitoring
 * Runs diagnostics on load and displays status
 */

import React, { useState, useEffect } from 'react';
import BettingAPI, { STATIC_MODE } from '../utils/api-new';

const APIStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        // Test connection
        const isConnected = await BettingAPI.testConnection();
        
        if (isConnected) {
          setStatus('ok');
        } else {
          setStatus('error');
        }
      } catch (_err) {
        setStatus('error');
      }
    };

    runDiagnostics();
  }, []);

  if (status === 'checking') {
    return null; // Don't show anything while checking
  }

  if (status === 'ok') {
    // Show different message for static mode
    const message = STATIC_MODE ? '📦 Static Mode' : '✅ API Connected';
    const color = STATIC_MODE ? '#007AFF' : '#34C759';
    
    return (
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        backgroundColor: STATIC_MODE ? 'rgba(0, 122, 255, 0.1)' : 'rgba(52, 199, 89, 0.1)',
        border: `1px solid ${color}`,
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        color: color,
        zIndex: 899,
        backdropFilter: 'blur(8px)',
      }}>
        {message}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      border: '1px solid #FF3B30',
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '12px',
      color: '#FF3B30',
      zIndex: 899,
      cursor: 'pointer',
      backdropFilter: 'blur(8px)',
    }}
    onClick={() => window.location.reload()}>
    ⚠️ API Issue - Click to retry
    </div>
  );
};

export default APIStatus;
