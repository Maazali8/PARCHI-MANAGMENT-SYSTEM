import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
  isAmount?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, isAmount, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="label">{label}</label>
        )}
        <div className="relative">
          {prefix && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-paper border border-cream-deep rounded-md px-3.5 py-2.5 text-sm
              placeholder:text-ink-muted
              focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/8
              transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isAmount ? 'font-mono text-right' : ''}
              ${prefix ? 'pl-10' : ''}
              ${error ? 'border-danger' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
