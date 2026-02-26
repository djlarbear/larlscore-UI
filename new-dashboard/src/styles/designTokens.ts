/**
 * Design Tokens - Single source of truth for all design values
 * Maps to Tailwind CSS configuration and CSS custom properties
 */

export const COLORS = {
  primary: '#0A84FF',
  success: '#34C759',
  caution: '#FF9500',
  destructive: '#FF3B30',
  
  total: '#34C759',
  spread: '#FF9500',
  moneyline: '#FF3B30',
  
  text: {
    primary: '#000000',
    secondary: '#333333',
    tertiary: '#8E8E93',
  },
  
  background: '#F5F5F7',
  surface: '#FFFFFF',
  border: '#E5E5EA',
  
  states: {
    hover: '#F5F5F7',
    active: '#E5E5EA',
    disabled: '#CCCCCC',
    focus: '#0A84FF',
  },
} as const;

export const TYPOGRAPHY = {
  font: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Text", sans-serif',
    display: '-apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Display", sans-serif',
    mono: '"SF Mono", "Monaco", monospace',
  },
  
  scale: {
    h1: {
      size: '28px',
      weight: 700,
      lineHeight: '1.2',
      letterSpacing: '+0.3px',
    },
    h2: {
      size: '22px',
      weight: 700,
      lineHeight: '1.2',
      letterSpacing: '+0.2px',
    },
    h3: {
      size: '18px',
      weight: 600,
      lineHeight: '1.2',
      letterSpacing: '+0.1px',
    },
    bodyLarge: {
      size: '16px',
      weight: 400,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    body: {
      size: '14px',
      weight: 400,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    caption: {
      size: '12px',
      weight: 500,
      lineHeight: '1.4',
      letterSpacing: '+0.05px',
    },
  },
} as const;

export const SPACING = {
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
} as const;

export const SHADOWS = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
  md: '0 2px 4px rgba(0, 0, 0, 0.06)',
  lg: '0 4px 8px rgba(0, 0, 0, 0.08)',
  xl: '0 8px 16px rgba(0, 0, 0, 0.10)',
  
  card: {
    default: '0 1px 3px rgba(0, 0, 0, 0.04)',
    hover: '0 4px 8px rgba(0, 0, 0, 0.08)',
    active: '0 2px 4px rgba(0, 0, 0, 0.06)',
  },
} as const;

export const RADIUS = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  full: '9999px',
} as const;

export const TRANSITIONS = {
  duration: {
    short: '200ms',
    standard: '300ms',
    long: '500ms',
  },
  
  easing: {
    out: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.2, 0.9, 0.5, 1)',
  },
  
  button: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  color: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;
