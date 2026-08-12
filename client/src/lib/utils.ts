/**
 * Format a number as Pakistani Rupees: Rs. XX,XXX
 */
export function formatRs(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return 'Rs. 0';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-PK');
  return isNegative ? `- Rs. ${formatted}` : `Rs. ${formatted}`;
}

/**
 * Format a number in short form: 145.2K, 2.1M
 */
export function formatRsShort(amount: number): string {
  if (amount >= 1000000) return `Rs. ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(1)}K`;
  return `Rs. ${amount.toLocaleString('en-PK')}`;
}

/**
 * Format date: "08 Aug 2025" or "08 Aug" for current year
 */
export function formatDate(dateStr: string | Date): string {
  const d = new Date(dateStr);
  const now = new Date();
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en', { month: 'short' });
  if (d.getFullYear() === now.getFullYear()) {
    return `${day} ${month}`;
  }
  return `${day} ${month} ${d.getFullYear()}`;
}

/**
 * Format date for display: "Thursday, 08 Aug"
 */
export function formatDateLong(dateStr?: string | Date): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const day = d.toLocaleString('en', { weekday: 'short' });
  const date = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en', { month: 'short' });
  return `${day}, ${date} ${month}`;
}

/**
 * Format time: "2:30 PM"
 */
export function formatTime(dateStr: string | Date): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current month as YYYY-MM
 */
export function currentMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Calculate percentage change between two numbers
 */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
