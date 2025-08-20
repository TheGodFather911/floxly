import React, { useState } from 'react';
import { Settings, Palette, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Header() {
  const { theme, themeName, setTheme, availableThemes } = useTheme();
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const getThemeDisplayName = (name: string) => {
    const themeNames: Record<string, string> = {
      cozyDark: 'Cozy Dark',
      forestNight: 'Forest Night',
      oceanDepth: 'Ocean Depth'
    };
    return themeNames[name] || name;
  };

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Student Focus Hub
        </h1>
        <p className={`text-sm ${theme.textSecondary} mt-1`}>
          Your all-in-one productivity companion
        </p>
      </div>
      
      <div className="relative">
        <button
          onClick={() => setShowThemeSelector(!showThemeSelector)}
          className={`p-3 rounded-xl ${theme.cardBackground} ${theme.text} transition-all duration-200 hover:scale-105 hover:shadow-lg`}
          title="Theme Settings"
        >
          <Palette className="w-5 h-5" />
        </button>
        
        {showThemeSelector && (
          <div className={`absolute right-0 mt-2 w-48 ${theme.cardBackground} rounded-xl shadow-xl z-50 overflow-hidden`}>
            <div className="p-3">
              <h3 className={`text-sm font-semibold ${theme.text} mb-2`}>Choose Theme</h3>
              {availableThemes.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setTheme(name);
                    setShowThemeSelector(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    name === themeName 
                      ? `${theme.primary} text-white` 
                      : `hover:bg-white/10 ${theme.text}`
                  }`}
                >
                  {getThemeDisplayName(name)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}