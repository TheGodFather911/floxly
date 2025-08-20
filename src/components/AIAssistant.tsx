import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { GeminiService } from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function AIAssistant() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const geminiService = GeminiService.getInstance();

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await geminiService.askQuestion(inputMessage);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI response');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please check your API configuration and try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Help me understand this concept",
    "Summarize my notes",
    "Quiz me on this topic",
    "Explain this step by step"
  ];

  return (
    <div className={`${theme.cardBackground} rounded-2xl shadow-xl overflow-hidden`}>
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bot className={`w-5 h-5 ${theme.accent}`} />
          <h2 className={`text-xl font-semibold ${theme.text}`}>AI Study Assistant</h2>
          <Sparkles className={`w-4 h-4 ${theme.accent} ml-auto`} />
        </div>
        <p className={`text-sm ${theme.textSecondary} mt-1`}>
          Get instant help with your studies • Powered by Gemini AI
        </p>
        {error && (
          <div className="mt-2 p-2 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className={`text-center py-8 ${theme.textSecondary}`}>
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="mb-4">Hi! I'm your AI study assistant. How can I help you today?</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(prompt)}
                  className={`px-3 py-1 text-xs rounded-full border ${theme.border} hover:bg-white/10 transition-colors`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' ? theme.primary : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                {message.sender === 'user' ? 
                  <User className="w-4 h-4 text-white" /> : 
                  <Bot className="w-4 h-4 text-white" />
                }
              </div>
              <div className={`px-4 py-2 rounded-2xl ${
                message.sender === 'user' 
                  ? `${theme.primary} text-white` 
                  : 'bg-white/10 border border-white/20'
              }`}>
                <p className={`text-sm ${message.sender === 'ai' ? theme.text : 'text-white'}`}>
                  {message.text}
                </p>
                <span className={`text-xs opacity-70 ${message.sender === 'ai' ? theme.textSecondary : 'text-white'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about your studies..."
            className={`flex-1 p-3 rounded-xl bg-white/5 border ${theme.border} ${theme.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`p-3 rounded-xl ${theme.primary} ${theme.primaryHover} text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className={`text-xs ${theme.textSecondary} mt-2 text-center`}>
          💡 Tip: Add your Gemini API key to the .env file for AI functionality
        </p>
      </div>
    </div>
  );
}