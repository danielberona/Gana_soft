import { useTranslations } from 'next-intl';

export default function WeightPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Control de Pesajes</h1>
      <p className="text-muted-foreground">Monitoreo de ganancia de peso y rendimiento animal.</p>
      
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <h3 className="text-lg font-medium text-foreground">Modulo en desarrollo</h3>
        <p className="text-sm text-muted-foreground mt-2">Próximamente: Gráficas de crecimiento.</p>
      </div>
    </div>
  );
}
