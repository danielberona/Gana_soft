'use client';

import { useTranslations } from 'next-intl';
import { Bell, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageSelector } from '@/components/shared/language-selector';

export function Header() {
  const t = useTranslations('common');

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6
      bg-background/80 backdrop-blur-xl border-b border-border">
      {/* Search */}
      <div className="flex items-center gap-2 w-full max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search')}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/50 border-0
              text-sm placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring/20 focus:bg-muted
              transition-all duration-200"
            id="global-search"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
        <button
          className="flex items-center justify-center w-9 h-9 rounded-lg
            bg-muted/50 hover:bg-muted transition-all duration-200
            text-muted-foreground hover:text-foreground relative"
          id="notifications-btn"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
        </button>
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground text-xs font-semibold ml-1">
          A
        </div>
      </div>
    </header>
  );
}
