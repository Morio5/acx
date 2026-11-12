import { BookOpenText } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizes = {
  sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[10px]' },
  md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-xs' },
  lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-sm' },
};

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const s = sizes[size];
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-primary-500/30 blur-xl rounded-full" />
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 border border-primary-400/30 shadow-lg shadow-primary-600/30">
          <BookOpenText className="w-5 h-5 text-white" />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-display font-bold text-ink-50 ${s.text}`}>Khmer Comic AI</span>
          <span className={`text-ink-400 ${s.sub} tracking-wide`}>Comic Translation Platform</span>
        </div>
      )}
    </div>
  );
}
