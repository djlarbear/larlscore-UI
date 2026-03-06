/**
 * HistoryView — Paginated history of all graded bets.
 * Sticky header with title, filter chips, and sort indicator.
 * Filter panel (overlay) is rendered in Dashboard.tsx above the nav bar.
 */

import React from 'react';
import { Bet, DateStat } from '../utils/api-new';
import BetCard from '../components/BetCard';

interface PaginationButtonProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
}

const PaginationButton: React.FC<PaginationButtonProps> = ({ label, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="app-chip ctl"
    style={{
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: '600',
      color: disabled ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
      border: disabled
        ? '1px solid rgba(255,255,255,0.06)'
        : '1px solid rgba(255,255,255,0.18)',
      background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 120ms ease',
    }}
  >
    {label}
  </button>
);

interface Props {
  bets: Bet[];
  betsLoading: boolean;
  displayedHistoryBets: Bet[];
  historyRenderCount: number;
  setHistoryRenderCount: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  sort: string;
  filters: { date?: string; sport?: string; bet_type?: string };
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  setSelectedBet: (bet: Bet | null) => void;
  betKey: (bet: Bet, idx: number) => string;
  // unused in render but passed through for completeness
  dates: DateStat[];
  sports: string[];
  betTypes: string[];
}

const HistoryView: React.FC<Props> = ({
  bets,
  betsLoading,
  displayedHistoryBets,
  historyRenderCount,
  setHistoryRenderCount,
  totalPages,
  currentPage,
  setCurrentPage,
  sort,
  filters,
  showMenu,
  setShowMenu,
  isMobile,
  setSelectedBet,
  betKey,
}) => {
  const activeFilterCount = [filters.date, filters.sport, filters.bet_type].filter(Boolean).length;

  return (
    <div
      className="app-surface"
      style={{
        borderRadius: 16,
        padding: '14px',
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'linear-gradient(145deg, rgba(26,26,26,0.96), rgba(22,22,22,0.92))',
      }}
    >
      {/* Sticky header */}
      <div
        className="app-surface"
        style={{
          position: 'sticky',
          top: isMobile ? 76 : 86,
          zIndex: 20,
          marginBottom: 12,
          borderRadius: 16,
          padding: '12px',
          border: '1px solid rgba(255,255,255,0.14)',
          background: 'linear-gradient(145deg, rgba(26,26,26,0.96), rgba(22,22,22,0.92))',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginBottom: 10,
            minHeight: 40,
          }}
        >
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              History
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              All results here
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              paddingTop: 2,
            }}
          >
            <span
              className="app-chip ctl"
              style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-text-tertiary)' }}
            >
              Sort: {sort}
            </span>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="ctl"
              style={{
                background: showMenu
                  ? 'linear-gradient(145deg, rgba(10,132,255,0.95), rgba(10,132,255,0.78))'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
                border: showMenu
                  ? '1px solid rgba(10,132,255,0.85)'
                  : '1px solid rgba(255,255,255,0.12)',
                color: showMenu ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {(filters.date || filters.sport || filters.bet_type) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            {filters.date && (
              <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-primary)' }}>
                Date: {filters.date}
              </span>
            )}
            {filters.sport && (
              <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-primary)' }}>
                {filters.sport}
              </span>
            )}
            {filters.bet_type && (
              <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-primary)' }}>
                {filters.bet_type}
              </span>
            )}
          </div>
        )}
      </div>

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

          {/* Page pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginTop: '32px',
              }}
            >
              <PaginationButton
                label="← Previous"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '14px',
                  fontWeight: '500',
                  minWidth: '120px',
                  justifyContent: 'center',
                }}
              >
                Page {currentPage} of {totalPages}
              </div>
              <PaginationButton
                label="Next →"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryView;
