import React from 'react';
import { Search, Zap, Terminal, Sparkles, Eye, EyeOff, Building2 } from 'lucide-react';

export default function Navbar({ onOpenSearch, activeTab, setActiveTab, clientFacing, setClientFacing }) {
  return (
    <header className="vesper-navbar sticky top-0 z-40 border-b px-4 lg:px-8 py-2.5 backdrop-blur-md transition-all">
      <div className="vesper-header-inner max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('dashboard')}>
          <span className="vesper-orb shrink-0" aria-hidden="true" />
          <div className="vesper-brand-mark h-9 w-9 rounded-xl border flex items-center justify-center overflow-hidden p-1">
            <img src="/brand/newra-symbol-aqua.png" alt="NewRa Grids" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-medium text-[var(--text)] tracking-tight">
                NewRa <span className="text-[var(--lilac)] font-medium">Atlas</span>
              </h1>
              <span className="vesper-product-badge vesper-pill px-2 py-0.5 text-[9px] font-mono uppercase tracking-[.16em] rounded-full">
                Product #1 • Central SSoT
              </span>
            </div>
            <p className="vesper-tagline text-[11px] text-[var(--muted)]">Central Intelligence Library for All NewRa Grids Applications</p>
          </div>
        </div>


        {/* Global Search Bar Button (Ctrl + K) */}
        <button
          onClick={onOpenSearch}
          aria-label="Search state, DISCOM, tariff, banking, or wheeling"
          title="Search (Ctrl + K)"
          className="vesper-search-trigger vesper-pill flex flex-1 max-w-md items-center justify-between px-4 py-2 rounded-full transition text-xs group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-[var(--lilac)] transition" />
            <span className="vesper-search-label text-[var(--muted)]">Search state, DISCOM, tariff, banking, wheeling...</span>
          </div>
          <kbd className="px-2 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[9px] font-mono text-[var(--muted)]">
            Ctrl + K
          </kbd>
        </button>

        {/* Mode & Action Shortcuts */}
        <div className="flex items-center gap-2.5">
          {/* Client-Facing / Internal Mode Toggle */}
          <div className="vesper-mode-toggle flex items-center gap-1 bg-[var(--bg)] p-1 rounded-full border border-[var(--line)]">
            <button
              onClick={() => setClientFacing && setClientFacing(false)}
              aria-label="Internal mode"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                !clientFacing
                  ? 'bg-[var(--surface-2)] text-[var(--lilac)] border border-[var(--line)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <Eye className="h-3 w-3 text-[var(--lilac)]" />
              <span>Internal</span>
            </button>
            <button
              onClick={() => setClientFacing && setClientFacing(true)}
              aria-label="Client-ready mode"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                clientFacing
                  ? 'bg-[var(--surface-2)] text-[var(--lilac)] border border-[var(--line)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <EyeOff className="h-3 w-3 text-[var(--faint)]" />
              <span>Client-Ready</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('explorer')}
            aria-label="Regulatory Explorer"
            className={`vesper-header-action px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'explorer'
                ? 'vesper-primary'
                : 'vesper-secondary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('api-docs')}
            aria-label="API Docs"
            className={`vesper-header-action px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'api-docs'
                ? 'vesper-primary'
                : 'vesper-secondary'
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
