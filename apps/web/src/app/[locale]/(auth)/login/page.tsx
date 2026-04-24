'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl mb-2">
            G
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t('welcomeBack')}</h1>
          <p className="text-muted-foreground">{t('welcomeMessage')}</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 animate-slide-in">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">{t('email')}</label>
            <input
              type="email"
              required
              className="w-full h-11 px-4 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-ring/20 transition-all outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ganasoft.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-muted-foreground">{t('password')}</label>
              <Link href="#" className="text-xs text-primary hover:underline">{t('forgotPassword')}</Link>
            </div>
            <input
              type="password"
              required
              className="w-full h-11 px-4 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-ring/20 transition-all outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? '...' : t('login')}
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              {t('noAccount')}{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                {t('createAccount')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
