/**
 * Dashboard — thin shell. All state lives in useDashboardState.
 * Views: HomeView, HistoryView, InsightsView, SpecialsView.
 */

import React from 'react';

import FilterBar from './FilterBar';
import BetDetail from './BetDetail';
import InsightsView from './InsightsView';
import SpecialsView from './SpecialsView';
import { HomeIcon, HistoryIcon, InsightsIcon, SpecialsIcon } from './NavIcons';
import LarlScoreLogo from './LarlScoreLogo';
import { useDashboardState } from '../hooks/useDashboardState';
import HomeView from '../views/HomeView';
import HistoryView from '../views/HistoryView';

// ─── Small UI helpers (local — no reason to split these out) ──────────────────

const SummaryBubble: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div className="app-card app-surface" style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '10px 8px', borderRadius: '10px', gap: '4px', minWidth: 0,
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)',
  }}>
    <span style={{ fontSize: 'clamp(18px, 3.5vw, 26px)', fontWeight: '800', color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</span>
    <span style={{ fontSize: 'clamp(9px, 1.8vw, 11px)', color: 'var(--color-text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>{label}</span>
  </div>
);

const ViewButton: React.FC<{ label: string; icon: React.ReactNode; active: boolean; onClick: () => void; className?: string }> = ({ label, icon, active, onClick, className }) => (
  <button
    onClick={onClick}
    className={className}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '3px', padding: '8px 14px', borderRadius: '12px', cursor: 'pointer',
      background: active ? 'linear-gradient(145deg, rgba(10,132,255,0.95), rgba(10,132,255,0.78))' : 'transparent',
      border: active ? '1px solid rgba(10,132,255,0.85)' : '1px solid rgba(255,255,255,0.12)',
      color: active ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
      fontSize: '10px', fontWeight: '600', letterSpacing: '0.3px', minWidth: '52px',
      transition: 'all 150ms ease',
    }}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// ─── Dashboard shell ───────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const ds = useDashboardState();

  // Error boundary fallback
  if (ds.error && !ds.bets.length && !ds.todaysPicks.length) {
    return (
      <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="app-surface" style={{ maxWidth: '520px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-destructive)', marginBottom: '10px' }}>Connection Error</h2>
          <p style={{ color: 'var(--color-text-tertiary)', marginBottom: '10px', lineHeight: '1.6' }}>Unable to connect to the betting API.</p>
          <p style={{ color: 'var(--color-text-tertiary)', marginBottom: '16px', fontSize: '12px' }}>
            Last successful update: {ds.formatAge(ds.mergedUpdated)} · Expected cron refresh around 4:00–5:15 AM EST.
          </p>
          <button onClick={() => { ds.setError(null); window.location.reload(); }} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-primary)', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', color: 'var(--color-text-primary)', position: 'relative' }}>

      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.55 }}>
        <div style={{ position: 'absolute', top: -120, left: '8%', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,132,255,0.22) 0%, rgba(10,132,255,0) 70%)' }} />
        <div style={{ position: 'absolute', bottom: -140, right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,199,89,0.16) 0%, rgba(52,199,89,0) 70%)' }} />
      </div>

      {/* Floating top identity card */}
      <div style={{
        position: 'fixed',
        top: ds.isMobile ? '8px' : '14px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: ds.isMobile ? 'calc(100% - 14px)' : 'min(1100px, calc(100% - 24px))',
        zIndex: 950,
      }}>
        <div className="app-surface" style={{
          backgroundColor: 'rgba(26, 26, 26, 0.96)',
          backdropFilter: 'blur(20px)',
          borderRadius: ds.isMobile ? '12px' : '16px',
          border: `1.5px solid ${ds.overdue24h ? 'rgba(var(--color-destructive-rgb), 0.55)' : 'rgba(var(--color-primary-rgb), 0.35)'}`,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
          padding: ds.isMobile ? '8px 10px' : '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: ds.isMobile ? '6px' : '8px',
          alignItems: 'center',
        }}>
          <LarlScoreLogo size={ds.isMobile ? 'medium' : 'large'} />
          {ds.overdue24h && (
            <div style={{
              padding: '8px 12px', borderRadius: '8px',
              backgroundColor: 'rgba(255,59,48,0.14)', border: '1px solid rgba(255,59,48,0.55)',
              color: 'var(--color-destructive)', fontSize: '12px', fontWeight: 600,
            }}>
              Update overdue (24h+)
            </div>
          )}
        </div>
      </div>

      {/* Summary header */}
      <div style={{
        position: 'relative', zIndex: 1,
        backgroundColor: 'var(--color-background)',
        paddingTop: ds.isMobile ? '132px' : '126px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ padding: '0 clamp(16px, 3vw, 80px)' }}>
          {ds.summary && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className="app-surface" style={{ flex: '1 1 300px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>Record</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <SummaryBubble label="Total Bets" value={ds.summary.total_bets}              color="var(--color-primary)" />
                  <SummaryBubble label="Wins"       value={ds.summary.wins}                   color="var(--color-success)" />
                  <SummaryBubble label="Losses"     value={ds.summary.losses}                 color="var(--color-destructive)" />
                  <SummaryBubble label="Win Rate"   value={`${ds.winRate}%`}                  color="var(--color-caution)" />
                </div>
              </div>
              <div className="app-surface" style={{ flex: '1 1 300px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>Bet Types</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <SummaryBubble label="SPREAD"    value={ds.summary.spread_count    || 0} color="var(--color-spread)" />
                  <SummaryBubble label="TOTAL"     value={ds.summary.total_count     || 0} color="var(--color-total)" />
                  <SummaryBubble label="MONEYLINE" value={ds.summary.moneyline_count || 0} color="var(--color-moneyline)" />
                  <SummaryBubble label="PROP"      value={ds.summary.prop_count      || 0} color="var(--color-primary)" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating bottom nav */}
      <div className="nav-floating" style={{
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', zIndex: 900,
      }}>
        <div className="nav-backdrop" style={{
          position: 'absolute', inset: '-10px -14px',
          backgroundColor: 'rgba(26, 26, 26, 0.97)', backdropFilter: 'blur(24px)',
          borderRadius: '20px', border: '1.5px solid rgba(10, 132, 255, 0.35)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
          zIndex: -1,
        }} />

        <div style={{ display: 'flex', gap: '8px', position: 'relative', zIndex: 1 }}>
          <ViewButton className="nav-btn" label="Home"     icon={<HomeIcon size={18} />}     active={ds.view === 'home'}     onClick={() => { ds.setView('home');     ds.setShowMenu(false); }} />
          <ViewButton className="nav-btn" label="Specials" icon={<SpecialsIcon size={18} />} active={ds.view === 'specials'} onClick={() => { ds.setView('specials'); ds.setShowMenu(false); }} />
          <ViewButton className="nav-btn" label="Insights" icon={<InsightsIcon size={18} />} active={ds.view === 'insights'} onClick={() => { ds.setView('insights'); ds.setShowMenu(false); }} />
          <ViewButton className="nav-btn" label="History"  icon={<HistoryIcon size={18} />}  active={ds.view === 'history'}  onClick={() => { ds.setView('history');  ds.setShowMenu(false); }} />
        </div>

        {/* Filter overlay — rendered here so it floats above the nav */}
        {ds.showMenu && ds.view === 'history' && (
          <>
            <div onClick={() => ds.setShowMenu(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 899 }} />
            <div className="nav-filter-panel app-surface" style={{
              position: 'fixed', bottom: '116px', left: '50%', transform: 'translateX(-50%)',
              backgroundColor: 'rgba(26, 26, 26, 0.9)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(42, 42, 42, 0.5)', borderRadius: '16px', padding: '24px',
              width: '90%', maxWidth: '420px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
              zIndex: 1000, maxHeight: '65vh', overflowY: 'auto',
            }}>
              <FilterBar
                onFilterChange={ds.handleFilterChange}
                dates={ds.dates}
                sports={ds.sports}
                betTypes={ds.betTypes}
                currentSort={ds.sort}
                currentDate={ds.filters.date || ''}
                currentSport={ds.filters.sport || ''}
                currentBetType={ds.filters.bet_type || ''}
              />
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Bets Per Page
                </label>
                <select
                  value={ds.pageSize}
                  onChange={(e) => { ds.setPageSize(Number(e.target.value)); ds.setCurrentPage(1); }}
                  style={{ width: '100%', padding: '8px 12px', backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                >
                  <option value={10}>10 bets</option>
                  <option value={20}>20 bets</option>
                  <option value={40}>40 bets</option>
                  <option value={80}>80 bets</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main content */}
      <div className="view-enter" style={{
        position: 'relative', zIndex: 1,
        padding: '24px clamp(16px, 3vw, 80px) 100px',
        opacity: ds.viewAnim,
        transform: `translateY(${ds.viewAnim ? 0 : 4}px)`,
        transition: 'opacity 180ms ease, transform 180ms ease',
      }}>
        {ds.loading ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px,1fr))', gap: '10px', marginBottom: '18px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={`s-${i}`} className="skeleton-shimmer" style={{ height: '78px', borderRadius: '12px', border: '1px solid var(--color-border)' }} />
              ))}
            </div>
            <div className="bet-grid" style={{ marginBottom: '40px' }}>
              {[...Array(6)].map((_, i) => (
                <div key={`sk-${i}`} className="skeleton-shimmer" style={{ height: '180px', borderRadius: '14px', border: '1px solid var(--color-border)' }} />
              ))}
            </div>
          </div>
        ) : ds.view === 'insights' ? (
          <div className="app-surface" style={{ borderRadius: 16, padding: '14px', border: '1px solid rgba(255,255,255,0.14)', background: 'linear-gradient(145deg, rgba(26,26,26,0.96), rgba(22,22,22,0.92))' }}>
            <div style={{ border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, padding: '10px 12px', marginBottom: 12, background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Insights</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>Model learning, trends, and diagnostics</div>
            </div>
            <InsightsView key="insights" />
          </div>
        ) : ds.view === 'specials' ? (
          <div className="app-surface" style={{ borderRadius: 16, padding: '14px', border: '1px solid rgba(168,85,247,0.24)', background: 'linear-gradient(145deg, rgba(26,26,26,0.96), rgba(22,22,22,0.92))' }}>
            <SpecialsView specials={ds.specialsData as Parameters<typeof SpecialsView>[0]['specials']} />
          </div>
        ) : ds.view === 'home' ? (
          <HomeView
            todaysPicks={ds.todaysPicks}
            todaysPicksDate={ds.todaysPicksDate}
            isMobile={ds.isMobile}
            homeRenderCount={ds.homeRenderCount}
            setHomeRenderCount={ds.setHomeRenderCount}
            betKey={ds.betKey}
            setSelectedBet={ds.setSelectedBet}
          />
        ) : (
          <HistoryView
            bets={ds.bets}
            betsLoading={ds.betsLoading}
            displayedHistoryBets={ds.displayedHistoryBets}
            historyRenderCount={ds.historyRenderCount}
            setHistoryRenderCount={ds.setHistoryRenderCount}
            totalPages={ds.totalPages}
            currentPage={ds.currentPage}
            setCurrentPage={ds.setCurrentPage}
            sort={ds.sort}
            filters={ds.filters}
            showMenu={ds.showMenu}
            setShowMenu={ds.setShowMenu}
            isMobile={ds.isMobile}
            setSelectedBet={ds.setSelectedBet}
            betKey={ds.betKey}
            dates={ds.dates}
            sports={ds.sports}
            betTypes={ds.betTypes}
          />
        )}
      </div>

      {/* Grade Guide footer */}
      <div style={{ padding: '0 clamp(16px, 3vw, 80px) 120px' }}>
        <div style={{ borderTop: '1px solid var(--color-border)', margin: '0 0 24px 0' }} />
        <div className="app-surface" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
            LarlScore Grade Guide
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { grade: 'S', color: 'var(--color-success)',         rgb: '52, 199, 89',    range: '2.0+',    label: 'Elite' },
              { grade: 'A', color: 'var(--color-confidence-high)', rgb: '90, 200, 250',   range: '1.5–2.0', label: 'Strong' },
              { grade: 'B', color: 'var(--color-grade-b)',         rgb: '255, 214, 10',   range: '1.0–1.5', label: 'Solid' },
              { grade: 'C', color: 'var(--color-caution)',         rgb: '255, 149, 0',    range: '0.5–1.0', label: 'Marginal' },
              { grade: 'D', color: 'var(--color-destructive)',     rgb: '255, 59, 48',    range: '< 0.5',   label: 'Weak' },
            ].map(({ grade, color, rgb, range, label }) => (
              <div key={grade} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: `rgba(${rgb}, 0.08)`, border: `1px solid rgba(${rgb}, 0.30)`,
                borderRadius: '12px', padding: '10px 16px', flex: '1 1 150px',
              }}>
                <span style={{ fontSize: '32px', fontWeight: '900', color, fontFamily: 'var(--font-display)', minWidth: '24px', lineHeight: 1, letterSpacing: '-0.02em' }}>{grade}</span>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>{label}</div>
                  <div style={{ fontSize: '14px', color, fontWeight: '600', fontFamily: 'var(--font-display)', marginTop: '3px', opacity: 0.85 }}>{range}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '12px', lineHeight: 1.6 }}>
            LarlScore = (confidence) × edge × (historical WR / break-even) × adaptive weight. Higher = better expected value per unit risk.
          </div>
        </div>
      </div>

      {/* Bet detail modal */}
      {ds.selectedBet && <BetDetail bet={ds.selectedBet} onClose={() => ds.setSelectedBet(null)} />}
    </div>
  );
};

export default Dashboard;
