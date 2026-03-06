/**
 * InsightsView — compact app-style learning stats
 */

import React, { useEffect, useState } from 'react';
import BettingAPI from '../utils/api-new';

interface InsightRec {
  type: string;
  priority: string;
  action: string;
  reason: string;
}

interface Bucket {
  wins: number;
  losses: number;
  total: number;
  win_rate: number;
  record: string;
}

interface Insights {
  generated_at: string;
  total_bets_analyzed: number;
  overall_win_rate: number;
  roi: {
    record: string;
    net_units: number;
    roi_pct: number;
    breakeven_win_rate_pct: number;
    above_breakeven: number;
  };
  by_bet_type: Record<string, Bucket>;
  by_sport: Record<string, Bucket>;
  by_confidence: Record<string, Bucket>;
  by_edge: Record<string, Bucket>;
  recommendations: InsightRec[];
  optimal_thresholds: {
    min_confidence: number;
    min_edge: number;
    max_high_risk_pct: number;
  };
  optimal_thresholds_by_type?: Record<string, { min_confidence?: number; min_edge?: number }>;
  moneyline_status?: string;
  moneyline_reason?: string;

  // Optional export-time instrumentation (static dashboard ops)
  quality?: {
    last7?: {
      pinnacle?: { coverage_pct?: number; agree_pct?: number };
      consensus?: { coverage_pct?: number };
      clv_proxy?: { avg_abs?: number };
    };
  };
  export_meta?: {
    exported_at?: string;
    betting_repo_commit?: string | null;
    cloudflare_pages?: string;
  };
}

// Win rate → grade color (matches LarlScore grade palette: green/blue/yellow/orange/red)
function winRateColor(rate: number): string {
  if (rate >= 57) return 'var(--color-success)';           // S-tier: clearly profitable
  if (rate >= 52.4) return 'var(--color-confidence-high)'; // A-tier: above break-even (sky blue)
  if (rate >= 48) return 'var(--color-grade-b)';           // B-tier: marginal (yellow)
  if (rate >= 43) return 'var(--color-caution)';           // C-tier: below b/e (orange)
  return 'var(--color-destructive)';                        // D-tier: losing (red)
}

