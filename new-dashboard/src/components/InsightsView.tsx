/**
 * InsightsView — compact app-style learning stats
 */

import React, { useEffect, useState } from 'react';
import BettingAPI from '../utils/api-new';

interface Bucket {
  wins: number;
  losses: number;
  total: number;
  win_rate: number;
  record: string;
}

interface Insights {
  overall_win_rate: number;
  roi: {
    record: string;
    net_units: number;
    roi_pct: number;
  };
  by_bet_type: Record<string, Bucket>;
  by_sport: Record<string, Bucket>;
  by_confidence: Record<string, Bucket>;
  by_edge: Record<string, Bucket>;
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
  <div style={{ padding: '10px 0', gap: 10, display: 'grid', gridTemplateColumns: '1fr auto', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
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
  <div className="app-surface" style={{ borderRadius: 16, padding: '14px 16px 6px', marginBottom: 14 }}>
    <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 760, marginBottom: 12 }}>{title}</div>
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
      .then((d) => {
        setData(d);
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
    <div style={{ padding: '6px 0 8px' }}>

      <div style={{ padding: '4px 0 16px', marginBottom: 12, borderBottom: `1px solid ${roiPositive ? 'rgba(48,209,88,0.2)' : 'rgba(255,69,58,0.2)'}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12, marginBottom: 8 }}>
          {/* Overall WR card */}
          <div className="app-card app-surface" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '14px 10px', borderRadius: '12px', gap: '6px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)',
          }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Overall WR</span>
            <span style={{ fontSize: 36, fontWeight: 800, color: winRateColor(data.overall_win_rate), fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1 }}>{data.overall_win_rate.toFixed(1)}%</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{data.roi.record}</span>
          </div>
          {/* ROI card */}
          <div className="app-card app-surface" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '14px 10px', borderRadius: '12px', gap: '6px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)',
          }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>ROI @ -110</span>
            <span style={{ fontSize: 36, fontWeight: 800, color: roiPositive ? 'var(--color-success)' : 'var(--color-destructive)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1 }}>{data.roi.roi_pct.toFixed(1)}%</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{data.roi.net_units.toFixed(1)}u net</span>
          </div>
        </div>

      </div>

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
