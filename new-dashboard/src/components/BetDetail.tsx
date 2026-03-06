/**
 * BetDetail - Centered modal with all bet details including why this pick
 */

import React, { useEffect } from 'react';
import { Bet } from '../utils/api-new';

const cleanSportName = (sport: string | undefined): string =>
  (sport ?? '').trim();

// Shorten verbose actual_score prop bet formats
// "Jaylen Brown: Pts=20 Reb=11 Ast=7 (Pts=20 vs line 20.5)" → "Jaylen Brown: 20 pts (line 20.5)"
const formatActualScore = (raw: string | null): string => {
  if (!raw) return '';
  // Try to detect prop bet format: "Player Name: Stat=X ... (Stat=Y vs line Z)"
  const propMatch = raw.match(/^(.+?):\s*.+\((\w+)=([\d.]+)\s+vs\s+line\s+([\d.]+)\)/);
  if (propMatch) {
    const [, player, statKey, statVal, line] = propMatch;
    const statLabel: Record<string, string> = {
      Pts: 'pts', Reb: 'reb', Ast: 'ast', PRA: 'PRA',
      PR: 'P+R', PA: 'P+A', RA: 'R+A', Stl: 'stl', Blk: 'blk', Tov: 'tov',
    };
    const label = statLabel[statKey] || statKey.toLowerCase();
    return `${player.trim()}: ${statVal} ${label} (line ${line})`;
  }
  // Fallback: truncate at 60 chars
  return raw.length > 60 ? raw.slice(0, 57) + '…' : raw;
};

// Format why_this_pick text: split by newlines, periods, or semicolons into readable lines
const formatWhyThisPick = (text: string): React.ReactNode => {
  if (!text) return null;
  
  let cleaned = String(text)
    .replace(/Points\s+Rebounds\s+Assists/gi, 'PRA');
  
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
  
  // Filter out empty lines
  lines = lines.filter(line => line.trim().length > 0);
  
  // If only one line, return as is (not a paragraph situation)
  if (lines.length === 1) {
    return <span>{lines[0]}</span>;
  }
  
  // Multiple lines: render as bullet points
  return (
    <ul style={{ margin: '0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {lines.map((line, idx) => (
        <li key={idx} style={{ color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
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
      case 'WIN': return { bg: 'rgba(var(--color-success-rgb), 0.15)', color: 'var(--color-success)', text: 'WIN' };
      case 'LOSS': return { bg: 'rgba(var(--color-destructive-rgb), 0.15)', color: 'var(--color-destructive)', text: 'LOSS' };
      case 'PUSH': return { bg: 'rgba(var(--color-caution-rgb), 0.15)', color: 'var(--color-caution)', text: 'PUSH' };
      case 'CANCELLED': return { bg: 'rgba(var(--color-pending-rgb), 0.15)', color: 'var(--color-text-tertiary)', text: 'CANCELLED' };
      case 'PENDING': return { bg: 'rgba(var(--color-pending-rgb), 0.15)', color: 'var(--color-pending)', text: 'PENDING' };
      default: return { bg: 'rgba(var(--color-pending-rgb), 0.15)', color: 'var(--color-pending)', text: 'PENDING' };
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
          backgroundColor: 'var(--color-surface)',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
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
          borderBottom: '1px solid var(--color-border)',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
            Bet Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: 'var(--color-text-tertiary)',
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
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-primary)', margin: '0 0 6px 0' }}>
              {bet.game}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', margin: 0 }}>
              {cleanSportName(bet.sport)} • {bet.date}
            </p>
          </div>

          {/* Result Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: 'var(--color-background)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid var(--color-border)',
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
              <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: '0 0 4px 0' }}>Status</p>
              <p style={{ fontSize: '18px', fontWeight: '700', color: resultInfo.color, margin: 0, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                {bet.result || 'PENDING'}
              </p>
              {bet.result && bet.larlscore != null && (
                <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: '4px 0 0 0', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                  LarlScore: {bet.larlscore.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Pick */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-tertiary)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pick
            </p>
            <div style={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}>
              {bet.recommendation}
            </div>
          </div>

          {/* Why This Pick */}
          {bet.why_this_pick && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-tertiary)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Why This Pick
              </p>
              <div style={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.6',
              }}>
                {formatWhyThisPick(bet.why_this_pick || '')}
              </div>
            </div>
          )}

          {/* Key Stats Grid */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-tertiary)', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Key Stats
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <StatBox label="Confidence" value={bet.confidence != null ? `${Math.round(bet.confidence)}%` : '—'}
                color={bet.confidence >= 75 ? 'var(--color-confidence-high)' : bet.confidence >= 65 ? 'var(--color-caution)' : 'var(--color-pending)'} />
              <StatBox label="Edge" value={bet.edge != null ? `${bet.edge.toFixed(1)}pt` : '—'}
                color={bet.edge >= 20 ? 'var(--color-success)' : bet.edge >= 10 ? 'var(--color-caution)' : 'var(--color-pending)'} />
              <StatBox label="Bet Type" value={bet.bet_type}
                color={bet.bet_type === 'TOTAL' ? 'var(--color-total)' : bet.bet_type === 'SPREAD' ? 'var(--color-spread)' : bet.bet_type === 'MONEYLINE' ? 'var(--color-moneyline)' : 'var(--color-primary)'} />
              <StatBox label="LarlScore" value={bet.larlscore != null ? bet.larlscore.toFixed(2) : '—'}
                color={bet.larlscore >= 2.0 ? 'var(--color-success)' : bet.larlscore >= 1.5 ? 'var(--color-confidence-high)' : bet.larlscore >= 1.0 ? 'var(--color-grade-b)' : bet.larlscore >= 0.5 ? 'var(--color-caution)' : 'var(--color-destructive)'} />
            </div>
          </div>

          {/* Final Score */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-tertiary)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Final Score
            </p>
            <div style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.01em',
            }}>
              {bet.actual_score
                ? formatActualScore(bet.actual_score)
                : (bet.result === 'PENDING' ? 'In progress' : 'Not available')}
            </div>
          </div>

          {/* Game Result */}
          {bet.game_result && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-tertiary)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Game Result
              </p>
              <div style={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--color-text-primary)',
                lineHeight: '1.6',
              }}>
                {bet.game_result}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-tertiary)', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
  }}>
    <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: '0 0 4px 0', fontWeight: '600' }}>{label}</p>
    <p style={{ fontSize: '16px', fontWeight: '700', color, margin: 0, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
  </div>
);

const InfoBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '12px',
  }}>
    <p style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', margin: '0 0 4px 0', fontWeight: '600' }}>{label}</p>
    <p style={{ fontSize: '12px', color: 'var(--color-text-primary)', margin: 0, wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>{value}</p>
  </div>
);

export default BetDetail;
