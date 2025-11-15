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

interface ForgotPasswordPageClientProps {
  dictionary: Dictionary;
  locale: Locale;
}

export default function ForgotPasswordPageClient({ dictionary, locale }: ForgotPasswordPageClientProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Here you would typically call your password reset API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      setSuccess(true);
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">
              Email Sent
            </CardTitle>
            <CardDescription>
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Link 
                href={`/${locale}/auth/login`}
                className="text-primary hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href={`/${locale}`} className="flex items-center justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="DNA Logo" 
              width={60} 
              height={60}
              className="h-15 w-15 object-contain"
            />
          </Link>
          <CardTitle className="text-2xl">{dictionary.auth.forgotPassword}</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {isSubmitting ? dictionary.common.loading : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href={`/${locale}/auth/login`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}