/**
 * useDashboardState — all Dashboard state, effects, and derived values.
 * Dashboard.tsx is a thin shell that calls this hook and passes slices to views.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import BettingAPI, { Bet, BetSummary, DateStat, DashboardStatus } from '../utils/api-new';
import { useDebounce } from './useDebounce';

// ─── Shared Types ────────────────────────────────────────────────────────────

export type ViewType = 'home' | 'history' | 'insights' | 'specials';

export interface RawPick {
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
  date?: string;
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

export interface SpecialsPayload {
  q3_100?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FilterState {
  date?: string;
  sport?: string;
  bet_type?: string;
  sort?: string;
}

// ─── Helpers (private to this module) ────────────────────────────────────────

const norm = (s: string | null | undefined) =>
  String(s || '').replace(/Points\s+Rebounds\s+Assists/gi, 'PRA');

const transformPick = (pick: RawPick, today: string): Bet => {
  if (pick.full_bet) {
    return {
      id: pick.full_bet.id || `pick-${Math.random()}`,
      game: pick.full_bet.game || pick.game || 'N/A',
      sport: pick.full_bet.sport || pick.sport || 'NCAA Basketball',
      bet_type: pick.bet_type || pick.full_bet.bet_type || 'UNKNOWN',
      recommendation: norm(pick.full_bet.recommendation || pick.recommendation || 'N/A'),
      edge: pick.edge ?? pick.full_bet.edge ?? 0,
      confidence: pick.confidence ?? pick.full_bet.confidence ?? 0,
      larlscore: pick.larlscore ?? pick.score ?? pick.full_bet.smart_edge ?? pick.edge ?? 0,
      result: null,
      actual_score: null,
      date: today,
      why_this_pick: norm(pick.full_bet.reason || ''),
      game_time: pick.game_time || pick.full_bet.game_time || '',
      fanduel_line: pick.full_bet.fanduel_line || pick.fanduel_line || '',
      risk_tier: pick.risk_tier || pick.full_bet.risk_tier || '',
      american_odds: pick.full_bet.american_odds ?? pick.american_odds,
    };
  }
  const raw = pick as RawPick & {
    calibrated_confidence?: number;
    result?: string | null;
    actual_score?: string | null;
    why_this_pick_full?: string;
    reason?: string;
    bet_explanation?: string;
  };
  return {
    id: raw.id || `pick-${Math.random()}`,
    game: raw.game || 'N/A',
    sport: raw.sport || 'NCAA Basketball',
    bet_type: raw.bet_type || 'UNKNOWN',
    recommendation: norm(raw.recommendation || 'N/A'),
    edge: raw.edge ?? 0,
    confidence: raw.calibrated_confidence ?? raw.confidence ?? 0,
    larlscore: raw.larlscore ?? raw.smart_edge ?? 0,
    result: (raw.result as Bet['result']) ?? null,
    actual_score: raw.actual_score ?? null,
    date: raw.date || today,
    why_this_pick: norm(raw.why_this_pick_full || raw.reason || raw.why_this_pick || raw.bet_explanation || ''),
    game_time: raw.game_time || '',
    fanduel_line: raw.fanduel_line || '',
    risk_tier: raw.risk_tier || '',
    american_odds: raw.american_odds,
  };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboardState() {
  const [view, setView] = useState<ViewType>('home');
  const hasFetchedPicks = useRef(false);

  const [bets, setBets] = useState<Bet[]>([]);
  const [todaysPicks, setTodaysPicks] = useState<Bet[]>([]);
  const [todaysPicksDate, setTodaysPicksDate] = useState<string>('');
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
  const [specialsData, setSpecialsData] = useState<SpecialsPayload | null>(null);
  const [filters, setFilters] = useState<{ date?: string; sport?: string; bet_type?: string }>({});
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false
  );
  const [homeRenderCount, setHomeRenderCount] = useState(12);
  const [viewAnim, setViewAnim] = useState<number>(1);
  const [historyRenderCount, setHistoryRenderCount] = useState<number>(24);

  const betKey = useCallback((bet: Bet, idx: number) => {
    const base = bet.id || `${bet.game}|${bet.bet_type}|${bet.recommendation}|${bet.date || bet.game_time || ''}`;
    return base || `bet-${idx}`;
  }, []);

  const debouncedFilters = useDebounce(filters, 300);

  // ── Effects ────────────────────────────────────────────────────────────────

  // Initial: summary stats
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        const summaryData = await BettingAPI.getSummary();
        summaryData.spread_count    = summaryData.by_bet_type?.['SPREAD']    || 0;
        summaryData.total_count     = summaryData.by_bet_type?.['TOTAL']     || 0;
        summaryData.moneyline_count = summaryData.by_bet_type?.['MONEYLINE'] || 0;
        summaryData.prop_count      = summaryData.by_bet_type?.['PROP']      || 0;
        setSummary(summaryData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Lazy-load filter metadata only when History tab is first used
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
        // non-fatal
      }
    };
    loadHistoryMeta();
  }, [view, dates.length, sports.length, betTypes.length]);

  // Lazy-load specials when Specials tab is first opened
  useEffect(() => {
    if (view !== 'specials' || specialsData) return;
    BettingAPI.getSpecials()
      .then(setSpecialsData)
      .catch(() => setSpecialsData({}));
  }, [view, specialsData]);

  // API connection status
  useEffect(() => {
    BettingAPI.testConnection()
      .then(ok => setApiStatus(ok ? 'ok' : 'error'))
      .catch(() => setApiStatus('error'));
  }, []);

  // Data freshness metadata
  useEffect(() => {
    BettingAPI.getStatus()
      .then(setDashboardStatus)
      .catch(() => setDashboardStatus(null));
  }, []);

  // Mobile responsive
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // View transition animation
  useEffect(() => {
    setViewAnim(0);
    const t = setTimeout(() => setViewAnim(1), 30);
    return () => clearTimeout(t);
  }, [view]);

  // Today's picks — fetched once per session
  useEffect(() => {
    if (hasFetchedPicks.current) return;
    const loadTodaysPicks = async () => {
      try {
        hasFetchedPicks.current = true;
        const picks = await BettingAPI.getTodaysPicks();
        const pickArray: RawPick[] = picks.active_top10 || picks.bets || picks.top_10 || [];
        const picksDate = picks.date || new Date().toISOString().split('T')[0];
        const transformedPicks = Array.isArray(pickArray)
          ? pickArray.slice(0, 10).map((pick) => transformPick(pick, picksDate))
          : [];
        setTodaysPicks(transformedPicks);
        setTodaysPicksDate(picksDate);
      } catch {
        hasFetchedPicks.current = false;
        setTodaysPicks([]);
      }
    };
    loadTodaysPicks();
  }, []);

  // History bets — reload on filter/page/sort changes
  useEffect(() => {
    if (view !== 'history') return;
    const loadBets = async () => {
      try {
        setBetsLoading(true);
        setError(null);
        const result = await BettingAPI.getAllBets({
          ...debouncedFilters,
          sort,
          page: currentPage,
          limit: pageSize,
        });
        setBets((result.bets || []).map((b: Bet) => ({
          ...b,
          recommendation: norm(b.recommendation),
          why_this_pick: norm(b.why_this_pick),
        })));
        setTotalPages(result.pagination.pages);
        setBetsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bets');
        setBetsLoading(false);
      }
    };
    loadBets();
  }, [debouncedFilters, currentPage, pageSize, sort, view]);

  // Reset render counts on data change
  useEffect(() => { setHistoryRenderCount(24); }, [bets, currentPage, sort, debouncedFilters]);
  useEffect(() => { setHomeRenderCount(12); }, [todaysPicks.length]);

  // ── Filter handler ──────────────────────────────────────────────────────────

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters({
      date: newFilters.date,
      sport: newFilters.sport,
      bet_type: newFilters.bet_type,
    });
    setSort(newFilters.sort || 'date-desc');
    setCurrentPage(1);
    setShowMenu(false);
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────

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
  const rankedUpdated     = dashboardStatus?.last_updates?.ranked_bets || null;
  const mergedUpdated     = rankedUpdated || activeBetsUpdated;
  const overdue24h = mergedUpdated
    ? (Date.now() - new Date(mergedUpdated).getTime()) > 24 * 60 * 60 * 1000
    : false;

  const displayedHistoryBets = bets.slice(0, historyRenderCount);

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    // View
    view, setView,
    viewAnim,
    // Loading / error
    loading,
    betsLoading,
    error, setError,
    // Picks (home)
    todaysPicks,
    todaysPicksDate,
    homeRenderCount, setHomeRenderCount,
    // History
    bets,
    displayedHistoryBets,
    historyRenderCount, setHistoryRenderCount,
    totalPages,
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    sort, setSort,
    filters, setFilters,
    showMenu, setShowMenu,
    dates, sports, betTypes,
    handleFilterChange,
    // Summary / metadata
    summary,
    winRate,
    dashboardStatus,
    specialsData,
    isMobile,
    selectedBet, setSelectedBet,
    betKey,
    debouncedFilters,
    formatAge,
    mergedUpdated,
    overdue24h,
  };
}
