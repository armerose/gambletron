/**
 * ENTERPRISE DESIGN SYSTEM
 * 
 * This is the foundation for an elite-level trading UI
 * Standards: Google Material Design 3 + Apple Design System + Bloomberg Terminal quality
 */

// ============================================================================
// SPACING SYSTEM (8px base unit)
// ============================================================================
export const SPACING = {
  xs: '0.25rem',      // 4px
  sm: '0.5rem',       // 8px
  md: '1rem',         // 16px
  lg: '1.5rem',       // 24px
  xl: '2rem',         // 32px
  '2xl': '2.5rem',    // 40px
  '3xl': '3rem',      // 48px
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================
export const TYPOGRAPHY = {
  // Display - Large headlines
  display: {
    lg: 'text-4xl font-bold leading-tight tracking-tight',      // 36px
    md: 'text-3xl font-bold leading-tight tracking-tight',      // 30px
    sm: 'text-2xl font-bold leading-snug tracking-tight',       // 24px
  },
  // Headline - Page titles
  headline: {
    lg: 'text-2xl font-bold leading-snug',                      // 28px
    md: 'text-xl font-bold leading-snug',                       // 20px
    sm: 'text-lg font-semibold leading-snug',                   // 18px
  },
  // Title - Section headers
  title: {
    lg: 'text-lg font-semibold leading-tight',                  // 18px
    md: 'text-base font-semibold leading-tight',                // 16px
    sm: 'text-sm font-semibold leading-tight',                  // 14px
  },
  // Body - Content text
  body: {
    lg: 'text-base font-normal leading-relaxed',                // 16px
    md: 'text-sm font-normal leading-relaxed',                  // 14px
    sm: 'text-xs font-normal leading-relaxed',                  // 12px
  },
  // Label - Form labels
  label: 'text-sm font-medium leading-tight',                   // 14px
  // Caption - Help text
  caption: 'text-xs font-normal leading-tight opacity-70',      // 12px
  // Code - Monospace
  code: 'font-mono text-sm',
} as const;

// ============================================================================
// COLOR SYSTEM (Enterprise + Trading specific)
// ============================================================================
export const COLORS = {
  // Primary - Action, focus, branding
  primary: {
    50: '#f0f4ff',
    100: '#e0e9ff',
    200: '#c2d9ff',
    300: '#a3c4ff',
    400: '#7ca5ff',
    500: '#5b86ff',    // Main brand color
    600: '#4c6ef7',
    700: '#3d5adb',
    800: '#3146b3',
    900: '#2a3a8f',
  },
  // Success - Profitable, positive
  success: {
    50: '#f0fdf4',
    100: '#e0fde8',
    200: '#c0fcd1',
    300: '#a0fbb9',
    400: '#7ffaa2',
    500: '#22c55e',    // Profits
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },
  // Danger - Losses, warnings
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fec5c5',
    300: '#fda9a9',
    400: '#fb7d7d',
    500: '#ef4444',    // Losses
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // Warning - Caution, alerts
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',    // Warnings
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  // Neutral - Backgrounds, text, borders
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Dark mode specific
  dark: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
} as const;

// ============================================================================
// SHADOWS SYSTEM
// ============================================================================
export const SHADOWS = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const RADIUS = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================
export const TRANSITIONS = {
  fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  base: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================
export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================
export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// COMPONENT BASE CLASSES
// ============================================================================
export const COMPONENT_CLASSES = {
  // Card - Base container
  card: cn(
    'rounded-lg border',
    'bg-white dark:bg-neutral-900',
    'border-neutral-200 dark:border-neutral-800',
    'transition-all duration-200',
    'shadow-sm hover:shadow-md'
  ),
  
  // Button - Interactive element
  button: {
    base: cn(
      'inline-flex items-center justify-center gap-2',
      'px-4 py-2.5 rounded-md font-medium text-sm',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    primary: cn(
      'bg-primary-500 text-white',
      'hover:bg-primary-600 active:bg-primary-700',
      'focus:ring-primary-500'
    ),
    secondary: cn(
      'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100',
      'hover:bg-neutral-200 dark:hover:bg-neutral-700',
      'border border-neutral-300 dark:border-neutral-700'
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
  },
  
  // Input - Form input
  input: cn(
    'w-full px-3 py-2 rounded-md text-sm',
    'bg-white dark:bg-neutral-900',
    'border border-neutral-300 dark:border-neutral-700',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'transition-all duration-200'
  ),
  
  // Badge - Status indicator
  badge: cn(
    'inline-flex items-center gap-1',
    'px-2.5 py-1 rounded-full text-xs font-medium',
    'whitespace-nowrap'
  ),
  
  // Table cell
  tableCell: cn(
    'px-4 py-3 text-sm',
    'border-neutral-200 dark:border-neutral-800'
  ),
};

// ============================================================================
// TRADING-SPECIFIC COLORS
// ============================================================================
export const TRADING_COLORS = {
  profit: COLORS.success[500],
  loss: COLORS.danger[500],
  neutral: COLORS.neutral[500],
  buy: COLORS.success[500],
  sell: COLORS.danger[500],
  uptrend: COLORS.success[500],
  downtrend: COLORS.danger[500],
  alert: COLORS.warning[500],
};

// Utility function for class names
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'running':
    case 'active':
    case 'connected':
      return COLORS.success[500];
    case 'stopped':
    case 'inactive':
    case 'error':
      return COLORS.danger[500];
    case 'paused':
    case 'warning':
      return COLORS.warning[500];
    default:
      return COLORS.neutral[500];
  }
}

export function getStatusBgColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'running':
    case 'active':
    case 'connected':
      return 'bg-success-100 dark:bg-success-900/30';
    case 'stopped':
    case 'inactive':
    case 'error':
      return 'bg-danger-100 dark:bg-danger-900/30';
    case 'paused':
    case 'warning':
      return 'bg-warning-100 dark:bg-warning-900/30';
    default:
      return 'bg-neutral-100 dark:bg-neutral-800';
  }
}
