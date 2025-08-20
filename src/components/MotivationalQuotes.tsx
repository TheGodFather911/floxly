import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const quotes = [
  {
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    text: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown"
  },
  {
    text: "Great things never come from comfort zones.",
    author: "Unknown"
  },
  {
    text: "Dream it. Wish it. Do it.",
    author: "Unknown"
  },
  {
    text: "Success doesn't just find you. You have to go out and get it.",
    author: "Unknown"
  },
  {
    text: "The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Unknown"
  },
  {
    text: "Don't stop when you're tired. Stop when you're done.",
    author: "Unknown"
  }
];

export function MotivationalQuotes() {
  const { theme } = useTheme();
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const getRandomQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    getRandomQuote();
    
    // Auto-refresh quote every 5 minutes
    const interval = setInterval(getRandomQuote, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${theme.cardBackground} rounded-2xl p-6 shadow-xl text-center relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Quote className={`w-5 h-5 ${theme.accent}`} />
          <h2 className={`text-lg font-semibold ${theme.text}`}>Daily Motivation</h2>
          <button
            onClick={getRandomQuote}
            className={`p-2 rounded-lg hover:bg-white/10 transition-all hover:scale-110 ${theme.text}`}
            title="Get new quote"
          >
            <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <blockquote className={`text-xl font-medium ${theme.text} mb-3 leading-relaxed`}>
            "{currentQuote.text}"
          </blockquote>
          <cite className={`text-sm ${theme.textSecondary} font-medium`}>
            — {currentQuote.author}
          </cite>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-purple-400 rounded-full opacity-50"></div>
        <div className="absolute top-6 right-6 w-1 h-1 bg-pink-400 rounded-full opacity-50"></div>
        <div className="absolute bottom-4 left-6 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-6 right-4 w-2 h-2 bg-pink-400 rounded-full opacity-30"></div>
      </div>
    </div>
  );
}