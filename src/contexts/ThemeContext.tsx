import React, { createContext, useContext, useState, useEffect } from 'react';

interface Theme {
  name: string;
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryHover: string;
  accent: string;
  border: string;
}

const themes: Record<string, Theme> = {
  cozyDark: {
    name: 'Cozy Dark',
    background: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    cardBackground: 'bg-white/10 backdrop-blur-md border border-white/20',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    primary: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-700',
    accent: 'text-purple-400',
    border: 'border-white/20'
  },
  forestNight: {
    name: 'Forest Night',
    background: 'bg-gradient-to-br from-gray-900 via-green-900 to-gray-900',
    cardBackground: 'bg-white/10 backdrop-blur-md border border-white/20',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    primary: 'bg-green-600',
    primaryHover: 'hover:bg-green-700',
    accent: 'text-green-400',
    border: 'border-white/20'
  },
  oceanDepth: {
    name: 'Ocean Depth',
    background: 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900',
    cardBackground: 'bg-white/10 backdrop-blur-md border border-white/20',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    accent: 'text-blue-400',
    border: 'border-white/20'
  }
};

interface ThemeContextType {
  theme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState('cozyDark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('studentHub_theme');
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: string) => {
    if (themes[newTheme]) {
      setThemeName(newTheme);
      localStorage.setItem('studentHub_theme', newTheme);
    }
  };

  const value = {
    theme: themes[themeName],
    themeName,
    setTheme,
    availableThemes: Object.keys(themes)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}