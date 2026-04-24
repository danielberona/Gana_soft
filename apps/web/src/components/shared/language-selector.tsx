'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const nextLocale = locale === 'es' ? 'en' : 'es';
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath);
  };

  return (
    <button
      onClick={switchLocale}
      className="flex items-center gap-1.5 px-2.5 h-9 rounded-lg
        bg-muted/50 hover:bg-muted transition-all duration-200
        text-muted-foreground hover:text-foreground text-xs font-medium uppercase tracking-wider"
      id="language-selector"
    >
      <Languages className="h-[18px] w-[18px]" />
      <span>{locale === 'es' ? 'EN' : 'ES'}</span>
    </button>
  );
}
