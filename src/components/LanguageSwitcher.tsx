'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Locale, locales, localeNames } from '@/config/i18n';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const getCurrentLocale = (): Locale => {
    const segments = pathname.split('/');
    const localeSegment = segments[1];
    return (locales.includes(localeSegment as Locale) ? localeSegment : 'en') as Locale;
  };

  const currentLocale = getCurrentLocale();

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split('/');
    const currentLocaleInPath = locales.includes(segments[1] as Locale);

    let newPathname: string;
    if (currentLocaleInPath) {
      segments[1] = newLocale;
      newPathname = segments.join('/');
    } else {
      newPathname = `/${newLocale}${pathname}`;
    }

    router.push(newPathname);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale: Locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className={currentLocale === locale ? 'bg-accent' : ''}
          >
            {localeNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
