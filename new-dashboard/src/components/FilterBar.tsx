/**
 * FilterBar - Dynamic filters with sorting and active indicators
 */

import React, { useState, useEffect } from 'react';
import { DateStat } from '../utils/api-new';

interface FilterBarProps {
  onFilterChange: (filters: {
    date?: string;
    sport?: string;
    bet_type?: string;
    sort?: string;
  }) => void;
  dates: DateStat[];
  sports: string[];
  betTypes: string[];
  currentSort?: string;
  currentDate?: string;
  currentSport?: string;
  currentBetType?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  onFilterChange, 
  dates, 
  sports, 
  betTypes,
  currentSort = 'date-desc',
  currentDate = '',
  currentSport = '',
  currentBetType = '',
}) => {
  const [date, setDate] = useState(currentDate);
  const [sport, setSport] = useState(currentSport);
  const [betType, setBetType] = useState(currentBetType);
  const [sort, setSort] = useState(currentSort);

  // Keep internal state in sync when parent values change
  useEffect(() => { setSort(currentSort); }, [currentSort]);
  useEffect(() => { setDate(currentDate); }, [currentDate]);
  useEffect(() => { setSport(currentSport); }, [currentSport]);
  useEffect(() => { setBetType(currentBetType); }, [currentBetType]);

  const handleChange = (type: string, value: string) => {
    let newDate = date;
    let newSport = sport;
    let newBetType = betType;
    let newSort = sort;

    if (type === 'date') newDate = value;
    if (type === 'sport') newSport = value;
    if (type === 'bet_type') newBetType = value;
    if (type === 'sort') newSort = value;

    setDate(newDate);
    setSport(newSport);
    setBetType(newBetType);
    setSort(newSort);

    onFilterChange({
      date: newDate || undefined,
      sport: newSport || undefined,
      bet_type: newBetType || undefined,
      sort: newSort,
    });
  };

  const isFilterActive = date || sport || betType || sort !== 'date-desc';
  const activeCount = [date, sport, betType, sort !== 'date-desc'].filter(Boolean).length;

  const clearAll = () => {
    setDate('');
    setSport('');
    setBetType('');
    setSort('date-desc');
    onFilterChange({ sort: 'date-desc' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Active Filters Indicator + Clear All */}
      {isFilterActive && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
          border: '1px solid var(--color-primary)',
          borderRadius: '8px',
          padding: '8px 12px',
        }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-primary)', margin: 0 }}>
            {activeCount} filter{activeCount !== 1 ? 's' : ''} active
          </p>
          <button
            onClick={clearAll}
            style={{
              background: 'rgba(255,69,58,0.15)',
              border: '1px solid var(--color-destructive)',
              borderRadius: '6px',
              color: 'var(--color-destructive)',
              fontSize: '11px',
              fontWeight: '600',
              padding: '3px 10px',
              cursor: 'pointer',
              letterSpacing: '0.3px',
            }}
          >
            ✕ Clear All
          </button>
        </div>
      )}

      {/* Date Filter */}
      <div>
        <label style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          color: date ? 'var(--color-primary)' : '#A0A0A0', 
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px', 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px' 
        }}>
          Date {date && <span style={{ color: 'var(--color-primary)', fontSize: '10px' }}>✓</span>}
        </label>
        <select
          value={date}
          onChange={(e) => handleChange('date', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#0d0d0d',
            color: date ? 'var(--color-primary)' : '#FFFFFF',
            border: date ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <option value="">All Dates</option>
          {dates.map((d) => (
            <option key={d.date} value={d.date}>
              {d.date} ({d.total} bets)
            </option>
          ))}
        </select>
      </div>

      {/* Sport Filter */}
      <div>
        <label style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          color: sport ? 'var(--color-primary)' : '#A0A0A0', 
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px', 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px' 
        }}>
          Sport {sport && <span style={{ color: 'var(--color-primary)', fontSize: '10px' }}>●</span>}
        </label>
        <select
          value={sport}
          onChange={(e) => handleChange('sport', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#0d0d0d',
            color: sport ? 'var(--color-primary)' : '#FFFFFF',
            border: sport ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <option value="">All Sports</option>
          {sports.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Bet Type Filter */}
      <div>
        <label style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          color: betType ? 'var(--color-primary)' : '#A0A0A0', 
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px', 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px' 
        }}>
          Bet Type {betType && <span style={{ color: 'var(--color-primary)', fontSize: '10px' }}>✓</span>}
        </label>
        <select
          value={betType}
          onChange={(e) => handleChange('bet_type', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#0d0d0d',
            color: betType ? 'var(--color-primary)' : '#FFFFFF',
            border: betType ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <option value="">All Bet Types</option>
          {betTypes.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div>
        <label style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          color: sort !== 'date-desc' ? '#FF9500' : '#A0A0A0', 
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px', 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px' 
        }}>
          Sort By {sort !== 'date-desc' && <span style={{ color: '#FF9500', fontSize: '10px' }}>✓</span>}
        </label>
        <select
          value={sort}
          onChange={(e) => handleChange('sort', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#0d0d0d',
            color: sort !== 'date-desc' ? '#FF9500' : '#FFFFFF',
            border: sort !== 'date-desc' ? '1px solid #FF9500' : '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="win-desc">Win/Loss (W→L)</option>
          <option value="win-asc">Win/Loss (L→W)</option>
          <option value="confidence-desc">Highest Confidence</option>
          <option value="confidence-asc">Lowest Confidence</option>
          <option value="edge-desc">Highest Edge</option>
          <option value="edge-asc">Lowest Edge</option>
          <option value="larlscore-desc">Highest LarlScore</option>
          <option value="larlscore-asc">Lowest LarlScore</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
