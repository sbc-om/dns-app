import Link from 'next/link';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Globe, Zap } from 'lucide-react';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };
  const dictionary = await getDictionary(locale);

  return (
    <div className="min-h-screen flex flex-col">
      <Header dictionary={dictionary} locale={locale} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted/20">
          <div className="container max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {dictionary.pages.home.hero.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {dictionary.pages.home.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/auth/register`}>
                <Button size="lg" className="w-full sm:w-auto">
                  {dictionary.pages.home.hero.cta}
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard`}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {dictionary.pages.home.hero.loginCta}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {dictionary.pages.home.features.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {dictionary.pages.home.features.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{dictionary.pages.home.features.userManagement.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {dictionary.pages.home.features.userManagement.description}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{dictionary.pages.home.features.accessControl.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {dictionary.pages.home.features.accessControl.description}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Globe className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{dictionary.pages.home.features.multilingual.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {dictionary.pages.home.features.multilingual.description}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{dictionary.pages.home.features.modernTech.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {dictionary.pages.home.features.modernTech.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {dictionary.common.welcome}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {dictionary.pages.home.hero.subtitle}  
            </p>
            <Link href={`/${locale}/auth/register`}>
              <Button size="lg">
                {dictionary.pages.home.hero.cta}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer dictionary={dictionary} locale={locale} />
    </div>
  );
}
