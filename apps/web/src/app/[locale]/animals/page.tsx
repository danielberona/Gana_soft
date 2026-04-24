import { useTranslations } from 'next-intl';

export default function AnimalsPage() {
  const t = useTranslations('navigation');
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Gestión de Animales</h1>
      <p className="text-muted-foreground">Listado completo de tu ganado bovino.</p>
      
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <h3 className="text-lg font-medium text-foreground">Modulo en desarrollo</h3>
        <p className="text-sm text-muted-foreground mt-2">Próximamente: Carga masiva y filtros avanzados.</p>
      </div>
    </div>
  );
}
