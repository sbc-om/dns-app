'use client';

import { createContext, useContext, useEffect, useState } from 'react';

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
  const [theme, setThemeState] = useState<Theme>(forcedTheme ?? 'light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = forcedTheme ?? savedTheme ?? systemTheme;
    
    setThemeState(initialTheme);
    
    // Remove both classes first
    document.documentElement.classList.remove('light', 'dark');
    // Add the correct class
    document.documentElement.classList.add(initialTheme);
  }, [forcedTheme]);

  const setTheme = (newTheme: Theme) => {
    const nextTheme = forcedTheme ?? newTheme;
    setThemeState(nextTheme);

    if (!forcedTheme) {
      localStorage.setItem('theme', nextTheme);
    }
    
    // Remove both classes first
    document.documentElement.classList.remove('light', 'dark');
    // Add the correct class
    document.documentElement.classList.add(nextTheme);
  };

  const toggleTheme = () => {
    if (forcedTheme) return;
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
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
