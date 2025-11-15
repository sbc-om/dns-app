'use client';

import Link from 'next/link';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { Github, Twitter, Linkedin } from 'lucide-react';

interface FooterProps {
  dictionary: Dictionary;
  locale: Locale;
}

export function Footer({ dictionary, locale }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href={`/${locale}`} className="flex items-center space-x-3 mb-4">
              <img 
                src="/logo.png" 
                alt="DNA Web App Logo" 
                width={40} 
                height={40} 
                className="rounded-lg"
              />
              <span className="font-bold text-xl">{dictionary.common.appName}</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              {dictionary.footer.description}
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{dictionary.footer.quickLinks}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}`} className="text-muted-foreground hover:text-primary transition-colors">
                  {dictionary.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="text-muted-foreground hover:text-primary transition-colors">
                  {dictionary.nav.about}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-muted-foreground hover:text-primary transition-colors">
                  {dictionary.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{dictionary.footer.contact}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>info@dnawebapp.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Main St, City, Country</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>{dictionary.footer.copyright.replace('{year}', currentYear.toString())}</p>
        </div>
      </div>
    </footer>
  );
}