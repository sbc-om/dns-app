'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';

interface RegisterFormProps {
  dictionary: Dictionary;
  locale: Locale;
}

export function RegisterForm({ dictionary, locale }: RegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // TODO: Implement actual registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to login or dashboard
      router.push(`/${locale}/auth/login`);
    } catch (err) {
      setError(dictionary.errors.serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">{dictionary.common.fullName}</Label>
        <Input
          id="fullName"
          type="text"
          placeholder={dictionary.auth.fullNamePlaceholder}
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">{dictionary.common.username}</Label>
        <Input
          id="username"
          type="text"
          placeholder={dictionary.auth.usernamePlaceholder}
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
      </div>

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
        <Label htmlFor="phoneNumber">{dictionary.common.phoneNumber}</Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder={dictionary.auth.phoneNumberPlaceholder}
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{dictionary.common.password}</Label>
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
        {isSubmitting ? dictionary.common.loading : dictionary.auth.signupButton}
      </Button>
    </form>
  );
}
