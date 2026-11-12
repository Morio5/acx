import { BookOpenText, FolderPlus, Languages, Upload, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const roadmap = [
  { icon: FolderPlus, label: 'Create Projects', status: 'coming' },
  { icon: Upload, label: 'Upload Comics', status: 'coming' },
  { icon: Languages, label: 'AI Translation', status: 'planned' },
  { icon: FileText, label: 'Export & Share', status: 'planned' },
];

const sourceLanguages = ['Chinese', 'Korean', 'Japanese', 'English'];

export function DashboardPage() {
  const { profile, user } = useAuth();

  const greeting = profile?.display_name
    ? `Welcome back, ${profile.display_name}`
    : user?.email
      ? `Welcome, ${user.email}`
      : 'Welcome';

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-ink-50">{greeting}</h1>
        <p className="mt-1 text-ink-400">Manage your comic translation projects</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Projects" value="0" icon={BookOpenText} />
        <StatCard label="Chapters" value="0" icon={FileText} />
        <StatCard label="Pages" value="0" icon={Upload} />
        <StatCard label="Languages" value={String(sourceLanguages.length)} icon={Languages} />
      </div>

      {/* Empty state */}
      <div className="glass-card p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/10 border border-primary-600/20 mb-4">
          <BookOpenText className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-xl font-display font-semibold text-ink-100">No projects yet</h2>
        <p className="mt-2 text-ink-400 max-w-md mx-auto">
          Your project management and comic upload features will be available in the next phase.
          You'll be able to create translation projects for Manhua, Manhwa, Manga, and English comics.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {sourceLanguages.map((lang) => (
            <span
              key={lang}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-ink-700/60 border border-ink-600/60 text-ink-200"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Roadmap preview */}
      <div>
        <h2 className="text-lg font-display font-semibold text-ink-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" />
          What's Coming
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roadmap.map((item) => (
            <div
              key={item.label}
              className="glass-card p-5 flex flex-col items-center text-center gap-3 opacity-70"
            >
              <div className="w-12 h-12 rounded-xl bg-ink-700/60 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-ink-300" />
              </div>
              <span className="text-sm font-medium text-ink-200">{item.label}</span>
              <span className="text-xs text-ink-500 uppercase tracking-wide">
                {item.status === 'coming' ? 'Next Phase' : 'Planned'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof BookOpenText }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary-600/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-400" />
        </div>
      </div>
      <p className="text-2xl font-display font-bold text-ink-50">{value}</p>
      <p className="text-sm text-ink-400 mt-0.5">{label}</p>
    </div>
  );
}
