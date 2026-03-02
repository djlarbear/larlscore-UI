import React from 'react';

interface LarlScoreLogoProps {
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export const LarlScoreLogo: React.FC<LarlScoreLogoProps> = ({ size = 'large', onClick }) => {
  const sizeMap = {
    small: { svg: 48, text: 20, icon: 32 },
    medium: { svg: 80, text: 32, icon: 50 },
    large: { svg: 120, text: 48, icon: 75 }
  };

  const s = sizeMap[size];

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Logo Icon - Stylized Target/Score Indicator */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A84FF" />
            <stop offset="50%" stopColor="#34C759" />
            <stop offset="100%" stopColor="#FF9500" />
          </linearGradient>
        </defs>

        {/* Outer Ring */}
        <circle cx="50" cy="50" r="45" stroke="url(#logoGradient)" strokeWidth="3" opacity="0.8" />

        {/* Middle Ring */}
        <circle cx="50" cy="50" r="30" stroke="url(#logoGradient)" strokeWidth="2.5" opacity="0.6" />

        {/* Center Dot */}
        <circle cx="50" cy="50" r="8" fill="url(#logoGradient)" />

        {/* Accent Lines - Crosshair Style */}
        <line x1="50" y1="15" x2="50" y2="35" stroke="url(#logoGradient)" strokeWidth="2" opacity="0.7" />
        <line x1="50" y1="65" x2="50" y2="85" stroke="url(#logoGradient)" strokeWidth="2" opacity="0.7" />
        <line x1="15" y1="50" x2="35" y2="50" stroke="url(#logoGradient)" strokeWidth="2" opacity="0.7" />
        <line x1="65" y1="50" x2="85" y2="50" stroke="url(#logoGradient)" strokeWidth="2" opacity="0.7" />
      </svg>

      {/* Text Logo with Gradient */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            fontSize: `${s.text}px`,
            fontWeight: '900',
            background: 'linear-gradient(135deg, #0A84FF 0%, #34C759 50%, #FF9500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            lineHeight: 1,
            letterSpacing: '-1px',
          }}
        >
          LarlScore
        </div>
        <div
          style={{
            fontSize: `${s.text * 0.35}px`,
            fontWeight: '600',
            color: '#8E8E93',
            margin: 0,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          Picks & Metrics
        </div>
      </div>
    </div>
  );
};

export default LarlScoreLogo;
