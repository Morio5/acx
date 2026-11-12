import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function Spinner({ size = 'md', label }: SpinnerProps) {
  const dimensions = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${dimensions[size]} animate-spin text-primary-500`} />
      {label && <p className="text-sm text-ink-300">{label}</p>}
    </div>
  );
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950">
      <Spinner size="lg" label={label} />
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass-card p-6 ${className}`}>{children}</div>;
}
