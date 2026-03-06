/**
 * HomeView — Today's (or yesterday's) picks from active_bets_state.
 * Source-of-truth: /api/bets/today only. No fallback to old data.
 */

import React from 'react';
import { Bet } from '../utils/api-new';
import BetCard from '../components/BetCard';

interface Props {
  todaysPicks: Bet[];
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
  homeRenderCount,
  setHomeRenderCount,
  betKey,
  setSelectedBet,
}) => {
  if (todaysPicks.length === 0) return <EmptyPicksState />;

  return (
    <div style={{ padding: '0 0 10px' }}>
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
