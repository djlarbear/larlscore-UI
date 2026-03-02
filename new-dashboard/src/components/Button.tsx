import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className = '',
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      inline-flex items-center justify-center gap-2
      font-semibold rounded-[10px] cursor-pointer
      transition-all duration-200
      disabled:opacity-60 disabled:cursor-not-allowed
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
    `;

    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-blue-700 active:bg-blue-900',
      secondary: 'text-primary border hover:opacity-80',
      tertiary: 'bg-transparent text-primary underline hover:text-blue-700',
      destructive: 'bg-destructive text-white hover:bg-red-900',
    };
    
    const buttonStyle = variant === 'secondary' ? { backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' } : {};

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm h-8',
      md: 'px-6 py-3 text-base h-11',
      lg: 'px-8 py-4 text-lg h-14',
    };

    const fullWidthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={buttonStyle}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidthClass}
          ${className}
        `}
        aria-busy={isLoading}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
