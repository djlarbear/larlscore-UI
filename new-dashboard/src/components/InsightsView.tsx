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

  // Optional export-time instrumentation (static dashboard ops)
  quality?: any;
  export_meta?: {
    exported_at?: string;
    betting_repo_commit?: string | null;
    cloudflare_pages?: string;
  };
}

function winRateColor(rate: number): string {
  if (rate >= 55) return '#30d158';
  if (rate >= 52.4) return '#a3e635';
  if (rate >= 45) return '#ffd60a';
  return '#ff453a';
}

const CompactBubble: React.FC<{ label: string; record: string; rate: number }> = ({ label, record, rate }) => (
  <div className="app-card app-surface" style={{ borderRadius: 14, padding: '12px 13px', gap: 10, display: 'grid', gridTemplateColumns: '1fr auto' }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 720, color: '#fff', letterSpacing: '0.01em' }}>{label}</div>
      <div style={{ fontSize: 11.5, color: '#9a9aa0', marginTop: 2 }}>{record}</div>
      <div style={{ marginTop: 8, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(0, Math.min(100, rate))}%`, height: '100%', background: winRateColor(rate) }} />
      </div>
    </div>
    <div style={{ alignSelf: 'center', fontSize: 19, fontWeight: 780, color: winRateColor(rate), fontVariantNumeric: 'tabular-nums' }}>{rate.toFixed(1)}%</div>
  </div>
);

const CompactSection: React.FC<{ title: string; data: Record<string, { record: string; win_rate: number }> }> = ({ title, data }) => (
  <div className="app-surface" style={{ borderRadius: 16, padding: '12px 12px 14px' }}>
    <div style={{ fontSize: 11.5, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 760, marginBottom: 10 }}>{title}</div>
    <div style={{ display: 'grid', gap: 10 }}>
      {Object.entries(data).map(([k, v]) => <CompactBubble key={k} label={k} record={v.record} rate={v.win_rate} />)}
    </div>
  </div>
);

const InsightsView: React.FC = () => {
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    BettingAPI.getInsights()
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Could not load insights'); setLoading(false); });
  }, [retry]);

  if (loading) return <div className="app-empty" style={{ color: '#8e8e93', marginTop: 12 }}>Loading insights...</div>;
  if (error || !data) return (
    <div className="app-empty" style={{ marginTop: 12 }}>
      <div style={{ color: '#ff453a', marginBottom: 12 }}>{error || 'No insights available'}</div>
      <button onClick={() => setRetry(r => r + 1)} style={{ padding: '9px 18px', background: '#0A84FF', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Retry</button>
    </div>
  );

  const roiPositive = data.roi.net_units >= 0;

  return (
    <div style={{ padding: '6px 0 104px' }}>

      <div className="app-surface" style={{ borderRadius: 16, padding: '12px 12px 10px', marginBottom: 12, border: `1px solid ${roiPositive ? 'rgba(48,209,88,0.3)' : 'rgba(255,69,58,0.3)'}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 720 }}>Overall WR</div>
            <div style={{ fontSize: 26, fontWeight: 820, color: winRateColor(data.overall_win_rate), fontVariantNumeric: 'tabular-nums' }}>{data.overall_win_rate.toFixed(1)}%</div>
            <div style={{ fontSize: 11.5, color: '#9a9aa0', fontWeight: 520 }}>{data.roi.record}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 720 }}>ROI @ -110</div>
            <div style={{ fontSize: 26, fontWeight: 820, color: roiPositive ? '#30d158' : '#ff453a', fontVariantNumeric: 'tabular-nums' }}>{data.roi.roi_pct.toFixed(1)}%</div>
            <div style={{ fontSize: 11.5, color: '#9a9aa0', fontWeight: 520 }}>{data.roi.net_units.toFixed(1)}u net</div>
          </div>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: '#A0A0A0' }}>B/E {data.roi.breakeven_win_rate_pct}%</span>
            <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: data.roi.above_breakeven >= 0 ? '#30d158' : '#ff453a' }}>
              {data.roi.above_breakeven >= 0 ? '+' : ''}{data.roi.above_breakeven.toFixed(1)}% vs B/E
            </span>
          </div>
        </div>
      </div>

      {/* Quality / pipeline KPIs (small chips) */}
      {data?.quality && (
        <div style={{ marginTop: 10, marginBottom: 10, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: '#A0A0A0' }}>
              Pinnacle cov: {data.quality?.last7?.pinnacle?.coverage_pct ?? 0}%
            </span>
            <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: '#A0A0A0' }}>
              Pinnacle agree: {data.quality?.last7?.pinnacle?.agree_pct ?? 0}%
            </span>
            <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: '#A0A0A0' }}>
              Consensus cov: {data.quality?.last7?.consensus?.coverage_pct ?? 0}%
            </span>
            <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: '#A0A0A0' }}>
              CLV |avg|: {data.quality?.last7?.clv_proxy?.avg_abs ?? 0}
            </span>
          </div>
          <span className="app-chip" style={{ padding: '4px 8px', fontSize: 11, color: '#8e8e93' }}>
            Updated: {data?.export_meta?.exported_at ? new Date(data.export_meta.exported_at).toLocaleString() : 'n/a'}
          </span>
        </div>
      )}

      <div
        className="insights-grid"
        style={{
          gap: 12,
          gridTemplateColumns: 'repeat(4, minmax(240px, 1fr))',
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
