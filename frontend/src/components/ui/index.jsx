import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.js';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  className,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[#003049] text-white hover:bg-[#023f61] focus:ring-[#2C7F91] active:scale-[0.98]',
    secondary:
      'bg-white text-[#003049] border border-[#D0CCC7] hover:bg-[#F8F7F5] focus:ring-[#2C7F91]',
    ghost:
      'text-[#2C7F91] hover:bg-[#F2F2F2] focus:ring-[#2C7F91]',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  );
}

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-[#F2F2F2] text-[#6B7280] border-[#E5E2DE]',
    ocean:   'bg-[#EEF5F8] text-[#2C7F91] border-[#A7BED3]',
    sage:    'bg-[#EEF3EF] text-[#5E8374] border-[#8DAA91]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Input({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#374151]">{label}</label>
      )}
      <input
        className={cn(
          'w-full px-3.5 py-2.5 text-sm bg-white border rounded-md transition-colors placeholder:text-[#9CA3AF]',
          'focus:outline-none focus:ring-2 focus:ring-[#2C7F91] focus:border-[#2C7F91]',
          error
            ? 'border-red-400 focus:ring-red-300'
            : 'border-[#D0CCC7] hover:border-[#A7BED3]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#374151]">{label}</label>
      )}
      <textarea
        className={cn(
          'w-full px-3.5 py-2.5 text-sm bg-white border rounded-md transition-colors placeholder:text-[#9CA3AF] resize-none',
          'focus:outline-none focus:ring-2 focus:ring-[#2C7F91] focus:border-[#2C7F91]',
          error
            ? 'border-red-400 focus:ring-red-300'
            : 'border-[#D0CCC7] hover:border-[#A7BED3]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Card({ children, className, hover = false, ...props }) {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover
    ? { whileHover: { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' } }
    : {};

  return (
    <Component
      className={cn(
        'bg-white rounded-[10px] border border-[#E8E5E1]',
        'shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_4px_12px_rgba(0,0,0,0.04)]',
        className
      )}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
}

export function StarRating({ rating, size = 'sm' }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn(
            sizes[size],
            star <= Math.round(rating) ? 'text-[#C9A84C]' : 'text-[#D0CCC7]'
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-[#F2F2F2] flex items-center justify-center mb-4 text-2xl">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#1a2332] mb-1">{title}</h3>
      <p className="text-sm text-[#6B7280] max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}