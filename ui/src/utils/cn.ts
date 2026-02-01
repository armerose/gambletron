export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes
    .filter((cls) => typeof cls === 'string')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getStatusColor(status: string): string {
  const statusColorMap: Record<string, string> = {
    'success': 'text-success-600',
    'danger': 'text-danger-600',
    'warning': 'text-warning-600',
    'info': 'text-primary-600',
    'neutral': 'text-neutral-600',
  };
  return statusColorMap[status] || 'text-neutral-600';
}

export function getStatusBgColor(status: string): string {
  const statusBgMap: Record<string, string> = {
    'success': 'bg-success-100 dark:bg-success-900/20',
    'danger': 'bg-danger-100 dark:bg-danger-900/20',
    'warning': 'bg-warning-100 dark:bg-warning-900/20',
    'info': 'bg-primary-100 dark:bg-primary-900/20',
    'neutral': 'bg-neutral-100 dark:bg-neutral-800',
  };
  return statusBgMap[status] || 'bg-neutral-100 dark:bg-neutral-800';
}
