'use client';
import { cn } from '@/lib/utils';
import { forwardRef, ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants: Record<string, string> = {
  primary:   'bg-brand-green hover:bg-brand-green-dark text-white shadow-sm disabled:opacity-50',
  secondary: 'bg-white border-2 border-ink-900 text-ink-900 hover:bg-ink-100',
  ghost:     'bg-transparent text-ink-900 hover:bg-ink-100',
  danger:    'bg-red-600 hover:bg-red-700 text-white',
  yellow:    'bg-brand-yellow hover:bg-brand-yellow-dark text-ink-900 font-semibold',
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green',
        'disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
