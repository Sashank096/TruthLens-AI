import React from 'react';
import { ShieldCheck, Search, Activity, PlusCircle, Database, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isDark, setIsDark }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-navy-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo and Tagline */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-wider text-white">TRUTHLENS</span>
                <span className="px-1.5 py-0.2 text-[9px] sm:text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden md:block">
                Investigate the image. Discover the evidence. Verify the source.
              </p>
            </div>
          </div>

          {/* Navigation Items - Touch optimized for mobile */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden text-[11px]">Cases</span>
            </button>

            <button
              onClick={() => setActiveTab('new-investigation')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'new-investigation'
                  ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">New Case</span>
              <span className="sm:hidden text-[11px]">New</span>
            </button>

            <button
              onClick={() => setActiveTab('quick-scan')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'quick-scan'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Quick Triage</span>
              <span className="sm:hidden text-[11px]">Scan</span>
            </button>

            <button
              onClick={() => setActiveTab('reference-corpus')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'reference-corpus'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">Reference Corpus</span>
              <span className="hidden sm:inline md:hidden">Corpus</span>
            </button>

            {/* Health Status Indicator (Desktop only) */}
            <div className="hidden lg:flex items-center space-x-2 pl-3 ml-2 border-l border-slate-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">ENGINE ONLINE</span>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors ml-0.5"
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
};
