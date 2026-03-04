/**
 * Dashboard - Home/History switcher with sorting
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BettingAPI, { Bet, BetSummary, DateStat, DashboardStatus } from '../utils/api-new';
import BetCard from './BetCard';
import FilterBar from './FilterBar';
import BetDetail from './BetDetail';
import InsightsView from './InsightsView';
import SpecialsView from './SpecialsView';
import { HomeIcon, HistoryIcon, InsightsIcon, SpecialsIcon } from './NavIcons';
import LarlScoreLogo from './LarlScoreLogo';
import { useDebounce } from '../hooks/useDebounce';

type ViewType = 'home' | 'history' | 'insights' | 'hershel' | 'specials';

// Typed interface for the raw API pick shape (avoids `any` in transform logic)
interface RawPick {
  id?: string;
  game?: string;
  sport?: string;
  bet_type?: string;
  recommendation?: string;
  edge?: number;
  confidence?: number;
  larlscore?: number;
  score?: number;
  smart_edge?: number;
  why_this_pick?: string;
  full_bet?: {
    id?: string;
    game?: string;
    sport?: string;
    bet_type?: string;
    recommendation?: string;
    edge?: number;
    confidence?: number;
    smart_edge?: number;
    reason?: string;
    game_time?: string;
    fanduel_line?: string;
    risk_tier?: string;
    american_odds?: number;
  };
  game_time?: string;
  fanduel_line?: string;
  risk_tier?: string;
  american_odds?: number;
}

// Transform a raw API pick into a typed Bet object
const transformPick = (pick: RawPick, today: string): Bet => {
  if (pick.full_bet) {
    return {
      id: pick.full_bet.id || `pick-${Math.random()}`,
      game: pick.full_bet.game || pick.game || 'N/A',
      sport: pick.full_bet.sport || pick.sport || 'NCAA Basketball',
      bet_type: pick.bet_type || pick.full_bet.bet_type || 'UNKNOWN',
      recommendation: (pick.full_bet.recommendation || pick.recommendation || 'N/A').replace(/Points\s+Rebounds\s+Assists/gi, 'PRA'),
      edge: pick.edge ?? pick.full_bet.edge ?? 0,
      confidence: pick.confidence ?? pick.full_bet.confidence ?? 0,
      larlscore: pick.score ?? pick.full_bet.smart_edge ?? pick.edge ?? 0,
      result: null,
      actual_score: null,
      date: today,
      why_this_pick: (pick.full_bet.reason || '').replace(/Points\s+Rebounds\s+Assists/gi, 'PRA'),
      game_time: pick.game_time || pick.full_bet.game_time || '',
      fanduel_line: pick.full_bet.fanduel_line || pick.fanduel_line || '',
      risk_tier: pick.risk_tier || pick.full_bet.risk_tier || '',
      american_odds: pick.full_bet.american_odds ?? pick.american_odds,
    };
  }
  return {
    id: pick.id || `pick-${Math.random()}`,
    game: pick.game || 'N/A',
    sport: pick.sport || 'NCAA Basketball',
    bet_type: pick.bet_type || 'UNKNOWN',
    recommendation: (pick.recommendation || 'N/A').replace(/Points\s+Rebounds\s+Assists/gi, 'PRA'),
    edge: pick.edge ?? 0,
    confidence: pick.confidence ?? 0,
    larlscore: pick.larlscore ?? 0,
    result: null,
    actual_score: null,
    date: today,
    why_this_pick: (pick.why_this_pick || '').replace(/Points\s+Rebounds\s+Assists/gi, 'PRA'),
    game_time: pick.game_time || '',
    fanduel_line: pick.fanduel_line || '',
    risk_tier: pick.risk_tier || '',
    american_odds: pick.american_odds,
  };
};

const Dashboard: React.FC = () => {
  const [view, setView] = useState<ViewType>('home');
  const hasFetchedPicks = useRef(false); // guard: only fetch today's picks once
  const [bets, setBets] = useState<Bet[]>([]);
  const [todaysPicks, setTodaysPicks] = useState<Bet[]>([]);

  const [summary, setSummary] = useState<BetSummary | null>(null);
  const [dates, setDates] = useState<DateStat[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  const [betTypes, setBetTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [betsLoading, setBetsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showMenu, setShowMenu] = useState(false);
  const [sort, setSort] = useState('date-desc');
  const [_apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [dashboardStatus, setDashboardStatus] = useState<DashboardStatus | null>(null);
  const [specialsData, setSpecialsData] = useState<any>(null);

  const [filters, setFilters] = useState<{
    date?: string;
    sport?: string;
    bet_type?: string;
  }>({});
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 640 : false);
  const [homeRenderCount, setHomeRenderCount] = useState(12);

  const betKey = useCallback((bet: Bet, idx: number) => {
    const base = bet.id || `${bet.game}|${bet.bet_type}|${bet.recommendation}|${bet.date || bet.game_time || ''}`;
    return base || `bet-${idx}`;
  }, []);
  const [viewAnim, setViewAnim] = useState<number>(1);
  const [historyRenderCount, setHistoryRenderCount] = useState<number>(24);

  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        const summaryData = await BettingAPI.getSummary();

        // Add computed counts
        summaryData.spread_count    = summaryData.by_bet_type?.['SPREAD']    || 0;
        summaryData.total_count     = summaryData.by_bet_type?.['TOTAL']     || 0;
        summaryData.moneyline_count = summaryData.by_bet_type?.['MONEYLINE'] || 0;
        summaryData.prop_count      = summaryData.by_bet_type?.['PROP']      || 0;

        setSummary(summaryData);
        setLoading(false);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMsg);
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Lazy-load filter metadata only when History tab is used
  useEffect(() => {
    if (view !== 'history') return;
    if (dates.length && sports.length && betTypes.length) return;

    const loadHistoryMeta = async () => {
      try {
        const [datesData, sportsData, betTypesData] = await Promise.all([
          BettingAPI.getAvailableDates(),
          BettingAPI.getAvailableSports(),
          BettingAPI.getAvailableBetTypes(),
        ]);
        setDates(datesData);
        setSports(sportsData);
        setBetTypes(betTypesData);
      } catch {
        // non-fatal; history can still render bet list
      }
    };

    loadHistoryMeta();
  }, [view, dates.length, sports.length, betTypes.length]);

  // Lazy-load specials when Specials tab is opened
  useEffect(() => {
    if (view !== 'specials') return;
    if (specialsData) return;
    BettingAPI.getSpecials()
      .then(setSpecialsData)
      .catch(() => setSpecialsData({}));
  }, [view, specialsData]);

  // API connection status check
  useEffect(() => {
    BettingAPI.testConnection()
      .then(ok => setApiStatus(ok ? 'ok' : 'error'))
      .catch(() => setApiStatus('error'));
  }, []);

  // Data freshness/status metadata
  useEffect(() => {
    BettingAPI.getStatus()
      .then(setDashboardStatus)
      .catch(() => setDashboardStatus(null));
  }, []);



  // Mobile compact mode
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // App-like view transitions
  useEffect(() => {
    setViewAnim(0);
    const t = setTimeout(() => setViewAnim(1), 30);
    return () => clearTimeout(t);
  }, [view]);

  useEffect(() => {
    // Guard: only fetch picks once per session — re-visiting Home tab doesn't re-fetch
    if (hasFetchedPicks.current) return;

    const loadTodaysPicks = async () => {
      try {
        hasFetchedPicks.current = true;
        const picks = await BettingAPI.getTodaysPicks();
        const pickArray: RawPick[] = picks.active_top10 || picks.bets || picks.top_10 || [];
        const today = new Date().toISOString().split('T')[0];
        const transformedPicks = Array.isArray(pickArray)
          ? pickArray.slice(0, 10).map((pick) => transformPick(pick, today))
          : [];
        setTodaysPicks(transformedPicks);
      } catch (err) {
        console.error("Failed to load today's picks:", err);
        hasFetchedPicks.current = false; // allow retry on next visit
        setTodaysPicks([]);
      }
    };

    loadTodaysPicks();
  }, []);

  useEffect(() => {
    if (view === 'history') {
      const loadBets = async () => {
        try {
          setBetsLoading(true);
          setError(null);
          
          // Sort is passed to the API — server sorts ALL bets before pagination
          const result = await BettingAPI.getAllBets({
            ...debouncedFilters,
            sort,
            page: currentPage,
            limit: pageSize,
          });

          // Normalize copy for uniformity
          const norm = (s: any) => String(s || '').replace(/Points\s+Rebounds\s+Assists/gi, 'PRA');
          setBets((result.bets || []).map((b: any) => ({
            ...b,
            recommendation: norm(b.recommendation),
            why_this_pick: norm(b.why_this_pick),
          })));
          setTotalPages(result.pagination.pages);
          setBetsLoading(false);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to load bets';
          setError(errorMsg);
          setBetsLoading(false);
        }
      };

      loadBets();
    }
  }, [debouncedFilters, currentPage, pageSize, sort, view]);

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters({
      date: newFilters.date,
      sport: newFilters.sport,
      bet_type: newFilters.bet_type,
    });
    setSort(newFilters.sort || 'date-desc');
    setCurrentPage(1);
    setShowMenu(false);
  }, []);

  useEffect(() => {
    setHistoryRenderCount(24);
  }, [bets, currentPage, sort, debouncedFilters]);

  useEffect(() => {
    setHomeRenderCount(12);
  }, [todaysPicks.length]);

  const winRate = summary ? Math.round((summary.wins / summary.total_bets) * 100) : 0;

  const formatAge = (iso?: string | null): string => {
    if (!iso) return 'unknown';
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return 'unknown';
    const sec = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 48) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
  };

  const activeBetsUpdated = dashboardStatus?.last_updates?.active_bets || null;
  const rankedUpdated = dashboardStatus?.last_updates?.ranked_bets || null;
  const mergedUpdated = rankedUpdated || activeBetsUpdated;
  const overdue24h = mergedUpdated ? (Date.now() - new Date(mergedUpdated).getTime()) > (24 * 60 * 60 * 1000) : false;
  const displayedHistoryBets = bets.slice(0, historyRenderCount);




  if (error && !bets.length && !todaysPicks.length) {
    return (
      <div style={{ backgroundColor: '#0d0d0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="app-surface" style={{ maxWidth: '520px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#FF3B30', marginBottom: '10px' }}>Connection Error</h2>
          <p style={{ color: '#A0A0A0', marginBottom: '10px', lineHeight: '1.6' }}>Unable to connect to the betting API.</p>
          <p style={{ color: '#8E8E93', marginBottom: '16px', fontSize: '12px' }}>
            Last successful update: {formatAge(mergedUpdated)} · Expected cron refresh around 4:00–5:15 AM EST.
          </p>
          <button onClick={() => { setError(null); window.location.reload(); }} style={{ width: '100%', padding: '12px', backgroundColor: '#0A84FF', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ backgroundColor: '#0d0d0d', minHeight: '100vh', color: '#FFFFFF', position: 'relative' }}>

      {/* Ambient app glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.55 }}>
        <div style={{ position: 'absolute', top: -120, left: '8%', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,132,255,0.22) 0%, rgba(10,132,255,0) 70%)' }} />
        <div style={{ position: 'absolute', bottom: -140, right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,199,89,0.16) 0%, rgba(52,199,89,0) 70%)' }} />
      </div>

      {/* Floating Top Identity + API/Freshness Card */}
      <div style={{
        position: 'fixed',
        top: isMobile ? '8px' : '14px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: isMobile ? 'calc(100% - 14px)' : 'min(1100px, calc(100% - 24px))',
        zIndex: 950,
      }}>
        <div className="app-surface" style={{
          backgroundColor: 'rgba(26, 26, 26, 0.96)',
          backdropFilter: 'blur(20px)',
          borderRadius: isMobile ? '12px' : '16px',
          border: `1.5px solid ${overdue24h ? 'rgba(255, 59, 48, 0.55)' : 'rgba(10, 132, 255, 0.35)'}`,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
          padding: isMobile ? '8px 10px' : '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '6px' : '8px',
          alignItems: 'center',
        }}>
          <LarlScoreLogo size={isMobile ? 'medium' : 'large'} />

          {overdue24h && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,59,48,0.14)',
              border: '1px solid rgba(255,59,48,0.55)',
              color: '#FF3B30',
              fontSize: '12px',
              fontWeight: 600
            }}>
              Update overdue (24h+)
            </div>
          )}

        </div>
      </div>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, backgroundColor: '#0d0d0d', paddingTop: isMobile ? '132px' : '126px', paddingBottom: '24px', borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ padding: '0 clamp(16px, 3vw, 80px)' }}>
          {/* Summary Stats - Two grouped sections */}
          {summary && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {/* Group 1: Record */}
              <div className="app-surface" style={{
                flex: '1 1 300px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid #2a2a2a',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>Record</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                  <SummaryBubble label="Total Bets" value={summary.total_bets} color="#0A84FF" />
                  <SummaryBubble label="Wins" value={summary.wins} color="#34C759" />
                  <SummaryBubble label="Losses" value={summary.losses} color="#FF3B30" />
                  <SummaryBubble label="Win Rate" value={`${winRate}%`} color="#FF9500" />
                </div>
              </div>
              {/* Group 2: Bet Types */}
              <div className="app-surface" style={{
                flex: '1 1 300px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid #2a2a2a',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>Bet Types</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <SummaryBubble label="SPREAD"    value={summary.spread_count    || 0} color="#8B5CF6" />
                  <SummaryBubble label="TOTAL"     value={summary.total_count     || 0} color="#06B6D4" />
                  <SummaryBubble label="MONEYLINE" value={summary.moneyline_count || 0} color="#F59E0B" />
                  <SummaryBubble label="PROP"      value={summary.prop_count      || 0} color="#0A84FF" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Navigation Bar - Centered */}
      <div className="nav-floating" style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        zIndex: 900,
      }}>
        {/* Backdrop Container — negative inset expands beyond button bounds for visual weight */}
        <div className="nav-backdrop" style={{
          position: 'absolute',
          inset: '-10px -14px',
          backgroundColor: 'rgba(26, 26, 26, 0.97)',
          backdropFilter: 'blur(24px)',
          borderRadius: '20px',
          border: '1.5px solid rgba(10, 132, 255, 0.35)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
          zIndex: -1,
        }} />

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: '8px', position: 'relative', zIndex: 1 }}>
          <ViewButton
            className="nav-btn"
            label="Home"
            icon={<HomeIcon size={18} />}
            active={view === 'home'}
            onClick={() => {
              setView('home');
              setShowMenu(false);
            }}
          />
          <ViewButton
            className="nav-btn"
            label="Specials"
            icon={<SpecialsIcon size={18} />}
            active={view === 'specials'}
            onClick={() => {
              setView('specials');
              setShowMenu(false);
            }}
          />
          <ViewButton
            className="nav-btn"
            label="Insights"
            icon={<InsightsIcon size={18} />}
            active={view === 'insights'}
            onClick={() => {
              setView('insights');
              setShowMenu(false);
            }}
          />
          <ViewButton
            className="nav-btn"
            label="History"
            icon={<HistoryIcon size={18} />}
            active={view === 'history'}
            onClick={() => {
              setView('history');
              setShowMenu(false);
            }}
          />
          <ViewButton
            className="nav-btn"
            label="Hershel"
            icon={<HomeIcon size={18} />}
            active={view === 'hershel'}
            onClick={() => {
              setView('hershel');
              setShowMenu(false);
            }}
          />

        </div>


        {/* Overlay Menu */}
        {showMenu && view === 'history' && (
          <>
            {/* Click outside to close */}
            <div
              onClick={() => setShowMenu(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 899,
              }}
            />
            
            {/* Menu Panel - Centered above floating nav */}
            <div className="nav-filter-panel app-surface" style={{
              position: 'fixed',
              bottom: '116px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(26, 26, 26, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(42, 42, 42, 0.5)',
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '420px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
              zIndex: 1000,
              maxHeight: '65vh',
              overflowY: 'auto',
            }}>
              <FilterBar
                onFilterChange={handleFilterChange}
                dates={dates}
                sports={sports}
                betTypes={betTypes}
                currentSort={sort}
                currentDate={filters.date || ''}
                currentSport={filters.sport || ''}
                currentBetType={filters.bet_type || ''}
              />

              {/* Page Size */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #2a2a2a' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#A0A0A0', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Bets Per Page
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#0d0d0d',
                    color: '#FFFFFF',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
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

      {/* Main Content */}
      <div className="view-enter" style={{
        position: 'relative',
        zIndex: 1,
        padding: '24px clamp(16px, 3vw, 80px) 100px',
        opacity: viewAnim,
        transform: `translateY(${viewAnim ? 0 : 4}px)`,
        transition: 'opacity 180ms ease, transform 180ms ease'
      }}>
        {loading ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px,1fr))', gap: '10px', marginBottom: '18px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={`s-${i}`} className="skeleton-shimmer" style={{ height: '78px', borderRadius: '12px', border: '1px solid #2a2a2a' }} />
              ))}
            </div>
            <div className="bet-grid" style={{ marginBottom: '40px' }}>
              {[...Array(6)].map((_, i) => (
                <div key={`sk-${i}`} className="skeleton-shimmer" style={{ height: '180px', borderRadius: '14px', border: '1px solid #2a2a2a' }} />
              ))}
            </div>
          </div>
        ) : view === 'insights' ? (
          <div className="app-surface" style={{ borderRadius: 16, padding: '14px', border: '1px solid rgba(255,255,255,0.14)', background: 'linear-gradient(145deg, rgba(26,26,26,0.96), rgba(22,22,22,0.92))' }}>
            <div style={{ border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, padding: '10px 12px', marginBottom: 12, background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Insights</div>
              <div style={{ fontSize: 12, color: '#9aa3b2', marginTop: 2 }}>Model learning, trends, and diagnostics</div>
            </div>
            <InsightsView key="insights" />
          </div>
        ) : view === 'hershel' ? (
          <div className="app-surface" style={{ borderRadius: 16, padding: '14px', border: '1px solid rgba(255,255,255,0.14)', background: 'linear-gradient(145deg, rgba(26,26,26,0.96), rgba(22,22,22,0.92))' }}>
            <div style={{ border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, padding: '12px 12px', marginBottom: 12, background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#5DADE2', letterSpacing: '-0.02em' }}>Putting the W in Walter</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src="/hershel.png"
                alt="Hershel"
                style={{
                  width: 'min(860px, 100%)',
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.55)'
                }}
              />
            </div>
          </div>
        ) : view === 'specials' ? (
          <div className="app-surface" style={{ borderRadius: 16, padding: '14px', border: '1px solid rgba(168,85,247,0.24)', background: 'linear-gradient(145deg, rgba(26,26,26,0.96), rgba(22,22,22,0.92))' }}>
            <SpecialsView specials={specialsData} />
          </div>
        ) : view === 'home' ? (
          <>
            {/* Today's Picks Section */}
            {todaysPicks.length > 0 ? (
              <div className="app-surface" style={{ borderRadius: 16, padding: '14px', border: '1px solid rgba(142,197,255,0.24)', background: 'linear-gradient(145deg, rgba(26,26,26,0.96), rgba(20,24,30,0.92))' }}>
                <div style={{
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
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))'
                }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                      Today's Recommended Picks
                    </div>
                    <div style={{ fontSize: 12, color: '#9aa3b2', marginTop: 2 }}>Top plays across all bet types</div>
                  </div>
                  <span className="app-chip" style={{ padding: '6px 10px', fontSize: 12, fontWeight: 700, color: '#D7DFEA', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.06)' }}>
                    {todaysPicks.length} active
                  </span>
                </div>
                <div className="bet-grid" style={{ marginBottom: 10 }}>
                  {todaysPicks.slice(0, homeRenderCount).map((bet, idx) => (
                    <BetCard key={`today-${betKey(bet, idx)}`} bet={bet} onClick={() => setSelectedBet(bet)} showScore={false} />
                  ))}
                </div>
                {homeRenderCount < todaysPicks.length && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                    <button className="app-chip" onClick={() => setHomeRenderCount((c) => c + 12)} style={{ padding: '8px 14px', fontSize: '12px', color: '#BFC8D6', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer' }}>
                      Load more picks ({todaysPicks.length - homeRenderCount} left)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState title="No picks for today" subtitle="Check back after the 5:00 AM generation cron." />
            )}

{/* Historical bets section removed - use History tab instead */}
          </>
        ) : (
          <div className="app-surface" style={{ borderRadius: 16, padding: '14px', border: '1px solid rgba(255,255,255,0.14)', background: 'linear-gradient(145deg, rgba(26,26,26,0.96), rgba(22,22,22,0.92))' }}>
            <div className="app-surface" style={{
              position: 'sticky',
              top: isMobile ? 76 : 86,
              zIndex: 20,
              marginBottom: 12,
              borderRadius: 16,
              padding: '12px',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'linear-gradient(145deg, rgba(26,26,26,0.96), rgba(22,22,22,0.92))',
            }}>
              {/* Single header row (remove extra nested bubble) */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                marginBottom: 10,
                minHeight: 40,
              }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>History</div>
                  <div style={{ fontSize: 12, color: '#9aa3b2', marginTop: 2 }}>All results here</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', paddingTop: 2 }}>
                  <span className="app-chip ctl" style={{ padding: '4px 8px', fontSize: 11, color: '#A0A0A0' }}>Sort: {sort}</span>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="ctl"
                    style={{
                      background: showMenu ? 'linear-gradient(145deg, rgba(10,132,255,0.95), rgba(10,132,255,0.78))' : 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
                      border: showMenu ? '1px solid rgba(10,132,255,0.85)' : '1px solid rgba(255,255,255,0.12)',
                      color: showMenu ? '#fff' : '#B8C0CC',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Filters
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                {filters.date && <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: '#8EC5FF' }}>Date: {filters.date}</span>}
                {filters.sport && <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: '#8EC5FF' }}>{filters.sport}</span>}
                {filters.bet_type && <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: '#8EC5FF' }}>{filters.bet_type}</span>}
              </div>
            </div>

            {betsLoading && bets.length === 0 ? (
              <div className="app-empty" style={{ color: '#A0A0A0' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>•</div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#E0E0E0', margin: '0 0 4px 0' }}>Loading history…</p>
                <p style={{ fontSize: '12px', margin: 0 }}>Fetching graded bets and pagination metadata.</p>
              </div>
            ) : bets.length === 0 ? (
              <div className="app-empty" style={{ color: '#A0A0A0' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>•</div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#E0E0E0', margin: '0 0 4px 0' }}>No bets found</p>
                <p style={{ fontSize: '12px', margin: 0 }}>Try clearing filters or selecting a different date range.</p>
              </div>
            ) : (
              <>
                {/* Bets Grid - Responsive: 2-3 per row */}
                <div className="bet-grid">
                  {displayedHistoryBets.map((bet, idx) => (
                    <div key={bet.id} style={{ animation: 'viewEnter 220ms cubic-bezier(0.2,0.9,0.4,1) both', animationDelay: `${Math.min(idx * 22, 220)}ms` }}>
                      <BetCard bet={bet} onClick={() => setSelectedBet(bet)} />
                    </div>
                  ))}
                </div>

                {displayedHistoryBets.length < bets.length && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                    <button className="app-chip" onClick={() => setHistoryRenderCount((c) => c + 24)} style={{ padding: '8px 14px', fontSize: '12px', color: '#BFC8D6', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer' }}>
                      Load more cards ({bets.length - displayedHistoryBets.length} left)
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
                    <PaginationButton label="← Previous" disabled={currentPage === 1} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A0A0A0', fontSize: '14px', fontWeight: '500', minWidth: '120px', justifyContent: 'center' }}>
                      Page {currentPage} of {totalPages}
                    </div>
                    <PaginationButton label="Next →" disabled={currentPage === totalPages} onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedBet && <BetDetail bet={selectedBet} onClose={() => setSelectedBet(null)} />}
    </div>
  );
};

const EmptyState: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="app-empty" style={{ color: '#A0A0A0' }}>
    <div style={{ fontSize: '28px', marginBottom: '8px' }}>•</div>
    <p style={{ fontSize: '16px', fontWeight: '600', color: '#E0E0E0', margin: '0 0 4px 0' }}>{title}</p>
    <p style={{ fontSize: '12px', margin: 0 }}>{subtitle}</p>
  </div>
);

const SummaryBubble: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div className="app-card app-surface" style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    padding: '12px 8px',
    minHeight: '90px',
    width: '100%',
  }}>
    <p style={{ fontSize: '10px', fontWeight: '600', color: '#A0A0A0', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}
    </p>
    <p style={{ fontSize: '22px', fontWeight: '700', color, margin: 0 }}>
      {value}
    </p>
  </div>
);

const ViewButton: React.FC<{ label: string; icon: React.ReactNode; active: boolean; onClick: () => void; className?: string }> = ({ label, icon, active, onClick, className }) => (
  <button
    onClick={onClick}
    className={className}
    style={{
      padding: '8px 12px',
      minWidth: 70,
      background: active ? 'linear-gradient(145deg, rgba(10,132,255,0.95), rgba(10,132,255,0.78))' : 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
      boxShadow: active ? '0 12px 30px rgba(10,132,255,0.20)' : 'none',
      color: active ? '#FFFFFF' : '#B8C0CC',
      border: active ? '1px solid rgba(10,132,255,0.85)' : '1px solid rgba(255,255,255,0.12)',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease-out',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    }}
    onMouseEnter={(e) => {
      if (!active) {
        (e.currentTarget as HTMLButtonElement).style.borderColor = '#6EA8FF';
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
      }
    }}
  >
    <span style={{
      width: 26,
      height: 26,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9,
      color: active ? '#fff' : '#D7DFEA',
      background: active
        ? 'linear-gradient(145deg, rgba(255,255,255,0.34), rgba(255,255,255,0.16))'
        : 'linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))',
      border: '1px solid rgba(255,255,255,0.22)',
      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.18)',
    }}>
      {icon}
    </span>
    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1 }}>{label}</span>
  </button>
);

const PaginationButton: React.FC<{ label: string; disabled: boolean; onClick: () => void }> = ({ label, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="ctl"
    style={{
      backgroundColor: disabled ? '#1a1a1a' : '#0A84FF',
      color: disabled ? '#8E8E93' : '#FFFFFF',
      border: disabled ? '1px solid #2a2a2a' : '1px solid #0A84FF',
      fontWeight: '700',
      cursor: disabled ? 'default' : 'pointer',
      transition: 'all 0.2s ease-out',
      opacity: disabled ? 0.5 : 1,
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }
    }}
  >
    {label}
  </button>
);

export default Dashboard;
