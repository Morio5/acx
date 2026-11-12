import { useState, useEffect, type FormEvent } from 'react';
import { User as UserIcon, Mail, Languages, Type, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Spinner';
import { SOURCE_LANGUAGES, KHMER_FONTS, type SourceLanguage, type KhmerFont } from '@/types';

export function SettingsPage() {
  const { profile, user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<SourceLanguage>('japanese');
  const [khmerFont, setKhmerFont] = useState<KhmerFont>('noto-sans-khmer');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setSourceLanguage(profile.default_source_language);
      setKhmerFont(profile.preferred_khmer_font);
    }
  }, [profile]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        default_source_language: sourceLanguage,
        preferred_khmer_font: khmerFont,
      })
      .eq('id', profile?.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!profile) {
    return (
      <div className="space-y-6 animate-slide-up">
        <h1 className="text-2xl font-display font-bold text-ink-50">Settings</h1>
        <Card>
          <p className="text-ink-400 text-sm">Loading your profile...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-ink-50">Settings</h1>
        <p className="mt-1 text-ink-400">Manage your profile and preferences</p>
      </div>

      {/* Account info */}
      <Card>
        <h2 className="text-lg font-display font-semibold text-ink-100 mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-800/60">
            <Mail className="w-5 h-5 text-ink-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-ink-400">Email</p>
              <p className="text-sm text-ink-100 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile form */}
      <form onSubmit={handleSave}>
        <Card className="space-y-5">
          <h2 className="text-lg font-display font-semibold text-ink-100">Profile Preferences</h2>

          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink-200">
              Default Source Language
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SOURCE_LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => setSourceLanguage(lang.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    sourceLanguage === lang.value
                      ? 'bg-primary-600/15 border border-primary-600/40 text-primary-200'
                      : 'bg-ink-800/60 border border-ink-600/60 text-ink-300 hover:border-ink-500'
                  }`}
                >
                  <Languages className="w-4 h-4" />
                  <div className="flex flex-col items-start">
                    <span>{lang.label}</span>
                    <span className="text-xs text-ink-500">{lang.nativeLabel}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink-200 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Preferred Khmer Font
            </label>
            <div className="space-y-2">
              {KHMER_FONTS.map((font) => (
                <button
                  key={font.value}
                  type="button"
                  onClick={() => setKhmerFont(font.value)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                    khmerFont === font.value
                      ? 'bg-primary-600/15 border border-primary-600/40 text-primary-200'
                      : 'bg-ink-800/60 border border-ink-600/60 text-ink-300 hover:border-ink-500'
                  }`}
                >
                  <span>{font.label}</span>
                  {khmerFont === font.value && <Check className="w-4 h-4 text-primary-400" />}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-error-600/10 border border-error-600/30 animate-slide-up">
              <AlertCircle className="w-5 h-5 text-error-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error-300">{error}</p>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-success-600/10 border border-success-600/30 animate-slide-up">
              <Check className="w-5 h-5 text-success-400" />
              <p className="text-sm text-success-400">Settings saved successfully</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </Card>
      </form>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-ink-800/40 border border-ink-700/40">
        <UserIcon className="w-5 h-5 text-ink-400 flex-shrink-0" />
        <p className="text-xs text-ink-400">
          Member since {new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
