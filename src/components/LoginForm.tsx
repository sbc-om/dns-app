'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';

interface LoginFormProps {
  dictionary: Dictionary;
  locale: Locale;
}

export function LoginForm({ dictionary, locale }: LoginFormProps) {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: '', password: '', twoFactorCode: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);

  const redirectUrl = useMemo(() => {
    return searchParams.get('redirect') || `/${locale}/dashboard`;
  }, [searchParams, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!formData.email) {
        setError(dictionary.auth?.emailRequired || dictionary.errors.validationError);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError(dictionary.auth?.invalidEmail || dictionary.errors.validationError);
        return;
      }

      if (!needsTwoFactor && !formData.password) {
        setError(dictionary.errors.validationError);
        return;
      }

      if (needsTwoFactor) {
        const verifyResponse = await fetch('/api/auth/verify-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            code: formData.twoFactorCode,
          }),
        });

        if (!verifyResponse.ok) {
          const verifyData = await verifyResponse.json().catch(() => ({}));
          setError(verifyData.error || dictionary.errors.serverError);
          return;
        }

        window.location.href = redirectUrl;
        return;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresTwoFactor) {
          setNeedsTwoFactor(true);
          return;
        }
        
        setError(data.error || dictionary.errors.serverError);
        return;
      }

      // Force a full page reload to ensure cookie is available.
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Login error:', err);
      setError(dictionary.errors.serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold text-white/90">
          {dictionary.common.email}
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="text"
            name="email"
            placeholder={dictionary.auth.emailPlaceholder}
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            autoComplete="new-password"
            required
            className="h-12 px-0 bg-transparent !bg-transparent border-0 border-b-2 border-white/90 rounded-none text-white placeholder:text-white/70 focus-visible:ring-0 focus-visible:border-white shadow-none focus-visible:bg-transparent"
          />
        </div>
      </div>

      {!needsTwoFactor ? (
        <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-white/90">
              {dictionary.common.password}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                name="password"
                placeholder={dictionary.auth.passwordPlaceholder}
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                autoComplete="new-password"
                required
                className="h-12 px-0 bg-transparent !bg-transparent border-0 border-b-2 border-white/90 rounded-none text-white placeholder:text-white/70 focus-visible:ring-0 focus-visible:border-white shadow-none focus-visible:bg-transparent"
              />
            </div>
          </div>
      ) : (
        <div className="space-y-2">
            <Label htmlFor="twoFactorCode" className="text-sm font-semibold text-white/90">
              {dictionary.auth?.verificationCode || 'Verification Code'}
            </Label>
            <Input
              id="twoFactorCode"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000000"
              value={formData.twoFactorCode}
              onChange={(e) => setFormData((p) => ({ ...p, twoFactorCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
              required
              className="h-12 px-0 text-center text-xl font-mono tracking-[0.35em] bg-transparent !bg-transparent border-0 border-b-2 border-white/90 rounded-none text-white placeholder:text-white/70 focus-visible:ring-0 focus-visible:border-white shadow-none focus-visible:bg-transparent"
            />
            <div className="text-xs text-white/55">
              {dictionary.auth?.twoFactorDescription || 'Enter the verification code from your authenticator app'}
            </div>
          </div>
      )}

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
          <p className="text-sm text-red-100/90">{error}</p>
        </div>
      ) : null}

      <div className="space-y-3">
        <Button
          asChild
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-full border-2 border-white bg-transparent text-white hover:bg-[#FF4A1F] hover:border-white font-black tracking-wide transition-all duration-200"
        >
          <button>
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                {dictionary.common.loading}
              </span>
            ) : needsTwoFactor ? (
              dictionary.auth?.verifyAndLogin || 'Verify & Login'
            ) : (
              dictionary.auth.loginButton
            )}
          </button>
        </Button>
      </div>
    </form>
  );
}
