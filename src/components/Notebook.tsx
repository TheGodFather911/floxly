import React, { useState, useEffect } from 'react';
import { Save, FileText, Download } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Notebook() {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('studentHub_notebook');
    if (saved) {
      setContent(saved);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAutoSaving(true);
      localStorage.setItem('studentHub_notebook', content);
      setLastSaved(new Date());
      setTimeout(() => setIsAutoSaving(false), 1000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [content]);

  const downloadNotes = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${theme.cardBackground} rounded-2xl p-6 shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className={`w-5 h-5 ${theme.accent}`} />
          <h2 className={`text-xl font-semibold ${theme.text}`}>Notebook</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {isAutoSaving && (
            <span className={`text-xs ${theme.textSecondary} flex items-center gap-1`}>
              <Save className="w-3 h-3" />
              Saving...
            </span>
          )}
          {lastSaved && !isAutoSaving && (
            <span className={`text-xs ${theme.textSecondary}`}>
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          <button
            onClick={downloadNotes}
            className={`p-2 rounded-lg ${theme.primary} ${theme.primaryHover} text-white transition-colors`}
            title="Download notes"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing your notes... Markdown supported!"
        className={`w-full h-96 p-4 rounded-xl bg-white/5 border ${theme.border} ${theme.text} placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
      />
      
      <div className={`mt-4 text-sm ${theme.textSecondary}`}>
        <p>💡 Tip: Your notes are automatically saved as you type</p>
      </div>
    </div>
  );
}