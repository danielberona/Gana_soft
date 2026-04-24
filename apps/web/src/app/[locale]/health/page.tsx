import { useTranslations } from 'next-intl';

export default function HealthPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Sanidad Ganadera</h1>
      <p className="text-muted-foreground">Control de vacunas, tratamientos y diagnósticos.</p>
      
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <h3 className="text-lg font-medium text-foreground">Modulo en desarrollo</h3>
        <p className="text-sm text-muted-foreground mt-2">Próximamente: Historial clínico detallado.</p>
      </div>
    </div>
  );
}
