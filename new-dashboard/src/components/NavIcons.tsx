import React from 'react';

// Minimal, Apple-like glyph set (no external deps). Stroke is currentColor.
// Size is controlled by parent via CSS/inline style.

type IconProps = { size?: number; className?: string };

const base = (size: number): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export const HomeIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 10v10h14V10" />
  </svg>
);

export const HistoryIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M12 8v5l3 2" />
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 5v4h4" />
  </svg>
);

export const InsightsIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M4 19V9" />
    <path d="M10 19V5" />
    <path d="M16 19v-7" />
    <path d="M22 19v-11" />
  </svg>
);

export const SpecialsIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);
