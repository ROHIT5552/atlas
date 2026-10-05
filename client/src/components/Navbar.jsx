import React from 'react';
import { Search, Zap, Terminal, Sparkles, Eye, EyeOff, Building2 } from 'lucide-react';

export default function Navbar({ onOpenSearch, activeTab, setActiveTab, clientFacing, setClientFacing }) {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 border-b border-slate-800/80 px-4 lg:px-8 py-2.5 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('dashboard')}>
          <div className="h-9 w-9 rounded-xl bg-[#09193C] border border-[#28B8B4]/50 flex items-center justify-center shadow-lg shadow-[#28B8B4]/15 overflow-hidden p-1">
            <img src="/brand/newra-symbol-aqua.png" alt="NewRa Grids" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                NewRa <span className="text-[#28B8B4] font-semibold">Atlas</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#2D50A1]/50 border border-[#28B8B4]/40 text-[#7CD9D6] rounded-md">
                Product #1 • Central SSoT
              </span>
            </div>
            <p className="text-[11px] text-[#C6CBD9]/80">Central Intelligence Library for All NewRa Grids Applications</p>
          </div>
        </div>


        {/* Global Search Bar Button (Ctrl + K) */}
        <button
          onClick={onOpenSearch}
          className="flex-1 max-w-md hidden md:flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition shadow-sm text-xs group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition" />
            <span className="text-slate-400 group-hover:text-slate-300">Search state, DISCOM, tariff, banking, wheeling...</span>
          </div>
          <kbd className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-[10px] font-mono text-slate-300">
            Ctrl + K
          </kbd>
        </button>

        {/* Mode & Action Shortcuts */}
        <div className="flex items-center gap-2.5">
          {/* Client-Facing / Internal Mode Toggle */}
          <div className="hidden sm:flex items-center gap-0.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setClientFacing && setClientFacing(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                !clientFacing
                  ? 'bg-slate-800 text-teal-300 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="h-3 w-3 text-teal-400" />
              <span>Internal</span>
            </button>
            <button
              onClick={() => setClientFacing && setClientFacing(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                clientFacing
                  ? 'bg-slate-800 text-teal-300 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <EyeOff className="h-3 w-3 text-slate-400" />
              <span>Client-Ready</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'explorer'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-sm shadow-teal-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('api-docs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'api-docs'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API Docs</span>
          </button>
        </div>
      </div>
    </header>
  );
}


