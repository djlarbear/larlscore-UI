import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'featured' | 'elevated';
  accentColor?: string;
  onClick?: () => void;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  accentColor = '#0A84FF',
  onClick,
  className = '',
  padding = 'md',
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const baseClasses = `
    rounded-lg border
    transition-all duration-200
    ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
  `;
  
  const darkModeStyle = {
    backgroundColor: '#1a1a1a',
    borderColor: '#2a2a2a',
  };

  const variantClasses = {
    default: 'shadow-sm',
    featured: `shadow-md border-l-4 hover:shadow-lg`,
    elevated: 'shadow-md hover:shadow-lg',
  };

  const style = variant === 'featured' ? { borderLeftColor: accentColor } : {};

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className}
      `}
      onClick={onClick}
      style={{ ...darkModeStyle, ...style }}
      role="article"
      tabIndex={onClick ? 0 : -1}
      onKeyPress={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
};

export default Card;
