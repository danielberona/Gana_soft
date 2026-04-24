import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  return (
    <div className="space-y-8 stagger-children">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('appName', { ns: 'common' })} — Gestión Inteligente</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { key: 'totalAnimals', value: '124', icon: '🐄' },
          { key: 'pregnant', value: '18', icon: '🤰' },
          { key: 'upcomingBirths', value: '3', icon: '📅' },
          { key: 'pendingTasks', value: '12', icon: '✅' },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-xl border border-border flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t(stat.key)}</p>
              <h2 className="text-2xl font-bold mt-1">{stat.value}</h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 bg-card p-6 rounded-xl border border-border min-h-[300px]">
          <h3 className="font-semibold mb-4">{t('recentActivity')}</h3>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm font-medium">
            Gráfica de rendimiento próximamente...
          </div>
        </div>
        <div className="col-span-3 bg-card p-6 rounded-xl border border-border min-h-[300px]">
          <h3 className="font-semibold mb-4">{t('quickActions')}</h3>
          <div className="space-y-4">
            <button className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
              <span>+</span> {t('addAnimal')}
            </button>
            <button className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-border hover:bg-accent transition-colors font-medium">
               {t('addTask')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
