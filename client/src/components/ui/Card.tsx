import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = '', padding = true }: CardProps) {
  const hasBg = className.split(' ').some(c => c.startsWith('bg-'));
  const hasBorderColor = className.split(' ').some(c => c.startsWith('border-') && c !== 'border');
  const hasBorderNone = className.includes('border-none');

  const bgClass = hasBg ? '' : 'bg-paper';
  let borderClass = 'border border-cream-deep';
  if (hasBorderNone) {
    borderClass = '';
  } else if (hasBorderColor) {
    borderClass = 'border';
  }

  return (
    <div className={`${bgClass} ${borderClass} rounded-lg ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  change?: { value: number; label: string };
  className?: string;
}

export function StatCard({ label, value, change, className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <p className="label-xs mb-3">{label}</p>
      <p className="amount-hero text-ink">{value}</p>
      {change && (
        <p className={`text-xs mt-2 ${change.value >= 0 ? 'text-success' : 'text-danger'}`}>
          {change.value >= 0 ? '↑' : '↓'} {Math.abs(change.value)}% {change.label}
        </p>
      )}
    </Card>
  );
}
