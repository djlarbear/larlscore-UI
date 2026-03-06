/**
 * HistoryView — Paginated history of graded bets.
 * Renders bet cards for the current page. Pagination, sorting, and
 * filter controls live in Dashboard.tsx (secondary floating pill).
 */

import React from 'react';
import { Bet } from '../utils/api-new';
import BetCard from '../components/BetCard';

interface Props {
  bets: Bet[];
  betsLoading: boolean;
  displayedHistoryBets: Bet[];
  historyRenderCount: number;
  setHistoryRenderCount: React.Dispatch<React.SetStateAction<number>>;
  setSelectedBet: (bet: Bet | null) => void;
  betKey: (bet: Bet, idx: number) => string;
}

const HistoryView: React.FC<Props> = ({

  bets,
  betsLoading,
  displayedHistoryBets,
  historyRenderCount,
  setHistoryRenderCount,
  setSelectedBet,
  betKey,
}) => {

  return (
    <div style={{ padding: '0 0 10px' }}>

      {/* Content */}
      {betsLoading && bets.length === 0 ? (
        <div className="app-empty" style={{ color: 'var(--color-text-tertiary)' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>•</div>
          <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-secondary)', margin: '0 0 4px 0' }}>
            Loading history…
          </p>
          <p style={{ fontSize: '12px', margin: 0 }}>Fetching graded bets and pagination metadata.</p>
        </div>
      ) : bets.length === 0 ? (
        <div className="app-empty" style={{ color: 'var(--color-text-tertiary)' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>•</div>
          <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-secondary)', margin: '0 0 4px 0' }}>
            No bets found
          </p>
          <p style={{ fontSize: '12px', margin: 0 }}>
            Try clearing filters or selecting a different date range.
          </p>
        </div>
      ) : (
        <>
          {/* Bet grid */}
          <div className="bet-grid">
            {displayedHistoryBets.map((bet, idx) => (
              <div
                key={betKey(bet, idx)}
                style={{
                  animation: 'viewEnter 220ms cubic-bezier(0.2,0.9,0.4,1) both',
                  animationDelay: `${Math.min(idx * 22, 220)}ms`,
                }}
              >
                <BetCard bet={bet} onClick={() => setSelectedBet(bet)} />
              </div>
            ))}
          </div>

          {/* Load more within current page */}
          {historyRenderCount < bets.length && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
              <button
                className="app-chip"
                onClick={() => setHistoryRenderCount((c) => c + 24)}
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                }}
              >
                Load more cards ({bets.length - historyRenderCount} left)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryView;
