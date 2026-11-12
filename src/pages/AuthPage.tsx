import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/Logo';

type Mode = 'signin' | 'signup';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const result =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, displayName || undefined);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="glass rounded-3xl p-8 shadow-2xl shadow-black/40">
          <div className="flex flex-col items-center mb-8">
            <Logo size="lg" showText={false} />
            <h1 className="mt-4 text-2xl font-display font-bold text-ink-50">
              Khmer Comic AI
            </h1>
            <p className="mt-1 text-sm text-ink-400 text-center">
              Translate Manhua, Manhwa, Manga & comics into Khmer
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-ink-800/60 rounded-xl mb-6">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'signin' ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' : 'text-ink-300 hover:text-ink-100'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'signup' ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' : 'text-ink-300 hover:text-ink-100'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 pointer-events-none z-10" />
                <Input
                  type="text"
                  name="displayName"
                  label="Display Name (optional)"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-11"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-[42px] -translate-y-1/2 w-5 h-5 text-ink-400 pointer-events-none z-10" />
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-11"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-[42px] -translate-y-1/2 w-5 h-5 text-ink-400 pointer-events-none z-10" />
              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-11"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-error-600/10 border border-error-600/30 animate-slide-up">
                <AlertCircle className="w-5 h-5 text-error-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error-300">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <button
            onClick={switchMode}
            className="mt-5 w-full text-center text-sm text-ink-400 hover:text-ink-200 transition-colors"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-ink-500 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Free and open-source AI tools
        </p>
      </div>
    </div>
  );
}
