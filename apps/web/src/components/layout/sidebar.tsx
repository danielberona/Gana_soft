'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  LayoutDashboard, Bug as Cow, HeartPulse, Weight,
  Baby, CalendarDays, Users, Settings,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { key: 'dashboard', href: '/', icon: LayoutDashboard },
  { key: 'animals', href: '/animals', icon: Cow },
  { key: 'health', href: '/health', icon: HeartPulse },
  { key: 'weight', href: '/weight', icon: Weight },
  { key: 'reproduction', href: '/reproduction', icon: Baby },
  { key: 'calendar', href: '/calendar', icon: CalendarDays },
  { key: 'users', href: '/users', icon: Users },
  { key: 'settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col border-r transition-all duration-300 ease-in-out',
        'bg-sidebar text-sidebar-foreground border-sidebar-border',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-sidebar-border',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
          G
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-semibold text-sm tracking-tight">Ganasoft</h1>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Cattle Management
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-accent'
              )}
              title={collapsed ? t(item.key) : undefined}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="animate-fade-in">{t(item.key)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg
            text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
          id="sidebar-toggle"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
