import React from 'react';
import { Search, Terminal, Sparkles, Eye, EyeOff, Menu, X } from 'lucide-react';
import { TabId } from '../types';

export interface NavbarProps {
  onOpenSearch: () => void;
  activeTab: string;
  setActiveTab: (tab: TabId) => void;
  clientFacing?: boolean;
  setClientFacing?: (val: boolean) => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function Navbar({
  onOpenSearch,
  activeTab,
  setActiveTab,
  clientFacing = false,
  setClientFacing,
  onToggleMobileMenu,
  isMobileMenuOpen = false
}: NavbarProps) {
  return (
    <header className="vesper-navbar sticky top-0 z-40 border-b border-[var(--line)] px-2.5 sm:px-4 lg:px-6 py-2 sm:py-2.5 backdrop-blur-md transition-all bg-[var(--surface-1)]/95 shadow-sm">
      <div className="vesper-header-inner w-full flex items-center justify-between gap-2 sm:gap-4">
        
        {/* LEFT SECTION: Hamburger Toggle + Official NewRa Grids Logo + Atlas Brandmark */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile Hamburger Drawer Toggle (Mobile & Tablet < lg) */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
              className="lg:hidden p-2 rounded-xl text-[var(--muted)] hover:text-white bg-[var(--surface-2)] border border-[var(--line)] transition shrink-0 active:scale-95"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-[var(--lilac)]" /> : <Menu className="w-4 h-4" />}
            </button>
          )}

          {/* NewRa Grids Official Logo + Atlas Name (Left Aligned) */}
          <div
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer select-none group"
            onClick={() => setActiveTab('dashboard')}
            title="NewRa Atlas Control Tower (Return to Dashboard)"
          >
            <div className="flex items-center gap-2 bg-[var(--surface-2)]/80 hover:bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--border-card-hover)] rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 transition-all shadow-sm">
              <img
                src={clientFacing ? '/brand/newra-logo-light.png' : '/brand/newra-logo-dark.png'}
                alt="NewRa Grids Logo"
                className="h-7 sm:h-8 md:h-9 w-auto object-contain shrink-0"
              />
              
              <div className="h-4 sm:h-5 w-[1px] bg-[var(--hairline)]/30" />
              
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-headline font-bold text-sm sm:text-base tracking-tight text-[#F4F5F7] group-hover:text-[var(--lilac)] transition-colors">
                  Atlas
                </span>
                <span className="hidden xs:inline-flex text-[9px] font-mono px-1 sm:px-1.5 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--line)] text-[var(--teal-accent)]">
                  SSoT
                </span>
              </div>
            </div>

            {/* Desktop Sub-badge */}
            <div className="hidden xl:flex flex-col text-left pl-1">
              <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-[var(--lilac)] font-semibold">
                Central SSoT
              </span>
              <span className="text-[10px] font-display font-medium text-[var(--muted)]">
                National Tariff Engine
              </span>
            </div>
          </div>
        </div>

        {/* CENTER SECTION: Global Search Bar (Responsive Width) */}
        <div className="flex items-center justify-center flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-1 sm:mx-2">
          {/* Desktop & Tablet Search Pill */}
          <button
            onClick={onOpenSearch}
            aria-label="Search states, DISCOMs, tariffs, or regulations"
            title="Search (Ctrl + K)"
            className="vesper-search-trigger hidden sm:flex w-full items-center justify-between px-3 sm:px-3.5 py-1.5 rounded-full transition text-xs group bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--primary-blue)] hover:bg-[var(--surface-2)]/90 shadow-inner"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 text-[var(--lilac)] group-hover:text-[var(--teal-accent)] transition shrink-0" />
              <span className="text-[var(--muted)] group-hover:text-white/80 transition truncate text-left">
                Search states, DISCOMs, tariffs...
              </span>
            </div>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded-full bg-[var(--surface-1)] border border-[var(--line)] text-[9px] font-mono text-[var(--muted)] shrink-0 ml-2">
              Ctrl + K
            </kbd>
          </button>

          {/* Mobile Search Icon Button */}
          <button
            onClick={onOpenSearch}
            aria-label="Search"
            title="Search (Ctrl + K)"
            className="sm:hidden p-2 rounded-xl text-[var(--lilac)] bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--primary-blue)] transition shrink-0 active:scale-95"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* RIGHT SECTION: Mode Switcher, Quick Action CTAs, and Previews */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mode Switcher: Internal vs Client-Ready */}
          <div className="vesper-mode-toggle flex items-center p-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)]">
            <button
              onClick={() => setClientFacing && setClientFacing(false)}
              aria-label="Internal analytics mode"
              title="Internal Mode"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-display font-medium rounded-full transition-all ${
                !clientFacing
                  ? 'bg-[var(--surface-1)] text-[var(--lilac)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              <Eye className="h-3 w-3 text-[var(--lilac)]" />
              <span className="hidden md:inline">Internal</span>
            </button>
            <button
              onClick={() => setClientFacing && setClientFacing(true)}
              aria-label="Client-ready executive mode"
              title="Client-Ready Mode"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-display font-medium rounded-full transition-all ${
                clientFacing
                  ? 'bg-[var(--surface-1)] text-[var(--lilac)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              <EyeOff className="h-3 w-3 text-[var(--faint)]" />
              <span className="hidden md:inline">Client</span>
            </button>
          </div>

          {/* Quick Action: Explorer */}
          <button
            onClick={() => setActiveTab('explorer')}
            aria-label="Launch Regulatory Explorer"
            title="Regulatory Explorer"
            className={`hidden md:flex px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-display font-semibold items-center gap-1.5 transition-all ${
              activeTab === 'explorer'
                ? 'bg-gradient-to-r from-[#09193C] to-[#2D50A1] text-white shadow-md border border-white/10'
                : 'text-[var(--muted)] hover:text-white bg-[var(--surface-2)] border border-[var(--line)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#28B8B4]" />
            <span>Explorer</span>
          </button>

          {/* Standalone Feature Previews Link (New Features Preview) */}
          <a
            href="/preview.html"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Interactive Feature Previews"
            aria-label="Interactive Feature Previews"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-display font-semibold text-[var(--teal-accent)] hover:text-white bg-[var(--surface-2)] border border-[var(--border-card)] hover:border-[var(--teal-accent)] transition-all"
          >
            <Sparkles className="w-3 h-3 text-[var(--teal-accent)]" />
            <span>Feature Previews</span>
          </a>

          {/* Quick Action: API Docs */}
          <button
            onClick={() => setActiveTab('api-docs')}
            aria-label="Open API & SDK Documentation"
            title="API & SDK Documentation"
            className={`hidden xl:flex px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-display font-semibold items-center gap-1.5 transition-all ${
              activeTab === 'api-docs'
                ? 'bg-gradient-to-r from-[#09193C] to-[#2D50A1] text-white shadow-md border border-white/10'
                : 'text-[var(--muted)] hover:text-white bg-[var(--surface-2)] border border-[var(--line)]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API</span>
          </button>
        </div>

      </div>
    </header>
  );
}
