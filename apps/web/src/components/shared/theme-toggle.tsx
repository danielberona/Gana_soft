'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  const current = themes.find((t) => t.value === theme) || themes[1];
  const next = themes[(themes.indexOf(current) + 1) % themes.length];

  return (
    <button
      onClick={() => setTheme(next.value)}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg
        bg-muted/50 hover:bg-muted transition-all duration-200
        text-muted-foreground hover:text-foreground"
      title={`Switch to ${next.label}`}
      id="theme-toggle"
    >
      <current.icon className="h-[18px] w-[18px]" />
    </button>
  );
}
