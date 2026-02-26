/**
 * API client for new dashboard
 * Communicates with Flask backend at localhost:5001
 * OR reads from static snapshot in VITE_STATIC_MODE
 */

// Check if we're in static mode (for Netlify deployment)
const STATIC_MODE = import.meta.env.VITE_STATIC_MODE === 'true';

// Use the current window location host by default, fall back to localhost:5001
const getAPIBase = (): string => {
  if (STATIC_MODE) {
    return '/dashboard-data.json'; // Static data is served from public/
  }

  // In development, use localhost:5001
  // In production, use relative paths or environment variable
  if (typeof window !== 'undefined') {
    // If on localhost:5173, connect to localhost:5001
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5001';
    }
    // If on 192.168.1.135:5173, connect to 192.168.1.135:5001
    if (window.location.hostname === '192.168.1.135') {
      return `http://192.168.1.135:5001`;
    }
    // If on Tailscale, connect to Tailscale API
    if (window.location.hostname === '100.73.33.17') {
      return `http://100.73.33.17:5001`;
    }
  }
  return 'http://localhost:5001';
};

const API_BASE = getAPIBase();
export { getAPIBase, STATIC_MODE };

// Debug logging
const debug = (msg: string, data?: any) => {
  const prefix = STATIC_MODE ? '[BettingAPI:STATIC]' : '[BettingAPI]';
  console.log(`${prefix} ${msg}`, data || '');
};

const debugError = (msg: string, error?: any) => {
  const prefix = STATIC_MODE ? '[BettingAPI:STATIC]' : '[BettingAPI]';
  console.error(`${prefix} ERROR: ${msg}`, error || '');
};

// Static data cache
let staticData: any = null;

/**
 * Load static data snapshot (once, cached)
 */
async function loadStaticData(): Promise<any> {
  if (staticData) {
    debug('Using cached static data');
    return staticData;
  }

  debug('Loading static data from /dashboard-data.json');

  try {
    const response = await fetch('/dashboard-data.json');
    if (!response.ok) {
      throw new Error(`Failed to load static data: ${response.status}`);
    }
    staticData = await response.json();
    debug(`Static data loaded: ${staticData.bets?.length || 0} bets`);
    return staticData;
  } catch (err) {
    debugError('Failed to load static data', err);
    throw err;
  }
}

export interface Bet {
  id: string;
  date: string;
  game: string;
  sport: string;
  bet_type: string;
  recommendation: string;
  edge: number;
  confidence: number;
  larlscore: number;
  result: 'WIN' | 'LOSS' | 'CANCELLED' | 'PENDING' | null;
  actual_score: string | null;
  why_this_pick?: string;
  game_result?: string;
  game_time?: string;
  fanduel_line?: string;
  risk_tier?: string;
  american_odds?: number;
}

export interface BetFilters {
  date?: string;
  sport?: string;
  bet_type?: string;
  result?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface BetSummary {
  total_bets: number;
  wins: number;
  losses: number;
  cancelled: number;
  win_rate: number;
  by_sport: Record<string, number>;
  by_bet_type: Record<string, number>;
  by_result: Record<string, number>;
  by_date: Record<string, number>;
  spread_count?: number;
  total_count?: number;
  moneyline_count?: number;
  prop_count?: number;
}

export interface DateStat {
  date: string;
  total: number;
  wins: number;
  losses: number;
  win_rate: number;
}

export interface Phase3Payload {
  generated_at?: string;
  strategy?: string;
  active?: { bets?: Bet[]; [key: string]: any };
  ranked?: { top_10?: Bet[]; rest?: Bet[]; [key: string]: any };
  learning?: any;
  weights?: any;
  observability?: any;
  comparison?: any;
}

export interface DashboardStatus {
  status: string;
  timestamp: string;
  files?: {
    ranked_bets?: boolean;
    tracker?: boolean;
    active_bets?: boolean;
  };
  last_updates?: {
    ranked_bets?: string | null;
    tracker?: string | null;
    active_bets?: string | null;
  };
  uptime?: string;
}

export class BettingAPI {
  private static requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private static cacheTTL = 30000; // 30 seconds

  private static getCached<T>(key: string, ttlMs: number): T | null {
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.data as T;
    }
    return null;
  }

