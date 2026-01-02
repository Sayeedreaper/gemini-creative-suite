import React from 'react';
import { AppTab } from '../types';
import { MessageSquare, Image as ImageIcon, BookOpen, Sparkles } from 'lucide-react';

interface LayoutProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, onTabChange, children }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col shadow-xl z-10">
        <div className="flex items-center gap-2 mb-8 px-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Gemini Suite
            </h1>
        </div>

        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          <button
            onClick={() => onTabChange(AppTab.Chat)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
              activeTab === AppTab.Chat
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Chat Assistant</span>
          </button>

          <button
            onClick={() => onTabChange(AppTab.Analyze)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
              activeTab === AppTab.Analyze
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="font-medium">Image Analysis</span>
          </button>

          <button
            onClick={() => onTabChange(AppTab.Story)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
              activeTab === AppTab.Story
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Storyteller</span>
          </button>
        </div>
        
        <div className="mt-auto pt-8 text-xs text-slate-600 hidden md:block px-2">
            <p>Powered by Google Gemini</p>
            <p>v1.0.0</p>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            {children}
        </div>
      </main>
    </div>
  );
};
