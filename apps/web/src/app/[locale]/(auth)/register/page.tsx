'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || t('registerError'));
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
          <h1 className="text-3xl font-bold tracking-tight">{t('createAccount')}</h1>
          <p className="text-muted-foreground">{t('createAccountMessage')}</p>
        </div>

        <form onSubmit={handleRegister} className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 animate-slide-in">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">{t('fullName')}</label>
            <input
              type="text"
              required
              className="w-full h-11 px-4 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-ring/20 transition-all outline-none"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Juan Perez"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">{t('email')}</label>
            <input
              type="email"
              required
              className="w-full h-11 px-4 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-ring/20 transition-all outline-none"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="email@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{t('password')}</label>
              <input
                type="password"
                required
                className="w-full h-11 px-4 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-ring/20 transition-all outline-none"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{t('confirmPassword')}</label>
              <input
                type="password"
                required
                className="w-full h-11 px-4 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-ring/20 transition-all outline-none"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? '...' : t('register')}
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              {t('hasAccount')}{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                {t('login')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
