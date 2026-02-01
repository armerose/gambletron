import React from 'react';
import { cn } from '../../utils/cn';

/**
 * ELITE CARD COMPONENT
 * Premium card with perfect spacing, shadows, and hover effects
 */
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hover?: boolean;
    elevated?: boolean;
  }
>(({ className, hover = true, elevated = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border border-neutral-200 dark:border-neutral-800',
      'bg-white dark:bg-neutral-900',
      'transition-all duration-300',
      elevated ? 'shadow-lg' : 'shadow-sm',
      hover && 'hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

/**
 * ELITE CARD HEADER
 */
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-6 py-4 border-b border-neutral-200 dark:border-neutral-800', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

/**
 * ELITE CARD TITLE
 */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold leading-tight text-neutral-900 dark:text-neutral-100', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

/**
 * ELITE CARD DESCRIPTION
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-600 dark:text-neutral-400 mt-1', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

/**
 * ELITE CARD CONTENT
 */
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
));
CardContent.displayName = 'CardContent';

/**
 * ELITE CARD FOOTER
 */
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-6 py-4 border-t border-neutral-200 dark:border-neutral-800',
      'bg-neutral-50 dark:bg-neutral-800/50 rounded-b-xl',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

/**
 * ELITE BUTTON COMPONENT
 * Production-grade button with all states
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
      'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      fullWidth && 'w-full',
      isLoading && 'opacity-75 cursor-wait'
    );

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs h-8',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12',
    };

    const variantClasses = {
      primary: cn(
        'bg-brand-500 text-white',
        'hover:bg-brand-600 active:bg-brand-700',
        'focus:ring-brand-500 dark:focus:ring-offset-neutral-900'
      ),
      secondary: cn(
        'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100',
        'hover:bg-neutral-200 dark:hover:bg-neutral-700',
        'border border-neutral-300 dark:border-neutral-700',
        'focus:ring-neutral-500'
      ),
      success: cn(
        'bg-success-500 text-white',
        'hover:bg-success-600 active:bg-success-700',
        'focus:ring-success-500'
      ),
      danger: cn(
        'bg-danger-500 text-white',
        'hover:bg-danger-600 active:bg-danger-700',
        'focus:ring-danger-500'
      ),
      ghost: cn(
        'text-neutral-700 dark:text-neutral-300',
        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        'focus:ring-neutral-500'
      ),
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
        {...props}
      >
        {isLoading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

/**
 * ELITE INPUT COMPONENT
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg text-sm font-medium',
          'bg-white dark:bg-neutral-800',
          'border-2 transition-all duration-200',
          error
            ? 'border-danger-500 focus:border-danger-500 focus:ring-2 focus:ring-danger-100 dark:focus:ring-danger-900/20'
            : 'border-neutral-300 dark:border-neutral-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/20',
          'placeholder:text-neutral-500 dark:placeholder:text-neutral-400',
          'disabled:bg-neutral-100 dark:disabled:bg-neutral-900 disabled:text-neutral-500 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{helperText}</p>}
    </div>
  )
);
Input.displayName = 'Input';

/**
 * ELITE BADGE COMPONENT
 * Status badges with perfect sizing
 */
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-xs',
    };

    const variantClasses = {
      primary: 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300',
      success: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300',
      danger: 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300',
      warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300',
      neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap',
          'transition-all duration-200',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

/**
 * ELITE GRID LAYOUT
 * Perfect spacing for content grids
 */
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 3, gap = 'lg', ...props }, ref) => {
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };

    const gapClasses = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    return (
      <div
        ref={ref}
        className={cn('grid', colClasses[cols], gapClasses[gap], className)}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';

/**
 * ELITE FLEX LAYOUT
 */
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, direction = 'row', justify = 'start', align = 'center', gap = 'md', ...props }, ref) => {
    const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';
    const justifyClass = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    }[justify];
    const alignClass = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    }[align];
    const gapClass = {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    }[gap];

    return (
      <div
        ref={ref}
        className={cn('flex', directionClass, justifyClass, alignClass, gapClass, className)}
        {...props}
      />
    );
  }
);
Flex.displayName = 'Flex';

/**
 * ELITE STAT COMPONENT
 * For displaying metrics and KPIs
 */
interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  direction?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ label, value, unit, trend, direction = 'neutral', icon, className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</p>
        {icon && <div className="text-neutral-400">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-1">
        <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
        {unit && <p className="text-sm text-neutral-600 dark:text-neutral-400">{unit}</p>}
      </div>
      {trend !== undefined && (
        <p
          className={cn(
            'text-xs font-semibold',
            direction === 'up' && 'text-success-600 dark:text-success-400',
            direction === 'down' && 'text-danger-600 dark:text-danger-400',
            direction === 'neutral' && 'text-neutral-600 dark:text-neutral-400'
          )}
        >
          {direction === 'up' && '↑ '}
          {direction === 'down' && '↓ '}
          {Math.abs(trend)}% vs last period
        </p>
      )}
    </div>
  )
);
Stat.displayName = 'Stat';
