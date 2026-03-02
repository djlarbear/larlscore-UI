/**
 * BetCard - Redesigned to match BonusBetCard style
 * Layout: Team @ Team (big) → Sport · Time → Pick (2 lines) → Stats → Why This Pick
 */

import React from 'react';
import { Bet } from '../utils/api-new';
import { buildWhyBullets } from '../utils/whyBullets';

// Card chrome (border/shadow) is result-driven — tells you at a glance if it won or lost
// Bet type color is preserved inside the card (badge, pick label, footer)
const RESULT_COLOR_RGB: Record<string, string> = {
  '#34C759': '52, 199, 89',   // WIN   — green
  '#FF3B30': '255, 59, 48',   // LOSS  — red
  '#FF9500': '255, 149, 0',   // PENDING — orange
  '#8E8E93': '142, 142, 147', // UNKNOWN / CANCELLED — grey
};

const SPORT_EMOJI_RE = /🏀|🏈|⚾|🏒/g;
const cleanSportName = (sport: string | undefined): string =>
  (sport ?? '').replace(SPORT_EMOJI_RE, '').trim();

const Squircle: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '10px',
    padding: '8px 6px',
    flex: 1,
  }}>
    <div style={{ fontSize: '10px', color: '#8e8e93', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
      {label}
    </div>
    <div style={{ fontSize: '15px', fontWeight: '700', color }}>
      {value}
    </div>
  </div>
);

interface BetCardProps {
  bet: Bet | any;
  onClick?: () => void;
  showScore?: boolean;
}

const BetCard: React.FC<BetCardProps> = ({ bet, onClick, showScore = true }) => {
  // All fields now pass through transformPick in Dashboard.tsx — read directly
  const game           = bet.game           || 'N/A';
  const recommendation = bet.recommendation || 'N/A';
  const confidence     = bet.confidence     ?? 0;
  const edge           = bet.edge           ?? 0;
  const larlscore      = bet.larlscore      ?? 0;
  const bet_type       = bet.bet_type       || 'UNKNOWN';
  const result         = bet.result         || null;
  const sport          = bet.sport          || 'Basketball';
  const game_time      = bet.game_time      || '';
  const fanduel_line   = bet.fanduel_line   || '';
  const why_this_pick  = bet.why_this_pick  || '';

  const scheduleText = (() => {
    const displayDate = (() => {
      if (!bet?.date) return '';
      try {
        const d = new Date(`${bet.date}T12:00:00`);
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'America/Detroit'
        });
      } catch {
        return bet.date;
      }
    })();

    if (game_time && game_time.trim()) {
      const cleanTime = String(game_time)
        .replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+/i, '')
        .replace(/\s*EST$/i, '')
        .trim();
      return displayDate ? `${displayDate} · ${cleanTime} EST` : `${cleanTime} EST`;
    }

    if (displayDate) return `${displayDate} · Time TBD EST`;
    return 'Time TBD EST';
  })();

  const getBetTypeColor = (type: string): string => {
    switch (type?.toUpperCase()) {
      case 'TOTAL':     return '#8B5CF6';
      case 'SPREAD':    return '#06B6D4';
      case 'MONEYLINE': return '#F59E0B';
      default:          return '#0A84FF';
    }
  };

  const getResultDisplay = (r: string | null) => {
    switch (r) {
      case 'WIN':       return { text: 'WIN',       color: '#34C759', bg: 'rgba(52,199,89,0.15)' };
      case 'LOSS':      return { text: 'LOSS',      color: '#FF3B30', bg: 'rgba(255,59,48,0.15)' };
      case 'PUSH':      return { text: 'PUSH',      color: '#8E8E93', bg: 'rgba(142,142,147,0.15)' };
      case 'CANCELLED': return { text: 'CANCELLED', color: '#8E8E93', bg: 'rgba(142,142,147,0.15)' };
      default:          return { text: 'PENDING',   color: '#FF9500', bg: 'rgba(255,149,0,0.15)' };
    }
  };

  const betTypeColor = getBetTypeColor(bet_type);
  const resultInfo   = getResultDisplay(result);

  // Card chrome color: result-driven (green=WIN, red=LOSS, orange=PENDING, grey=other)
  const resultColor = resultInfo.color;

  const edgeColor   = edge >= 20 ? '#30d158' : edge >= 10 ? '#a3e635' : '#ffd60a';
  const confColor   = confidence >= 75 ? '#30d158' : confidence >= 65 ? '#a3e635' : '#ffd60a';
  const larlColor   = larlscore >= 50 ? '#30d158' : larlscore >= 20 ? '#a3e635' : '#ffd60a';

  return (
    <div
      className="app-card app-surface"
      onClick={onClick}
      style={{
        background: 'linear-gradient(155deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
        borderRadius: 18,
        padding: '16px',
        border: `1px solid ${resultColor}2e`,
        borderLeft: `2px solid ${resultColor}AA`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        const el = e.currentTarget as HTMLDivElement;
        const rgb = RESULT_COLOR_RGB[resultColor] || '255, 149, 0';
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = `0 8px 24px rgba(${rgb},0.25)`;
        el.style.borderColor = `${resultColor}55`;
      }}
      onMouseLeave={(e) => {
        if (!onClick) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
        el.style.borderColor = `${resultColor}26`;
      }}
    >
      {/* ── Row 1: Sport chip + status/bet-type chip ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 8,
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 650,
          color: '#A0A0A0',
          letterSpacing: '0.2px',
        }}>
          {cleanSportName(sport) || 'Basketball'}
        </div>

        {result ? (
          <div style={{
            background: resultInfo.bg,
            border: `2px solid ${resultInfo.color}`,
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: resultInfo.color,
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}>
            {resultInfo.text}
          </div>
        ) : (
          <div style={{
            background: `${betTypeColor}22`,
            border: `1px solid ${betTypeColor}55`,
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: betTypeColor,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
          }}>
            {bet_type}
          </div>
        )}
      </div>

      {/* ── Row 2: Game + Time (centered) ── */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 750, color: '#fff', lineHeight: 1.28, marginBottom: 5, letterSpacing: '-0.01em' }}>
          {game}
        </div>
        <div style={{ fontSize: 12, color: '#8e8e93' }}>
          {scheduleText}
        </div>
      </div>

      {/* ── Row 3: Pick bubble (2-line) ── */}
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 10,
        padding: '10px 14px',
      }}>
        <div style={{ fontSize: 10, color: betTypeColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
          Pick
        </div>
        <div className="clamp-2" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: fanduel_line ? 6 : 0 }}>
          {recommendation}
        </div>
        {fanduel_line && (
          <div style={{ fontSize: 12, color: '#8e8e93' }}>
            {fanduel_line}
          </div>
        )}
      </div>

      {/* ── Row 4: Final Score (History only) ── */}
      {showScore && (
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 10,
          padding: '8px 14px',
        }}>
          <div style={{ fontSize: 10, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>Final Score</div>
          <div style={{ fontSize: 13, color: bet.actual_score ? '#fff' : '#8e8e93', fontWeight: 600, fontFamily: 'monospace' }}>
            {bet.actual_score || (result === 'PENDING' ? 'In progress' : 'Not available')}
          </div>
        </div>
      )}

      {/* ── Row 5: Stats bubbles ── */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Squircle label="Confidence" value={`${Math.round(confidence)}%`} color={confColor} />
        <Squircle label="Edge"       value={`${typeof edge === 'number' ? edge.toFixed(1) : '0.0'}`} color={edgeColor} />
        <Squircle label="LarlScore"  value={typeof larlscore === 'number' ? larlscore.toFixed(1) : '0.0'} color={larlColor} />
      </div>

      {/* ── Row 6: Why This Pick ── */}
      {why_this_pick && (() => {
        const bullets = buildWhyBullets(why_this_pick);
        if (!bullets.length) return null;
        return (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            padding: '10px 14px',
            borderLeft: '2px solid #333',
          }}>
            <div style={{ fontSize: 10, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 6 }}>Why This Pick</div>
            <div className="clamp-3" style={{ fontSize: 12, color: '#ccc', lineHeight: 1.6 }}>
              {bullets.slice(0, 3).map((line, idx) => (
                <div key={idx} style={{ marginBottom: 4 }}>• {line}</div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Footer CTA ── */}
      {onClick && (
        <div style={{
          paddingTop: 8,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: 11,
          color: betTypeColor,
          fontWeight: 700,
          textAlign: 'center',
          letterSpacing: '0.5px',
        }}>
          TAP FOR DETAILS →
        </div>
      )}
    </div>
  );
};

export default BetCard;
