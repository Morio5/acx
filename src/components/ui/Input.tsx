import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-ink-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input-base ${error ? 'border-error-500 focus:ring-error-500/40 focus:border-error-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-error-400 animate-slide-up">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
