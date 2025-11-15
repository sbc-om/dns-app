import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Trophy, Target, TrendingUp, Award, Users, Zap } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-background">
      <Header dictionary={dictionary} locale={locale} />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center bg-gradient-to-br from-[#F2574C]/10 via-[#30B2D2]/10 to-[#E8A12D]/10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-[#F2574C] via-[#30B2D2] to-[#E8A12D] bg-clip-text text-transparent">
              {dictionary.pages.home.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {dictionary.pages.home.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={`/${locale}/auth/register`}>
                <Button size="lg" className="bg-[#F2574C] hover:bg-[#F2574C]/90 text-white px-8 py-6 text-lg">
                  {dictionary.pages.home.hero.cta}
                </Button>
              </Link>
              <Link href={`/${locale}/auth/login`}>
                <Button size="lg" variant="outline" className="border-[#30B2D2] text-[#30B2D2] hover:bg-[#30B2D2]/10 px-8 py-6 text-lg">
                  {dictionary.pages.home.hero.loginCta}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
                {dictionary.pages.home.features.title}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {dictionary.pages.home.features.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Gamification */}
              <Card className="border-2 border-[#F2574C]/20 hover:border-[#F2574C] transition-all hover:shadow-lg hover:shadow-[#F2574C]/20">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-[#F2574C]/10">
                      <Zap className="w-8 h-8 text-[#F2574C]" />
                    </div>
                    <CardTitle className="text-2xl">
                      {dictionary.pages.home.features.gamification.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {dictionary.pages.home.features.gamification.description}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Athletic Profile */}
              <Card className="border-2 border-[#30B2D2]/20 hover:border-[#30B2D2] transition-all hover:shadow-lg hover:shadow-[#30B2D2]/20">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-[#30B2D2]/10">
                      <Target className="w-8 h-8 text-[#30B2D2]" />
                    </div>
                    <CardTitle className="text-2xl">
                      {dictionary.pages.home.features.athleticProfile.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {dictionary.pages.home.features.athleticProfile.description}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Progress Tracking */}
              <Card className="border-2 border-[#E8A12D]/20 hover:border-[#E8A12D] transition-all hover:shadow-lg hover:shadow-[#E8A12D]/20">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-[#E8A12D]/10">
                      <TrendingUp className="w-8 h-8 text-[#E8A12D]" />
                    </div>
                    <CardTitle className="text-2xl">
                      {dictionary.pages.home.features.progressTracking.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {dictionary.pages.home.features.progressTracking.description}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Reward System */}
              <Card className="border-2 border-[#F2574C]/20 hover:border-[#F2574C] transition-all hover:shadow-lg hover:shadow-[#F2574C]/20">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-[#F2574C]/10">
                      <Award className="w-8 h-8 text-[#F2574C]" />
                    </div>
                    <CardTitle className="text-2xl">
                      {dictionary.pages.home.features.rewardSystem.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {dictionary.pages.home.features.rewardSystem.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-[#30B2D2]/5 to-[#E8A12D]/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  {dictionary.pages.home.philosophy.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {dictionary.pages.home.philosophy.subtitle}
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {dictionary.pages.home.philosophy.forEveryone}
                </p>
              </div>
              <div className="relative">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="border-[#F2574C] bg-[#F2574C]/5">
                    <CardHeader className="text-center">
                      <Trophy className="w-12 h-12 text-[#F2574C] mx-auto mb-3" />
                      <CardTitle className="text-4xl font-bold text-[#F2574C]">60</CardTitle>
                      <CardDescription>Participants per Session</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="border-[#30B2D2] bg-[#30B2D2]/5">
                    <CardHeader className="text-center">
                      <Users className="w-12 h-12 text-[#30B2D2] mx-auto mb-3" />
                      <CardTitle className="text-4xl font-bold text-[#30B2D2]">3</CardTitle>
                      <CardDescription>Teams per Academy</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-[#F2574C] via-[#30B2D2] to-[#E8A12D]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to Build Champions?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join us in transforming fitness into an exciting adventure
            </p>
            <Link href={`/${locale}/auth/register`}>
              <Button size="lg" className="bg-white text-[#F2574C] hover:bg-white/90 px-12 py-6 text-lg font-semibold">
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
