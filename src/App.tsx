import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Notebook } from './components/Notebook';
import { PomodoroTimer } from './components/PomodoroTimer';
import { MusicPlayer } from './components/MusicPlayer';
import { Calculator } from './components/Calculator';
import { AIAssistant } from './components/AIAssistant';
import { GPACalculator } from './components/GPACalculator';
import { MotivationalQuotes } from './components/MotivationalQuotes';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function AppContent() {
  const { theme } = useTheme();
  const [activeWidget, setActiveWidget] = useState<string | null>(null);

  return (
    <div className={`min-h-screen transition-all duration-500 ${theme.background} ${theme.text}`}>
      <div className="container mx-auto px-4 py-6">
        <Header />
        
        {/* Motivational Quote Section */}
        <div className="mb-8">
          <MotivationalQuotes />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Notes, Calculator, GPA */}
          <div className="lg:col-span-2 space-y-6">
            <Notebook />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Calculator />
              <GPACalculator />
            </div>
          </div>

          {/* Right Column - Timer & Music */}
          <div className="lg:col-span-2 space-y-6">
            <PomodoroTimer />
            <MusicPlayer />
          </div>
        </div>

        {/* Bottom Section - AI Assistant */}
        <div className="mt-8">
          <AIAssistant />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;