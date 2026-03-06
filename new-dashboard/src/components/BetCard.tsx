/**
 * BetCard - Redesigned to match BonusBetCard style
 * Layout: Team @ Team (big) → Sport · Time → Pick (2 lines) → Stats → Why This Pick
 */

import React, { useMemo } from 'react';
import { Bet } from '../utils/api-new';

// Card chrome (border/shadow) is result-driven — tells you at a glance if it won or lost
// Bet type color is preserved inside the card (badge, pick label, footer)


const cleanSportName = (sport: string | undefined): string =>
  (sport ?? '').trim();

// Condensed score for card view — just "Player: 20 PTS" or short game score
const formatScoreCard = (raw: string | null): string => {
  if (!raw) return '';
  // Prop bet: "Player: Pts=20 Reb=11 Ast=7 (Pts=20 vs line 20.5)" → "Player: 20 PTS"
  const propMatch = raw.match(/^(.+?):\s*.+\((\w+)=([\d.]+)\s+vs\s+line/);
  if (propMatch) {
    const [, player, statKey, statVal] = propMatch;
    const labels: Record<string, string> = {
      Pts: 'PTS', Reb: 'REB', Ast: 'AST', PRA: 'PRA',
      PR: 'P+R', PA: 'P+A', RA: 'R+A', Stl: 'STL', Blk: 'BLK', Tov: 'TOV',
    };
    return `${player.trim()}: ${statVal} ${labels[statKey] ?? statKey.toUpperCase()}`;
  }
  // Fallback: trim long strings
  return raw.length > 44 ? raw.slice(0, 41) + '…' : raw;
};

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
    <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
      {label}
    </div>
    <div style={{ fontSize: '15px', fontWeight: '700', color, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </div>
  </div>
);

interface BetCardProps {
  bet: Bet;
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

  const scheduleText = useMemo(() => {
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
  }, [bet?.date, game_time]);

  // Returns hard RGB values so we can safely do rgba() and hex-alpha bg/border
  const getBetTypeStyle = (type: string): { color: string; bg: string; border: string } => {
    switch (type?.toUpperCase()) {
      case 'TOTAL':     return { color: '#34C759', bg: 'rgba(52,199,89,0.14)',    border: 'rgba(52,199,89,0.45)' };
      case 'SPREAD':    return { color: '#FF9500', bg: 'rgba(255,149,0,0.14)',    border: 'rgba(255,149,0,0.45)' };
      case 'PROP':      return { color: '#5AC8FA', bg: 'rgba(90,200,250,0.14)',   border: 'rgba(90,200,250,0.45)' };
      case 'MONEYLINE': return { color: '#FF3B30', bg: 'rgba(255,59,48,0.14)',    border: 'rgba(255,59,48,0.45)' };
      default:          return { color: '#0A84FF', bg: 'rgba(10,132,255,0.14)',   border: 'rgba(10,132,255,0.45)' };
    }
  };

  const getResultDisplay = (r: string | null) => {
    switch (r) {
      case 'WIN':       return { text: 'WIN',       color: 'var(--color-success)',      rgbVar: '--color-success-rgb',      bg: 'rgba(var(--color-success-rgb),0.15)' };
      case 'LOSS':      return { text: 'LOSS',      color: 'var(--color-destructive)',  rgbVar: '--color-destructive-rgb',  bg: 'rgba(var(--color-destructive-rgb),0.15)' };
      case 'PUSH':      return { text: 'PUSH',      color: 'var(--color-caution)',      rgbVar: '--color-caution-rgb',      bg: 'rgba(var(--color-caution-rgb),0.15)' };
      case 'CANCELLED': return { text: 'CANCELLED', color: 'var(--color-text-tertiary)',rgbVar: '--color-pending-rgb',      bg: 'rgba(var(--color-pending-rgb),0.15)' };
      default:          return { text: 'PENDING',   color: 'var(--color-pending)',      rgbVar: '--color-pending-rgb',      bg: 'rgba(var(--color-pending-rgb),0.15)' };
    }
  };

  const betTypeStyle = getBetTypeStyle(bet_type);
  const resultInfo   = getResultDisplay(result);
  const resultRgb = resultInfo.rgbVar;

  // Stats: only LarlScore gets grade color — everything else is neutral
  const neutralColor = 'var(--color-text-secondary)';

  // Odds display: prefer american_odds field; extract from fanduel_line if needed; else N/A
  const oddsDisplay = useMemo(() => {
    const ao = bet.american_odds ?? null;
    if (ao != null) {
      const formatted = ao > 0 ? `+${ao}` : String(ao);
      // If fanduel_line has context not already in recommendation, prefix it
      const lineExtra = fanduel_line && !recommendation.toLowerCase().includes(fanduel_line.toLowerCase().trim());
      // But if fanduel_line already has embedded odds, just use fanduel_line
      const lineHasOdds = fanduel_line && /\([+-]?\d+\)/.test(fanduel_line);
      if (lineHasOdds && lineExtra) return fanduel_line;
      return lineExtra ? `${fanduel_line} (${formatted})` : `Odds: ${formatted}`;
    }
    // Try to extract from fanduel_line
    if (fanduel_line) {
      if (/\([+-]?\d+\)/.test(fanduel_line)) return fanduel_line;
      return fanduel_line; // show even without odds
    }
    return 'Odds N/A';
  }, [bet.american_odds, fanduel_line, recommendation]);

  // LARLScore grade: S=2.0+ A=1.5-2.0 B=1.0-1.5 C=0.5-1.0 D=<0.5
  const getLarlGrade = (s: number): { grade: string; color: string } => {
    if (s >= 2.0) return { grade: 'S', color: 'var(--color-success)' };          // green
    if (s >= 1.5) return { grade: 'A', color: 'var(--color-confidence-high)' };  // sky blue
    if (s >= 1.0) return { grade: 'B', color: 'var(--color-grade-b)' };          // yellow
    if (s >= 0.5) return { grade: 'C', color: 'var(--color-caution)' };          // orange
    return           { grade: 'D', color: 'var(--color-destructive)' };          // red
  };
  const larlGrade = getLarlGrade(larlscore);
  const larlColor = larlGrade.color;

  return (
    <div
      className="app-card app-surface"
      onClick={onClick}
      style={{
        background: 'linear-gradient(155deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
        borderRadius: 18,
        padding: '16px',
        border: `1px solid rgba(var(${resultRgb}), 0.18)`,
        borderLeft: `3px solid rgba(var(${resultRgb}), 0.7)`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(-1px)';
        el.style.boxShadow = `0 8px 24px rgba(var(${resultRgb}),0.25)`;
        el.style.borderColor = `rgba(var(${resultRgb}),0.4)`;
      }}
      onMouseLeave={(e) => {
        if (!onClick) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
        el.style.borderColor = `rgba(var(${resultRgb}),0.18)`;
      }}
    >
      {/* ── Row 1: Sport chip | Bet Type chip (always) + Result chip (if graded) ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 8,
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 650,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.2px',
          flexShrink: 0,
        }}>
          {cleanSportName(sport) || 'Basketball'}
        </div>

        {/* Right side: always show bet type, optionally also show result */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {/* Bet type — always visible */}
          <div style={{
            background: betTypeStyle.bg,
            border: `1px solid ${betTypeStyle.border}`,
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: betTypeStyle.color,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
          }}>
            {bet_type}
          </div>
          {/* Result badge — only for WIN/LOSS/PUSH/CANCELLED (not for PENDING or null) */}
          {result && result !== 'PENDING' && (
            <div style={{
              background: resultInfo.bg,
              border: `1.5px solid ${resultInfo.color}`,
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
          )}
        </div>
      </div>

      {/* ── Row 2: Game + Time (centered) ── */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 750, color: 'var(--color-text-primary)', lineHeight: 1.28, marginBottom: 5, letterSpacing: '-0.01em' }}>
          {game}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
          {scheduleText}
        </div>
      </div>

      {/* ── Row 3: Pick bubble — recommendation + odds ── */}
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 10,
        padding: '10px 14px',
      }}>
        <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
          Pick
        </div>
        <div className="clamp-2" style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
          {recommendation}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
          {oddsDisplay}
        </div>
      </div>

      {/* ── Row 4: Final Score (History only) ── */}
      {showScore && (
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 10,
          padding: '8px 14px',
        }}>
          <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>Final Score</div>
          <div style={{ fontSize: 13, color: bet.actual_score ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
            {bet.actual_score ? formatScoreCard(bet.actual_score) : (result === 'PENDING' ? 'In progress' : 'Not available')}
          </div>
        </div>
      )}

      {/* ── Row 5: Stats bubbles — only LarlScore is colored ── */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Squircle label="Confidence" value={`${Math.round(confidence)}%`} color={neutralColor} />
        <Squircle label="Edge"       value={`${typeof edge === 'number' ? edge.toFixed(1) : '0.0'}`} color={neutralColor} />
        <Squircle label="LarlScore"  value={typeof larlscore === 'number' ? `${larlscore.toFixed(2)} (${larlGrade.grade})` : '— (D)'} color={larlColor} />
      </div>

      {/* Why This Pick moved to detail modal — cards stay compact */}

      {/* ── Footer CTA ── */}
      {onClick && (
        <div style={{
          paddingTop: 8,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          fontWeight: 700,
          textAlign: 'center',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}>
          <span>TAP FOR FULL DETAILS</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>why this pick, stats</span>
        </div>
      )}
    </div>
  );
};

export default BetCard;