const CompactBubble: React.FC<{ label: string; record: string; rate: number }> = ({ label, record, rate }) => (
  <div className="app-card app-surface" style={{ borderRadius: 14, padding: '12px 14px', gap: 10, display: 'grid', gridTemplateColumns: '1fr auto' }}>
    <div>
      <div style={{ fontSize: 15, fontWeight: 720, color: 'var(--color-text-primary)', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 3 }}>{record}</div>
      <div style={{ marginTop: 8, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(0, Math.min(100, rate))}%`, height: '100%', background: winRateColor(rate) }} />
      </div>
    </div>
    <div style={{ alignSelf: 'center', fontSize: 24, fontWeight: 800, color: winRateColor(rate), fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{rate.toFixed(1)}%</div>
  </div>
);

const CompactSection: React.FC<{ title: string; data: Record<string, { record: string; win_rate: number }> }> = ({ title, data }) => (
  <div className="app-surface" style={{ borderRadius: 16, padding: '14px 14px 16px' }}>
    <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 760, marginBottom: 12 }}>{title}</div>
    <div style={{ display: 'grid', gap: 10 }}>
      {Object.entries(data).map(([k, v]) => <CompactBubble key={k} label={k} record={v.record} rate={v.win_rate} />)}
    </div>
  </div>
);

const InsightsView: React.FC = () => {
  const [data, setData] = useState<Insights | null>(null);
  const [status, setStatus] = useState<{
    health_strip?: {
      parlays?: {
        count?: number;
        primary_odds?: number | null;
        primary_in_band?: boolean | null;
      } | null;
      odds_coverage_today?: {
        pct?: number | null;
        with_odds?: number;
        total?: number;
      } | null;
      espn?: {
        down_flag?: boolean;
        down_flag_mtime?: string | null;
      } | null;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      BettingAPI.getInsights(),
      BettingAPI.getStatus().catch(() => null),
    ])
      .then(([d, s]) => {
        setData(d);
        setStatus(s);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load insights');
        setLoading(false);
      });
  }, [retry]);

  if (loading) return <div className="app-empty" style={{ color: 'var(--color-text-tertiary)', marginTop: 12 }}>Loading insights...</div>;
  if (error || !data) return (
    <div className="app-empty" style={{ marginTop: 12 }}>
      <div style={{ color: 'var(--color-destructive)', marginBottom: 12 }}>{error || 'No insights available'}</div>
      <button onClick={() => setRetry(r => r + 1)} style={{ padding: '9px 18px', background: 'var(--color-primary)', color: 'var(--color-text-primary)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Retry</button>
    </div>
  );

  const roiPositive = data.roi.net_units >= 0;

  return (
    <div style={{ padding: '6px 0 104px' }}>

      <div className="app-surface" style={{ borderRadius: 16, padding: '12px 12px 10px', marginBottom: 12, border: `1px solid ${roiPositive ? 'rgba(48,209,88,0.3)' : 'rgba(255,69,58,0.3)'}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 720 }}>Overall WR</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: winRateColor(data.overall_win_rate), fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{data.overall_win_rate.toFixed(1)}%</div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: 2 }}>{data.roi.record}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 720 }}>ROI @ -110</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: roiPositive ? 'var(--color-success)' : 'var(--color-destructive)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{data.roi.roi_pct.toFixed(1)}%</div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: 2 }}>{data.roi.net_units.toFixed(1)}u net</div>
          </div>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="app-chip" style={{ padding: '4px 8px', fontSize: 12, color: 'var(--color-text-tertiary)' }}>B/E {data.roi.breakeven_win_rate_pct}%</span>
            <span className="app-chip" style={{ padding: '4px 8px', fontSize: 12, color: data.roi.above_breakeven >= 0 ? 'var(--color-success)' : 'var(--color-destructive)' }}>
              {data.roi.above_breakeven >= 0 ? '+' : ''}{data.roi.above_breakeven.toFixed(1)}% vs B/E
            </span>
            {data.moneyline_status && (
              <span className="app-chip" title={data.moneyline_reason || ''} style={{ padding: '4px 8px', fontSize: 11, color: data.moneyline_status === 'ENABLED' ? 'var(--color-success)' : 'var(--color-destructive)' }}>
                ML: {data.moneyline_status}
              </span>
            )}
          </div>
          <span className="app-chip" title={data.moneyline_reason || ''} style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            Thresholds: SP {data?.optimal_thresholds_by_type?.SPREAD?.min_confidence ?? data.optimal_thresholds.min_confidence}%/{data?.optimal_thresholds_by_type?.SPREAD?.min_edge ?? data.optimal_thresholds.min_edge} | TO {data?.optimal_thresholds_by_type?.TOTAL?.min_confidence ?? data.optimal_thresholds.min_confidence}%/{data?.optimal_thresholds_by_type?.TOTAL?.min_edge ?? data.optimal_thresholds.min_edge} | PR {data?.optimal_thresholds_by_type?.PROP?.min_confidence ?? data.optimal_thresholds.min_confidence}%/{data?.optimal_thresholds_by_type?.PROP?.min_edge ?? data.optimal_thresholds.min_edge}
          </span>
        </div>
      </div>

      {/* Quality / pipeline KPIs (small chips) */}
      {(data?.quality || status?.health_strip) && (
        <div style={{ marginTop: 10, marginBottom: 10, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* Health strip */}
            {status?.health_strip?.parlays && (
              <>
                <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  Parlays: {status.health_strip.parlays.count ?? 0}
                </span>
                {status.health_strip.parlays.primary_odds != null && (
                  <span
                    className="app-chip"
                    style={{
                      padding: '4px 8px',
                      fontSize: 11,
                      color: status.health_strip.parlays.primary_in_band ? 'var(--color-success)' : 'var(--color-caution)',
                    }}
                  >
                    Primary: {status.health_strip.parlays.primary_odds > 0 ? '+' : ''}{status.health_strip.parlays.primary_odds}
                    {status.health_strip.parlays.primary_in_band ? ' (in band)' : ' (out of band)'}
                  </span>
                )}
              </>
            )}
            {status?.health_strip?.odds_coverage_today && (
              <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                Odds cov: {status.health_strip.odds_coverage_today.pct != null ? status.health_strip.odds_coverage_today.pct.toFixed(0) : 'n/a'}%
                ({status.health_strip.odds_coverage_today.with_odds ?? 0}/{status.health_strip.odds_coverage_today.total ?? 0})
              </span>
            )}
            {status?.health_strip?.espn?.down_flag != null && (
              <span
                className="app-chip"
                style={{
                  padding: '4px 8px',
                  fontSize: 11,
                  color: status.health_strip.espn.down_flag ? 'var(--color-destructive)' : 'var(--color-success)',
                }}
                title={status.health_strip.espn.down_flag_mtime || ''}
              >
                ESPN: {status.health_strip.espn.down_flag ? 'DOWN' : 'OK'}
              </span>
            )}

            {/* Existing quality KPIs */}
            {data?.quality && (
              <>
                <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  Pinnacle cov: {data.quality?.last7?.pinnacle?.coverage_pct ?? 0}%
                </span>
                <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  Pinnacle agree: {data.quality?.last7?.pinnacle?.agree_pct ?? 0}%
                </span>
                <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  Consensus cov: {data.quality?.last7?.consensus?.coverage_pct ?? 0}%
                </span>
                <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  CLV |avg|: {data.quality?.last7?.clv_proxy?.avg_abs ?? 0}
                </span>
              </>
            )}
          </div>
          <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            Updated: {data?.export_meta?.exported_at ? new Date(data.export_meta.exported_at).toLocaleString() : 'n/a'}
          </span>
        </div>
      )}

      <div
        className="insights-grid"
        style={{
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          alignItems: 'start',
        }}
      >
        <CompactSection title="By Bet Type" data={data.by_bet_type} />
        <CompactSection title="By Sport" data={data.by_sport} />
        <CompactSection title="By Edge" data={data.by_edge} />
        <CompactSection title="By Confidence" data={data.by_confidence} />
      </div>

    </div>
  );
};

export default InsightsView;
