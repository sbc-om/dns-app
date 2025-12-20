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
  const effectiveTheme = useMemo<Theme>(() => forcedTheme ?? 'dark', [forcedTheme]);
  const [theme, setThemeState] = useState<Theme>(effectiveTheme);

  useEffect(() => {
    setThemeState(effectiveTheme);

    // Dark-only: never remove `dark` (avoids a brief light-mode paint).
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }, [effectiveTheme]);

  const setTheme = (newTheme: Theme) => {
    // Dark-only.
    if (newTheme !== 'dark') return;
    setThemeState('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  };

  const toggleTheme = () => {
    // Dark-only.
    return;
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
