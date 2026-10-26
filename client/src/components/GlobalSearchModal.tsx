import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Building2, Receipt, FileText, CornerDownLeft } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from './StatusBadge';
import { SearchResultItem } from '../types';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResultItem) => void;
}

export default function GlobalSearchModal({ isOpen, onClose, onSelectResult }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const sampleQueries = [
    'Maharashtra HT tariff',
    'Gujarat 33 kV wheeling loss',
    'Rajasthan banking',
    'Karnataka group captive',
    'Tamil Nadu OA',
    'Haryana CSS',
    'Telangana industrial tariff'
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      performSearch(query);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) performSearch(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (q: string) => {
    if (!q || q.trim() === '') {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.search(q);
      setResults(res.results || []);
      setSelectedIndex(0);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    onSelectResult(item);
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'State':
        return <MapPin className="w-4 h-4 text-emerald-400" />;
      case 'DISCOM':
        return <Building2 className="w-4 h-4 text-cyan-400" />;
      case 'Tariff':
        return <Receipt className="w-4 h-4 text-amber-400" />;
      case 'Regulation':
        return <FileText className="w-4 h-4 text-indigo-400" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-8 sm:pt-20 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="vesper-dialog w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] rounded-2xl bg-[var(--surface-1)] border border-[var(--line)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-3 sm:px-4 py-3 sm:py-3.5 border-b border-[var(--line)] gap-2 sm:gap-3 bg-[var(--surface-2)]/50">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--lilac)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search state, DISCOM, rule, loss %, tariff (e.g. Maharashtra HT, Gujarat wheeling)..."
            className="vesper-search-input flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-400 text-xs sm:text-sm min-w-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-white"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--line)] text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching NewRa regulatory database...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 sm:py-12 text-center space-y-2">
              <p className="text-slate-300 text-sm font-medium">No direct matches found for "{query}"</p>
              <p className="text-xs text-slate-400">Try searching for a state name, DISCOM code, or "wheeling", "CSS", "banking"</p>
            </div>
          )}

          {!loading && !query && (
            <div className="py-3 px-2 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Popular Regulatory Searches
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {sampleQueries.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(sample)}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 border border-[var(--line)] text-xs text-slate-300 transition"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading &&
            results.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={index}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition ${
                    isSelected
                      ? 'bg-[var(--violet)]/20 border border-[var(--lilac)]/40 text-white'
                      : 'hover:bg-[var(--surface-2)]/60 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[var(--surface-2)] shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {item.type}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-white truncate">{item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.badge && <StatusBadge status={item.badge} />}
                    <CornerDownLeft className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--lilac)]' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-4 py-2.5 bg-[var(--surface-2)] border-t border-[var(--line)] text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">Navigate <kbd className="px-1 py-0.5 rounded bg-[var(--surface-1)] text-slate-300">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-[var(--surface-1)] text-slate-300">↓</kbd></span>
            <span>Select <kbd className="px-1 py-0.5 rounded bg-[var(--surface-1)] text-slate-300">Enter</kbd></span>
          </div>
          <span className="truncate ml-2 text-[10px] sm:text-[11px]">NewRa Central SSoT</span>
        </div>
      </div>
    </div>
  );
}