  private static setCached(key: string, data: any): void {
    this.requestCache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get all bets with optional filters and pagination
   */
  static async getAllBets(filters?: BetFilters) {
    // STATIC MODE: Read from snapshot
    if (STATIC_MODE) {
      const data = await loadStaticData();
      let bets = (data.bets || []).filter((b: Bet) => b.result !== 'PENDING');

      // Apply client-side filtering
      if (filters?.date) {
        bets = bets.filter((b: Bet) => b.date === filters.date);
      }
      if (filters?.sport) {
        bets = bets.filter((b: Bet) => b.sport === filters.sport);
      }
      if (filters?.bet_type) {
        bets = bets.filter((b: Bet) => b.bet_type === filters.bet_type);
      }
      if (filters?.result) {
        bets = bets.filter((b: Bet) => b.result === filters.result);
      }

      // Apply sorting
      if (filters?.sort) {
        const sortStr = filters.sort;
        const lastDash = sortStr.lastIndexOf('-');
        const field = sortStr.substring(0, lastDash);
        const order = sortStr.substring(lastDash + 1);
        const fieldMap: Record<string, string> = {
          'date': 'date', 'confidence': 'confidence', 'edge': 'edge',
          'larlscore': 'larlscore', 'win': 'result'
        };
        const sortField = fieldMap[field] || 'date';
        bets.sort((a: any, b: any) => {
          const aVal = a[sortField] ?? '';
          const bVal = b[sortField] ?? '';
          if (order === 'desc') return bVal > aVal ? 1 : aVal > bVal ? -1 : 0;
          return aVal > bVal ? 1 : bVal > aVal ? -1 : 0;
        });
      }

      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;
      const total = bets.length;
      const pages = Math.max(1, Math.ceil(total / limit));
      const start = (page - 1) * limit;
      const paginatedBets = bets.slice(start, start + limit);

      return {
        bets: paginatedBets,
        total,
        page,
        limit,
        pagination: { page, pages, total, limit }
      };
    }

    // LIVE MODE: Call Flask API
    const params = new URLSearchParams();

    if (filters?.date) params.append('date', filters.date);
    if (filters?.sport) params.append('sport', filters.sport);
    if (filters?.bet_type) params.append('bet_type', filters.bet_type);
    if (filters?.result) params.append('result', filters.result);
    if (filters?.sort) params.append('sort', filters.sort);
    params.append('page', String(filters?.page || 1));
    params.append('limit', String(filters?.limit || 50));

    const url = `${API_BASE}/api/bets/all?${params.toString()}`;
    const cacheKey = `bets-${params.toString()}`;

    // Check cache
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      debug(`Cache hit: ${cacheKey}`);
      return cached.data;
    }

    debug(`Fetching: ${url}`);

    try {
      // Don't include Content-Type for GET requests to avoid CORS preflight issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      debug(`Response status: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        debugError(`Failed to fetch bets: ${response.status}`, text);
        throw new Error(`API returned ${response.status}: ${text.substring(0, 200)}`);
      }

      const data = await response.json();
      debug(`Got ${data.bets?.length || 0} bets`);

      // Cache the successful response
      this.requestCache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (err) {
      debugError('Failed to fetch bets', err);

      // Check if error is due to abort (timeout)
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request timed out - API not responding');
      }

      throw new Error(`Failed to fetch bets: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Get summary statistics for all bets
   */
  static async getSummary(): Promise<BetSummary> {
    // STATIC MODE: Read from snapshot
    if (STATIC_MODE) {
      const data = await loadStaticData();
      return data.summary || {};
    }

    // LIVE MODE: Call Flask API
    const cacheKey = 'summary';
    const cached = this.getCached<BetSummary>(cacheKey, 30000);
    if (cached) return cached;

    const url = `${API_BASE}/api/bets/summary`;
    debug(`Fetching summary from: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const text = await response.text();
        debugError(`Failed to fetch summary: ${response.status}`, text);
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      debug(`Got summary: ${data.total_bets} bets`);
      this.setCached(cacheKey, data);
      return data;
    } catch (err) {
      debugError('Failed to fetch summary', err);
      throw new Error(`Failed to fetch summary: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Get a specific bet by ID
   */
  static async getBetDetail(betId: string): Promise<Bet> {
    // STATIC MODE: Find in snapshot
    if (STATIC_MODE) {
      const data = await loadStaticData();
      const bet = data.bets?.find((b: Bet) => b.id === betId);
      if (!bet) {
        throw new Error(`Bet not found: ${betId}`);
      }
      return bet;
    }

    // LIVE MODE: Call Flask API
    const url = `${API_BASE}/api/bets/${betId}`;
    debug(`Fetching bet: ${url}`);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch bet details');
      return response.json();
    } catch (err) {
      debugError('Failed to fetch bet details', err);
      throw err;
    }
  }

  /**
   * Get all available dates with stats
   */
  static async getAvailableDates(): Promise<DateStat[]> {
    // STATIC MODE: Read from snapshot
    if (STATIC_MODE) {
      const data = await loadStaticData();
      return data.dates || [];
    }

    // LIVE MODE: Call Flask API
    const url = `${API_BASE}/api/dates`;
    debug(`Fetching dates from: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const text = await response.text();
        debugError(`Failed to fetch dates: ${response.status}`, text);
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      debug(`Got ${data.dates?.length || 0} dates`);
      return data.dates;
    } catch (err) {
      debugError('Failed to fetch dates', err);
      throw new Error(`Failed to fetch dates: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Get all available sports
   */
  static async getAvailableSports(): Promise<string[]> {
    // STATIC MODE: Read from snapshot
    if (STATIC_MODE) {
      const data = await loadStaticData();
      return data.sports || [];
    }

    // LIVE MODE: Call Flask API
    const url = `${API_BASE}/api/sports`;
    debug(`Fetching sports from: ${url}`);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch sports');
      const data = await response.json();
      debug(`Got ${data.sports?.length || 0} sports`);
      return data.sports;
    } catch (err) {
      debugError('Failed to fetch sports', err);
      throw err;
    }
  }

  /**
   * Get all available bet types
   */
  static async getAvailableBetTypes(): Promise<string[]> {
    // STATIC MODE: Read from snapshot
    if (STATIC_MODE) {
      const data = await loadStaticData();
      return data.bet_types || [];
    }

    // LIVE MODE: Call Flask API
    const url = `${API_BASE}/api/bet-types`;
    debug(`Fetching bet types from: ${url}`);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch bet types');
      const data = await response.json();
      debug(`Got ${data.bet_types?.length || 0} bet types`);
      return data.bet_types;
    } catch (err) {
      debugError('Failed to fetch bet types', err);
      throw err;
    }
  }

  /**
   * Get today's live picks
   */
  static async getTodaysPicks() {
    // STATIC MODE: Read from snapshot
    if (STATIC_MODE) {
      const data = await loadStaticData();
      return {
        active_top10: data.picks || [],
        bets: data.picks || [],
        parlay_candidates: data.bonus_bets || [],
        bonus_bets: data.bonus_bets || [],
        timestamp: data.generated_at
      };
    }

    // LIVE MODE: Call Flask API
    const cacheKey = 'todays-picks';
    const cached = this.getCached<any>(cacheKey, 30000);
    if (cached) return cached;

    const url = `${API_BASE}/api/ranked-bets`;
    debug(`Fetching today's picks from: ${url}`);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch today\'s picks');
      const data = await response.json();
      this.setCached(cacheKey, data);
      return data;
    } catch (err) {
      debugError('Failed to fetch today\'s picks', err);
      throw err;
    }
  }

  /**
   * Get learning insights
   */
  static async getInsights(): Promise<any> {
    if (STATIC_MODE) {
      const data = await loadStaticData();
      return data.insights || {};
    }
    const response = await fetch(`${API_BASE}/api/insights`);
    if (!response.ok) throw new Error('Failed to fetch insights');
    return response.json();
  }

  /**
   * Get Phase 3 shadow strategy payload (served from dashboard public assets)
   */
  static async getPhase3Data(): Promise<Phase3Payload> {
    const cacheKey = 'phase3-data';
    const cached = this.getCached<Phase3Payload>(cacheKey, 30000);
    if (cached) return cached;

    const response = await fetch('/dashboard-data-phase3.json');
    if (!response.ok) throw new Error('Failed to fetch phase3 data');
    const data = await response.json();
    this.setCached(cacheKey, data);
    return data;
  }

  /**
   * Get backend status and data freshness timestamps
   */
  static async getStatus(): Promise<DashboardStatus> {
    if (STATIC_MODE) {
      const data = await loadStaticData();
      return {
        status: 'ok',
        timestamp: data.generated_at || new Date().toISOString(),
        last_updates: {
          ranked_bets: data.generated_at || null,
          active_bets: data.generated_at || null,
          tracker: data.generated_at || null,
        },
        uptime: 'static'
      };
    }

    const cacheKey = 'status';
    const cached = this.getCached<DashboardStatus>(cacheKey, 15000);
    if (cached) return cached;

    const response = await fetch(`${API_BASE}/api/status`);
    if (!response.ok) throw new Error('Failed to fetch dashboard status');
    const data = await response.json();
    this.setCached(cacheKey, data);
    return data;
  }

  /**
   * Test API connectivity
   */
  static async testConnection(): Promise<boolean> {
    // STATIC MODE: Always return true (snapshot is always available)
    if (STATIC_MODE) {
      debug('Static mode - always connected');
      return true;
    }

    // LIVE MODE: Test Flask API
    try {
      debug(`Testing connection to ${API_BASE}`);
      const response = await fetch(`${API_BASE}/api/health`);
      const isOk = response.ok;
      debug(`Connection test: ${isOk ? 'SUCCESS' : 'FAILED'}`);
      return isOk;
    } catch (err) {
      debugError('Connection test failed', err);
      return false;
    }
  }
}

// Log the resolved base URL on load (no extra network call - APIStatus handles health check)
if (typeof window !== 'undefined') {
  debug(`API Base: ${API_BASE}`);
}

export default BettingAPI;
