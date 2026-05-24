import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full px-3.5 py-2.5 rounded-xl border-2 border-ink-100 bg-white',
        'text-sm placeholder:text-gray-400',
        'focus:border-brand-green focus:ring-0 focus:outline-none',
        'transition-colors',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3.5 py-2.5 rounded-xl border-2 border-ink-100 bg-white',
        'text-sm placeholder:text-gray-400',
        'focus:border-brand-green focus:ring-0 focus:outline-none',
        'transition-colors resize-y',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full px-3.5 py-2.5 rounded-xl border-2 border-ink-100 bg-white',
        'text-sm focus:border-brand-green focus:ring-0 focus:outline-none transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

export function Label({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('block text-sm font-medium text-ink-900 mb-1.5', className)}>
      {children}
    </label>
  );
}
