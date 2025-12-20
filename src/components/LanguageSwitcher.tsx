'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Locale, locales, localeNames } from '@/config/i18n';
import { motion } from 'framer-motion';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const getCurrentLocale = (): Locale => {
    const segments = pathname.split('/');
    const localeSegment = segments[1];
    return (locales.includes(localeSegment as Locale) ? localeSegment : 'en') as Locale;
  };

  const currentLocale = getCurrentLocale();
  
  // Get the other locale (not current)
  const otherLocale = locales.find(l => l !== currentLocale) || 'en';

  const switchLocale = () => {
    const segments = pathname.split('/');
    const currentLocaleInPath = locales.includes(segments[1] as Locale);

    let newPathname: string;
    if (currentLocaleInPath) {
      segments[1] = otherLocale;
      newPathname = segments.join('/');
    } else {
      newPathname = `/${otherLocale}${pathname}`;
    }

    router.push(newPathname);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button 
        variant="ghost" 
        size="sm"
        onClick={switchLocale}
        className="h-11 gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all backdrop-blur-xl"
      >
        <Languages className="h-5 w-5 text-blue-400" />
        <span className="text-sm font-semibold text-white">
          {localeNames[otherLocale]}
        </span>
      </Button>
    </motion.div>
  );
}
