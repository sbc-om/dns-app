'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import Link from 'next/link';

interface LoginFormProps {
  dictionary: Dictionary;
  locale: Locale;
}

export function LoginForm({ dictionary, locale }: LoginFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // TODO: Implement actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError(dictionary.errors.serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">{dictionary.common.email}</Label>
        <Input
          id="email"
          type="email"
          placeholder={dictionary.auth.emailPlaceholder}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{dictionary.common.password}</Label>
          <Link
            href={`/${locale}/auth/forgot-password`}
            className="text-sm text-primary hover:underline"
          >
            {dictionary.auth.forgotPassword}
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder={dictionary.auth.passwordPlaceholder}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? dictionary.common.loading : dictionary.auth.loginButton}
      </Button>
    </form>
  );
}
