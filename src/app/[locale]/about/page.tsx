import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Database, Globe, Zap, Shield, Users } from 'lucide-react';

export default async function AboutPage({
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
              {dictionary.pages.about.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {dictionary.pages.about.subtitle}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-4">
          <div className="container max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-4">
                  {dictionary.pages.about.mission.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground text-center">
                  {dictionary.pages.about.mission.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technology Stack Section */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {dictionary.pages.about.technology.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {dictionary.pages.about.technology.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Code className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Next.js 16</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Modern React framework with App Router and Turbopack for optimal performance and developer experience.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Database className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>LMDB</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Lightning Memory-Mapped Database for fast, reliable data storage with ACID transactions.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Globe className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>TypeScript</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Type-safe development with enhanced IDE support and fewer runtime errors.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Shadcn/UI</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Beautiful, accessible UI components built with Radix UI and Tailwind CSS.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Access Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Dynamic permission system with role-based access control for secure resource management.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Internationalization</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Multi-language support with RTL layout support for Arabic and other languages.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="py-20 px-4">
          <div className="container max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Key Features
              </h2>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4">User Management</h3>
                  <p className="text-muted-foreground">
                    Complete user lifecycle management with registration, authentication, profile management, and secure password handling.
                  </p>
                </div>
                <div className="w-full md:w-64 h-40 bg-muted rounded-lg flex items-center justify-center">
                  <Users className="h-16 w-16 text-primary" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4">Dynamic Permissions</h3>
                  <p className="text-muted-foreground">
                    Flexible role-based access control system that allows fine-grained permissions for different resources and actions.
                  </p>
                </div>
                <div className="w-full md:w-64 h-40 bg-muted rounded-lg flex items-center justify-center">
                  <Shield className="h-16 w-16 text-primary" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4">Multi-language</h3>
                  <p className="text-muted-foreground">
                    Built-in internationalization with support for English and Arabic, including proper RTL layout support.
                  </p>
                </div>
                <div className="w-full md:w-64 h-40 bg-muted rounded-lg flex items-center justify-center">
                  <Globe className="h-16 w-16 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer dictionary={dictionary} locale={locale} />
    </div>
  );
}