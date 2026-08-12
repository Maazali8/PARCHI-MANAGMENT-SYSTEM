import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'default' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'text-success bg-success-bg',
  warning: 'text-warning bg-warning-bg',
  danger: 'text-danger bg-danger-bg',
  info: 'text-info bg-cream-warm',
  default: 'text-ink-light bg-cream-warm',
};

export function Badge({ variant = 'default', children, dot = true }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${variantStyles[variant]}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// Helpers for common statuses
export function ParchiStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    PARTIAL: { variant: 'warning', label: 'Partial' },
    PAID: { variant: 'success', label: 'Paid' },
    ADDED_TO_KHATA: { variant: 'info', label: 'Khata' },
    RETURNED: { variant: 'danger', label: 'Returned' },
  };
  const { variant, label } = map[status] || { variant: 'default' as BadgeVariant, label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

export function VerificationBadge({ verified }: { verified: boolean }) {
  return verified
    ? <Badge variant="success">Verified</Badge>
    : <Badge variant="warning">Pending</Badge>;
}
