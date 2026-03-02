/**
 * BetDetail - Centered modal with all bet details including why this pick
 */

import React, { useEffect } from 'react';
import { Bet } from '../utils/api-new';

const SPORT_EMOJI_RE = /🏀|🏈|⚾|🏒/g;
const cleanSportName = (sport: string | undefined): string =>
  (sport ?? '').replace(SPORT_EMOJI_RE, '').trim();

// Format why_this_pick text: split by newlines, periods, or semicolons into readable lines
const formatWhyThisPick = (text: string): React.ReactNode => {
  if (!text) return null;
  
  const cleaned = String(text).replace(/Points\s+Rebounds\s+Assists/gi, 'PRA');
  
  // Try to split by common delimiters
  let lines = [];
  
  // First, try splitting by newlines
  if (cleaned.includes('\n')) {
    lines = cleaned.split('\n').filter(line => line.trim().length > 0);
  } 
  // Then try splitting by sentences (period + space + capital letter)
  else if (cleaned.match(/\.\s+[A-Z]/)) {
    lines = cleaned.split(/\.\s+/).filter(line => line.trim().length > 0)
      .map((line, idx) => idx < cleaned.split(/\.\s+/).length - 1 ? line + '.' : line);
  }
  // Try splitting by semicolons
  else if (cleaned.includes(';')) {
    lines = cleaned.split(';').filter(line => line.trim().length > 0);
  }
  // If no delimiters, wrap the whole text
  else {
    lines = [cleaned];
  }
  
  // If only one line, return as is (not a paragraph situation)
  if (lines.length === 1) {
    return <span>{lines[0]}</span>;
  }
  
  // Multiple lines: render as bullet points
  return (
    <ul style={{ margin: '0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {lines.map((line, idx) => (
        <li key={idx} style={{ color: '#E0E0E0', fontSize: '13px', lineHeight: '1.6' }}>
          {line.trim()}
        </li>
      ))}
    </ul>
  );
};

interface BetDetailProps {
  bet: Bet;
  onClose: () => void;
}

const BetDetail: React.FC<BetDetailProps> = ({ bet, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const getResultInfo = (result: string | null) => {
    switch (result) {
      case 'WIN': return { bg: 'rgba(52, 199, 89, 0.15)', color: '#34C759', text: 'WIN' };
      case 'LOSS': return { bg: 'rgba(255, 59, 48, 0.15)', color: '#FF3B30', text: 'LOSS' };
      case 'PUSH': return { bg: 'rgba(142, 142, 147, 0.15)', color: '#8E8E93', text: 'PUSH' };
      case 'CANCELLED': return { bg: 'rgba(142, 142, 147, 0.15)', color: '#8E8E93', text: 'CANCELLED' };
      case 'PENDING': return { bg: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', text: 'PENDING' };
      default: return { bg: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', text: 'PENDING' };
    }
  };

  const resultInfo = getResultInfo(bet.result);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="modal-enter app-surface"
        style={{
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          border: '1px solid #2a2a2a',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid #2a2a2a',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
            Bet Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#A0A0A0',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Game & Date */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 6px 0' }}>
              {bet.sport?.split(' ')[0] || '🏀'} {bet.game}
            </h3>
            <p style={{ fontSize: '13px', color: '#A0A0A0', margin: 0 }}>
              {cleanSportName(bet.sport)} • {bet.date}
            </p>
          </div>

          {/* Result Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: '#0d0d0d',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid #2a2a2a',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: resultInfo.bg,
              borderRadius: '10px',
              padding: '12px 16px',
              border: `2px solid ${resultInfo.color}`,
              fontSize: '14px',
              fontWeight: '700',
              color: resultInfo.color,
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              flexShrink: 0,
            }}>
              {resultInfo.text}
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 4px 0' }}>Status</p>
              <p style={{ fontSize: '18px', fontWeight: '700', color: resultInfo.color, margin: 0 }}>
                {bet.result || 'PENDING'}
              </p>
              {bet.result && bet.larlscore != null && (
                <p style={{ fontSize: '12px', color: '#8E8E93', margin: '4px 0 0 0' }}>
                  LarlScore: {bet.larlscore.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Pick */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#A0A0A0', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pick
            </p>
            <div style={{
              backgroundColor: '#0d0d0d',
              border: '1px solid #2a2a2a',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#FFFFFF',
            }}>
              {bet.recommendation}
            </div>
          </div>

          {/* Why This Pick */}
          {bet.why_this_pick && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#A0A0A0', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Why This Pick
              </p>
              <div style={{
                backgroundColor: '#0d0d0d',
                border: '1px solid #2a2a2a',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#E0E0E0',
                lineHeight: '1.6',
              }}>
                {formatWhyThisPick(String(bet.why_this_pick))}
              </div>
            </div>
          )}

          {/* Key Stats Grid */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#A0A0A0', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Key Stats
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <StatBox label="Confidence" value={bet.confidence != null ? `${Math.round(bet.confidence)}%` : '—'} color="#0A84FF" />
              <StatBox label="Edge" value={bet.edge != null ? `${bet.edge.toFixed(1)}pt` : '—'} color="#34C759" />
              <StatBox label="Bet Type" value={bet.bet_type} color="#FF9500" />
              <StatBox label="LarlScore" value={bet.larlscore != null ? bet.larlscore.toFixed(2) : '—'} color="#8E8E93" />
            </div>
          </div>

          {/* Final Score */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#A0A0A0', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Final Score
            </p>
            <div style={{
              backgroundColor: '#0d0d0d',
              border: '1px solid #2a2a2a',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#FFFFFF',
              fontFamily: 'monospace',
            }}>
              {bet.actual_score || (bet.result === 'PENDING' ? 'In progress' : 'Not available')}
            </div>
          </div>

          {/* Game Result */}
          {bet.game_result && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#A0A0A0', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Game Result
              </p>
              <div style={{
                backgroundColor: '#0d0d0d',
                border: '1px solid #2a2a2a',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#FFFFFF',
                lineHeight: '1.6',
              }}>
                {bet.game_result}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#A0A0A0', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Additional Info
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <InfoBox label="ID" value={bet.id} />
              <InfoBox label="Sport" value={cleanSportName(bet.sport) || '-'} />
              <InfoBox label="Date" value={bet.date} />
              <InfoBox label="Status" value={bet.result || 'PENDING'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{
    backgroundColor: '#0d0d0d',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
  }}>
    <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 4px 0', fontWeight: '600' }}>{label}</p>
    <p style={{ fontSize: '16px', fontWeight: '700', color, margin: 0 }}>{value}</p>
  </div>
);

const InfoBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{
    backgroundColor: '#0d0d0d',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    padding: '12px',
  }}>
    <p style={{ fontSize: '10px', color: '#A0A0A0', margin: '0 0 4px 0', fontWeight: '600' }}>{label}</p>
    <p style={{ fontSize: '12px', color: '#FFFFFF', margin: 0, wordBreak: 'break-all', fontFamily: 'monospace' }}>{value}</p>
  </div>
);

export default BetDetail;
