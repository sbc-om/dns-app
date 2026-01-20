'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  forcedTheme,
}: {
  children: React.ReactNode;
  forcedTheme?: Theme;
}) {
  const effectiveTheme = useMemo<Theme | undefined>(() => forcedTheme, [forcedTheme]);
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const applyTheme = (nextTheme: Theme) => {
      const root = document.documentElement;
      root.classList.toggle('dark', nextTheme === 'dark');
      root.dataset.theme = nextTheme;
    };

    if (effectiveTheme) {
      setThemeState(effectiveTheme);
      applyTheme(effectiveTheme);
      return;
    }

    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('dna-theme') : null;
    const systemPrefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme: Theme =
      storedTheme === 'light' || storedTheme === 'dark'
        ? (storedTheme as Theme)
        : systemPrefersDark
          ? 'dark'
          : 'light';

    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, [effectiveTheme]);

  const setTheme = (newTheme: Theme) => {
    if (effectiveTheme) return;
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dna-theme', newTheme);
    }
    const root = document.documentElement;
    root.classList.toggle('dark', newTheme === 'dark');
    root.dataset.theme = newTheme;
  };

  const toggleTheme = () => {
    if (effectiveTheme) return;
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
