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
import { Mail, ArrowLeft, CheckCircle2, Send, Key } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#DDDDDD] dark:bg-[#000000]">
        <div className="w-full max-w-md">
          <Card className="w-full shadow-2xl border-3 border-[#DDDDDD] dark:border-[#262626] rounded-3xl overflow-hidden bg-white dark:bg-[#262626]">
            <CardHeader className="text-center bg-[#FF5F02] py-8">
              <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce-slow">
                <CheckCircle2 className="w-10 h-10 text-[#FF5F02]" />
              </div>
              <CardTitle className="text-3xl font-bold text-white">
                {dictionary.auth.emailSent}
              </CardTitle>
              <CardDescription className="text-base font-medium text-white mt-3 px-4">
                {dictionary.auth.resetEmailSent}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="p-4 bg-[#DDDDDD] dark:bg-[#262626] rounded-2xl border-2 border-[#DDDDDD] dark:border-[#000000]">
                  <p className="text-sm text-[#000000] dark:text-white text-center">
                    Check your inbox at <span className="font-bold">{email}</span>
                  </p>
                </div>
                <Link href={`/${locale}/auth/login`}>
                  <Button className="w-full h-12 text-base font-bold rounded-xl bg-[#FF5F02] hover:bg-[#262626] text-white shadow-lg hover:shadow-xl transition-all">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {dictionary.auth.backToLogin}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#DDDDDD] dark:bg-[#000000]">
      <div className="w-full max-w-md">
        <Link 
          href={`/${locale}/auth/login`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#FF5F02] hover:text-[#262626] dark:hover:text-white mb-6 transition-all hover:gap-3"
        >
          <ArrowLeft className="h-5 w-5" />
          {dictionary.auth.backToLogin}
        </Link>
        
        <Card className="w-full shadow-2xl border-3 border-[#DDDDDD] dark:border-[#262626] rounded-3xl overflow-hidden bg-white dark:bg-[#262626]">
          <CardHeader className="text-center bg-[#FF5F02] py-8">
            <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Key className="w-10 h-10 text-[#FF5F02]" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              {dictionary.auth.forgotPassword}
            </CardTitle>
            <CardDescription className="text-base font-medium text-white mt-3 px-4">
              {dictionary.auth.resetPasswordDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-[#000000] dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FF5F02]" />
                  {dictionary.common.email}
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={dictionary.auth.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base rounded-xl border-2 border-[#DDDDDD] dark:border-[#262626] focus:border-[#FF5F02] focus:ring-2 focus:ring-[#FF5F02]/20 pl-10 transition-all"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF5F02]" />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-xl animate-shake">
                  <p className="text-red-800 dark:text-red-200 text-sm font-semibold text-center">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-12 text-base font-bold rounded-xl bg-[#FF5F02] hover:bg-[#262626] text-white shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    {dictionary.auth.sendResetLink}
                  </span>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link 
                  href={`/${locale}/auth/login`}
                  className="text-sm font-semibold text-[#FF5F02] hover:text-[#262626] dark:hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {dictionary.auth.backToLogin}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}