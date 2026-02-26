/** @type {import('tailwindcss').Config} */

const COLORS = {
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
};

const SPACING = {
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
};

const RADIUS = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  full: '9999px',
};

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  
  theme: {
    extend: {
      colors: {
        primary: COLORS.primary,
        success: COLORS.success,
        caution: COLORS.caution,
        destructive: COLORS.destructive,
        total: COLORS.total,
        spread: COLORS.spread,
        moneyline: COLORS.moneyline,
        text: {
          primary: COLORS.text.primary,
          secondary: COLORS.text.secondary,
          tertiary: COLORS.text.tertiary,
        },
        bg: {
          DEFAULT: COLORS.background,
          surface: COLORS.surface,
          border: COLORS.border,
        },
      },
      
      fontFamily: {
        sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Text", sans-serif',
        display: '-apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Display", sans-serif',
        mono: '"SF Mono", "Monaco", monospace',
      },
      
      spacing: SPACING,
      
      borderRadius: RADIUS,
      
      boxShadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
        md: '0 2px 4px rgba(0, 0, 0, 0.06)',
        lg: '0 4px 8px rgba(0, 0, 0, 0.08)',
        xl: '0 8px 16px rgba(0, 0, 0, 0.10)',
      },
      
      transitionDuration: {
        DEFAULT: '300ms',
        short: '200ms',
        long: '500ms',
      },
      
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.2, 0.9, 0.5, 1)',
      },
    },
  },
  
  plugins: [],
};
