'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';

interface LoginPageClientProps {
  dictionary: Dictionary;
  locale: Locale;
}

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPageClient({ dictionary, locale }: LoginPageClientProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Here you would typically call your authentication API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Redirect to dashboard on success
      window.location.href = `/${locale}/dashboard`;
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href={`/${locale}`} className="flex items-center justify-center space-x-2 mb-4">
            <Image 
              src="/logo.png" 
              alt="DNA Logo" 
              width={32} 
              height={32}
              className="h-8 w-8"
            />
            <span className="font-bold text-xl">DNA</span>
          </Link>
          <CardTitle className="text-2xl">{dictionary.auth.loginTitle}</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{dictionary.common.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={dictionary.auth.emailPlaceholder}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">{dictionary.common.password}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={dictionary.auth.passwordPlaceholder}
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? dictionary.common.loading : dictionary.auth.loginButton}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href={`/${locale}/auth/forgot-password`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {dictionary.auth.forgotPassword}
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {dictionary.auth.dontHaveAccount}{' '}
              <Link 
                href={`/${locale}/auth/register`}
                className="text-primary hover:underline font-medium"
              >
                {dictionary.auth.signupButton}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}