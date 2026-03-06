import React from 'react';

interface LarlScoreLogoProps {
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

// App-grade squircle icon — blue gradient + gloss + glow
const LIcon: React.FC<{ px: number }> = ({ px }) => (
  <svg
    width={px}
    height={px}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      display: 'block',
      flexShrink: 0,
      filter: 'drop-shadow(0 2px 8px rgba(10,132,255,0.55))',
    }}
  >
    <defs>
      {/* Main blue gradient */}
      <linearGradient id="lgBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2E9BFF" />
        <stop offset="100%" stopColor="#0050E6" />
      </linearGradient>
      {/* Gloss overlay */}
      <linearGradient id="lgGloss" x1="0" y1="0" x2="0" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="white" stopOpacity="0.22" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Squircle base */}
    <rect width="40" height="40" rx="10" fill="url(#lgBg)" />

    {/* Gloss sheen — top half only */}
    <rect width="40" height="20" rx="10" fill="url(#lgGloss)" />
    <rect y="10" width="40" height="10" fill="url(#lgGloss)" />

    {/* White "L" — chunky, well-proportioned */}
    <path
      d="M12 9 L12 31 L29 31 L29 25.5 L18 25.5 L18 9 Z"
      fill="white"
    />
  </svg>
);

export const LarlScoreLogo: React.FC<LarlScoreLogoProps> = ({ size = 'large', onClick }) => {
  const sizeMap = { small: 16, medium: 22, large: 32 };
  const iconMap = { small: 22, medium: 30, large: 42 };
  const fontSize = sizeMap[size];
  const iconPx = iconMap[size];

  return (
    <div
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: size === 'small' ? 7 : 10,
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
      }}
      onMouseLeave={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
      }}
    >
      <LIcon px={iconPx} />
      <div style={{ fontSize: `${fontSize}px`, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.5px' }}>
        <span style={{ color: '#FFFFFF' }}>Larl</span>
        <span style={{ color: '#0A84FF' }}>Score</span>
      </div>
    </div>
  );
};

export default LarlScoreLogo;
