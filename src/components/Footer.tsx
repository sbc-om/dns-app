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
    <footer className="border-t bg-gradient-to-r from-[#F2574C]/5 via-[#30B2D2]/5 to-[#E8A12D]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center space-y-8">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-3">
            <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-[#F2574C] via-[#30B2D2] to-[#E8A12D] bg-clip-text text-transparent text-center">
              LET'S BUILD CHAMPIONS TOGETHER
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link 
              href={`/${locale}`} 
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {dictionary.nav.home}
            </Link>
            <Link 
              href={`/${locale}/about`} 
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {dictionary.nav.about}
            </Link>
            <Link 
              href={`/${locale}/contact`} 
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {dictionary.nav.contact}
            </Link>
          </nav>

          {/* Social Links */}
          <div className="flex space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#F2574C] transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#30B2D2] transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#E8A12D] transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-6 w-6" />
            </a>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t w-full text-center">
            <p className="text-sm text-muted-foreground">{dictionary.footer.copyright.replace('{year}', currentYear.toString())}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}