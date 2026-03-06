/**
 * HomeView — Today's (or yesterday's) picks from active_bets_state.
 * Source-of-truth: /api/bets/today only. No fallback to old data.
 */

import React from 'react';
import { Bet } from '../utils/api-new';
import BetCard from '../components/BetCard';

interface Props {
  todaysPicks: Bet[];
  todaysPicksDate: string;
  isMobile: boolean;
  homeRenderCount: number;
  setHomeRenderCount: React.Dispatch<React.SetStateAction<number>>;
  betKey: (bet: Bet, idx: number) => string;
  setSelectedBet: (bet: Bet | null) => void;
}

const EmptyPicksState: React.FC = () => (
  <div className="app-empty" style={{ color: 'var(--color-text-tertiary)' }}>
    <div style={{ fontSize: '28px', marginBottom: '8px' }}>•</div>
    <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-secondary)', margin: '0 0 4px 0' }}>
      No picks yet
    </p>
    <p style={{ fontSize: '12px', margin: 0 }}>
      New picks generate at 7:00 AM EST. Check History for past results.
    </p>
  </div>
);

const HomeView: React.FC<Props> = ({
  todaysPicks,
  todaysPicksDate,
  isMobile,
  homeRenderCount,
  setHomeRenderCount,
  betKey,
  setSelectedBet,
}) => {
  if (todaysPicks.length === 0) return <EmptyPicksState />;

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = !todaysPicksDate || todaysPicksDate === todayStr;

  const title = isToday
    ? "Today's Picks"
    : (() => {
        const d = new Date(todaysPicksDate + 'T12:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' Picks';
      })();

  const subtitle = isToday
    ? 'Top plays across all bet types'
    : `${todaysPicksDate} · New picks generate at 7:00 AM EST`;

  return (
    <div
      className="app-surface"
      style={{
        borderRadius: 16,
        padding: '14px',
        border: '1px solid rgba(142,197,255,0.24)',
        background: 'linear-gradient(145deg, rgba(26,26,26,0.96), rgba(20,24,30,0.92))',
      }}
    >
      {/* Section header */}
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 12,
          padding: '10px 12px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'center' : 'space-between',
          textAlign: isMobile ? 'center' : 'left',
          gap: 10,
          flexWrap: 'wrap',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {subtitle}
          </div>
        </div>
        <span
          className="app-chip"
          style={{
            padding: '6px 10px',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          {todaysPicks.length} picks
        </span>
      </div>

      {/* Bet cards */}
      <div className="bet-grid" style={{ marginBottom: 10 }}>
        {todaysPicks.slice(0, homeRenderCount).map((bet, idx) => (
          <BetCard
            key={`today-${betKey(bet, idx)}`}
            bet={bet}
            onClick={() => setSelectedBet(bet)}
            showScore={false}
          />
        ))}
      </div>

      {/* Load more */}
      {homeRenderCount < todaysPicks.length && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
          <button
            className="app-chip"
            onClick={() => setHomeRenderCount((c) => c + 12)}
            style={{
              padding: '8px 14px',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
            }}
          >
            Load more picks ({todaysPicks.length - homeRenderCount} left)
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeView;
