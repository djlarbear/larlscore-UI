import React from 'react';

interface Q3Pick {
  team: string;
  game: string;
  home_away: string;
  expected_q1q3: number;
  hit_probability: number;
  confidence: number;
  season_q1q3_avg: number;
  recent_q1q3_avg: number;
  hit_rate_100: number;
  recent_hit_rate: number;
  trend: string;
}

interface Q3Parlay {
  teams: string[];
  combined_probability: number;
  estimated_odds: string;
  picks: Q3Pick[];
}

interface Q3Specials {
  date?: string;
  generated_at?: string;
  league_context?: { avg_q1q3: number; base_hit_rate_100: number };
  games_analyzed?: number;
  picks?: Q3Pick[];
  parlays?: Q3Parlay[];
}

interface SpecialsData {
  q3_100?: Q3Specials;
}

interface SpecialsViewProps {
  specials?: SpecialsData;
}

const trendLabel = (trend: string) => {
  if (trend === 'hot') return 'HOT';
  if (trend === 'cold') return 'COLD';
  return '';
};

const probColor = (prob: number) => {
  if (prob >= 0.40) return '#22c55e';
  if (prob >= 0.30) return '#eab308';
  return '#f97316';
};

export default function SpecialsView({ specials }: SpecialsViewProps) {
  const q3 = specials?.q3_100 || {};
  const picks: Q3Pick[] = q3.picks || [];
  const parlays: Q3Parlay[] = q3.parlays || [];
  const league = q3.league_context;

  const sectionStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '4px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff',
  };

  return (
    <div style={{ padding: '0 0 32px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Specials</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
          Long-shot parlays & specialty props
        </div>
      </div>

      {/* Q1-Q3 100+ Section */}
      <div style={{ ...sectionStyle, borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Team Scores 100+ in Q1–Q3</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
              {q3.date || '—'} · {q3.games_analyzed ?? 0} games analyzed
              {league && (
                <span> · League avg: {league.avg_q1q3.toFixed(1)} pts · Base hit rate: {(league.base_hit_rate_100 * 100).toFixed(1)}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Parlays */}
        {parlays.length > 0 ? (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
              Recommended Parlays
            </div>
            {parlays.map((parlay, i) => (
              <div key={i} style={{
                background: 'rgba(168,85,247,0.12)',
                border: '1px solid rgba(168,85,247,0.3)',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>
                    {parlay.teams.join(' + ')}
                  </div>
                  <div style={{
                    background: 'rgba(168,85,247,0.25)',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#c084fc',
                  }}>
                    {parlay.estimated_odds}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  Combined hit prob: <span style={{ color: probColor(parlay.combined_probability), fontWeight: 600 }}>
                    {(parlay.combined_probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Individual Picks */}
        {picks.length > 0 ? (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
              Top Candidates
            </div>
            {picks.map((pick, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>
                      {trendLabel(pick.trend) && <span style={{ fontSize: '10px', fontWeight: 700, color: '#FF9500', marginRight: '4px' }}>{trendLabel(pick.trend)}</span>}{pick.team}
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginLeft: '6px' }}>
                        ({pick.home_away})
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                      {pick.game}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: probColor(pick.hit_probability) }}>
                      {(pick.hit_probability * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>hit prob</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <div>
                    <div style={labelStyle}>Expected Q1-Q3</div>
                    <div style={valueStyle}>{pick.expected_q1q3.toFixed(1)}</div>
                  </div>
                  <div>
                    <div style={labelStyle}>Season Avg</div>
                    <div style={valueStyle}>{pick.season_q1q3_avg.toFixed(1)}</div>
                  </div>
                  <div>
                    <div style={labelStyle}>Recent (L5)</div>
                    <div style={valueStyle}>{pick.recent_q1q3_avg.toFixed(1)}</div>
                  </div>
                  <div>
                    <div style={labelStyle}>Hit Rate</div>
                    <div style={valueStyle}>{(pick.hit_rate_100 * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div style={labelStyle}>Recent Hit</div>
                    <div style={valueStyle}>{(pick.recent_hit_rate * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '24px',
            color: 'rgba(255,255,255,0.35)',
            fontSize: '14px',
          }}>
            <div>No picks today — threshold not met</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>Refreshes daily at 5 AM with tomorrow's games</div>
          </div>
        )}
      </div>

      {/* Future specials placeholder */}
      <div style={{ ...sectionStyle, opacity: 0.5 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '8px' }}>
          More specialty props coming soon
        </div>
      </div>
    </div>
  );
}
