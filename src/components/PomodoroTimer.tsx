import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function PomodoroTimer() {
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break' | 'longBreak'>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    workTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4
  });

  const modeConfigs = {
    work: { time: settings.workTime * 60, label: 'Focus Time', color: 'text-red-400' },
    break: { time: settings.breakTime * 60, label: 'Break Time', color: 'text-green-400' },
    longBreak: { time: settings.longBreakTime * 60, label: 'Long Break', color: 'text-blue-400' }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer finished
      setIsActive(false);
      if (mode === 'work') {
        setSessionCount(prev => prev + 1);
        const newCount = sessionCount + 1;
        if (newCount % settings.longBreakInterval === 0) {
          setMode('longBreak');
          setTimeLeft(modeConfigs.longBreak.time);
        } else {
          setMode('break');
          setTimeLeft(modeConfigs.break.time);
        }
      } else {
        setMode('work');
        setTimeLeft(modeConfigs.work.time);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, sessionCount, settings]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modeConfigs[mode].time);
  };

  const progress = ((modeConfigs[mode].time - timeLeft) / modeConfigs[mode].time) * 100;

  return (
    <div className={`${theme.cardBackground} rounded-2xl p-6 shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${theme.accent}`} />
          <h2 className={`text-lg font-semibold ${theme.text}`}>Pomodoro Timer</h2>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${theme.text}`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {showSettings && (
        <div className={`mb-4 p-4 rounded-xl bg-white/5 ${theme.border} border`}>
          <h3 className={`text-sm font-semibold ${theme.text} mb-3`}>Timer Settings</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs ${theme.textSecondary}`}>Work (min)</label>
              <input
                type="number"
                value={settings.workTime}
                onChange={(e) => setSettings({...settings, workTime: parseInt(e.target.value) || 25})}
                className="w-full p-1 rounded bg-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className={`text-xs ${theme.textSecondary}`}>Break (min)</label>
              <input
                type="number"
                value={settings.breakTime}
                onChange={(e) => setSettings({...settings, breakTime: parseInt(e.target.value) || 5})}
                className="w-full p-1 rounded bg-white/10 text-white text-sm"
              />
            </div>
          </div>
        </div>
      )}

      <div className="text-center">
        <div className={`text-sm ${modeConfigs[mode].color} font-medium mb-2`}>
          {modeConfigs[mode].label}
        </div>
        
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#8B5CF6'}} />
                <stop offset="100%" style={{stopColor: '#EC4899'}} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${theme.text}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme.primary} ${theme.primaryHover} text-white transition-all hover:scale-105`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className={`p-2 rounded-xl border ${theme.border} ${theme.text} hover:bg-white/10 transition-colors`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className={`text-sm ${theme.textSecondary}`}>
          Sessions completed: <span className={`font-semibold ${theme.accent}`}>{sessionCount}</span>
        </div>
      </div>
    </div>
  );
}