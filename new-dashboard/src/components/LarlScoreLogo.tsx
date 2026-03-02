import React from 'react';

interface LarlScoreLogoProps {
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export const LarlScoreLogo: React.FC<LarlScoreLogoProps> = ({ size = 'large', onClick }) => {
  const sizeMap = {
    small: 20,
    medium: 32,
    large: 48
  };

  const fontSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.style.transform = 'scale(1)';
      }}
    >
      <div
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: '900',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #A8A8A8 50%, #4A4A4A 100%)',
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
    </div>
  );
};

export default LarlScoreLogo;
