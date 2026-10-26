import React, { useState } from 'react';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Sparkles,
  MapPin,
  Building2,
  Receipt,
  Clock,
  PiggyBank,
  Factory,
  Gauge,
  CalendarClock,
  FileText,
  GitCompare,
  SlidersHorizontal,
  Terminal,
  ChevronRight,
  Calculator,
  UserCheck,
  Network,
  Code2,
  ShieldAlert,
  Waves,
  FileCheck,
  Unlock,
  Zap,
  X
} from 'lucide-react';
import { TabId, MenuSection } from '../types';

const menuSections: MenuSection[] = [
  {
    id: 'core',
    title: 'Intelligence',
    items: [
      { id: 'dashboard', label: 'Control Tower', icon: LayoutDashboard },
      { id: 'explorer', label: 'Regulatory Explorer', icon: Sparkles, badge: 'SSoT' },
      { id: 'passport', label: 'Regulatory Passport', icon: FileText, badge: 'URN' }
    ]
  },
  {
    id: 'lifecycle',
    title: 'Lifecycle',
    items: [
      { id: 'consumer-eligibility', label: 'Feasibility', icon: UserCheck, badge: '01' },
      { id: 'generator-eligibility', label: 'Generator', icon: Zap, badge: 'GEP' },
      { id: 'captive-structuring', label: 'Contracted', icon: Factory, badge: '02' },
      { id: 'connectivity', label: 'Delivered', icon: Network, badge: '03' },
      { id: 'tod', label: 'Scheduled', icon: Clock, badge: '04' },
      { id: 'settlement-waterfall', label: 'Settled', icon: Waves, badge: '05' },
      { id: 'bill-audit', label: 'Billed', icon: FileCheck, badge: '06' }
    ]
  },
  {
    id: 'platform',
    title: 'Platform',
    items: [
      { id: 'downstream-hub', label: 'Downstream Apps', icon: Code2, badge: '10' },
      { id: 'guard-rules', label: 'Compliance Rulebook', icon: ShieldAlert, badge: 'Guard' },
      { id: 'change-propagator', label: 'Change Propagator', icon: SlidersHorizontal, badge: 'Risk' },
      { id: 'landed-cost', label: 'Landed Cost', icon: Calculator, badge: 'LCoP' }
    ]
  },
  {
    id: 'directory',
    title: 'Directory',
    items: [
      { id: 'tariffs', label: 'Tariff Master', icon: Receipt, badge: '882' },
      { id: 'open-access', label: 'Open Access', icon: Unlock },
      { id: 'banking', label: 'Banking', icon: PiggyBank },
      { id: 'captive', label: 'Captive Rules', icon: Factory },
      { id: 'metering', label: 'Metering', icon: Gauge },
      { id: 'scheduling', label: 'Scheduling & DSM', icon: CalendarClock },
      { id: 'states', label: 'States', icon: MapPin, badge: '17' },
      { id: 'discoms', label: 'DISCOMs', icon: Building2, badge: '49' },
      { id: 'regulations', label: 'Orders & Gazette', icon: FileText },
      { id: 'compare', label: 'Comparator', icon: GitCompare },
      { id: 'admin', label: 'Audit Log', icon: SlidersHorizontal },
      { id: 'api-docs', label: 'API & SDK', icon: Terminal }
    ]
  }
];

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: TabId) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const toggleSection = (id: string) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleItemClick = (id: TabId) => {
    setActiveTab(id);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={clsx(
          'vesper-sidebar flex h-full w-72 max-w-[85vw] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface-1)] text-[var(--text)] transition-transform duration-300 ease-in-out',
          'fixed inset-y-0 left-0 z-50 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Mobile-only Header with Close Button */}
        <div className="flex lg:hidden items-center justify-between border-b border-[var(--line)] px-4 py-3 bg-[var(--surface-2)]">
          <div className="flex items-center gap-2">
            <img src="/brand/newra-logo-dark.png" alt="NewRa Grids" className="h-6 w-auto object-contain" />
            <span className="font-headline font-bold text-xs text-[var(--text)]">Atlas</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[var(--surface-1)] border border-[var(--line)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Item Tree */}
        <nav
          aria-label="Atlas"
          className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-color:rgba(148,163,184,0.35)_transparent] [scrollbar-width:thin]"
        >
          {menuSections.map((section, index) => {
            const isSectionOpen = !collapsed.has(section.id);
            const sectionHasActive = section.items.some((item) => item.id === activeTab);

            return (
              <div key={section.id} className={clsx(index > 0 && 'mt-2')}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isSectionOpen}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lilac)]"
                >
                  <span className={clsx(sectionHasActive && 'text-[var(--lilac)] font-bold')}>{section.title}</span>
                  <ChevronRight className={clsx('size-3.5 transition-transform text-slate-500', isSectionOpen && 'rotate-90')} />
                </button>

                {isSectionOpen && (
                  <div className="space-y-0.5 mt-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleItemClick(item.id)}
                          aria-current={isActive ? 'page' : undefined}
                          title={item.label}
                          className={clsx(
                            'vesper-nav-item group flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-xs transition',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lilac)]',
                            isActive
                              ? 'border-[var(--line)] bg-[var(--surface-2)] text-white shadow-sm font-semibold'
                              : 'border-transparent text-slate-300 hover:border-[var(--line)] hover:bg-[var(--surface-2)]/50 hover:text-white'
                          )}
                        >
                          <Icon
                            className={clsx(
                              'size-4 shrink-0',
                              isActive ? 'text-[var(--lilac)]' : 'text-slate-500 group-hover:text-slate-300'
                            )}
                          />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.badge ? (
                            <span
                              className={clsx(
                                'shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-medium leading-none',
                                isActive
                                  ? 'border-[var(--line)] bg-[var(--violet)]/20 text-[var(--lilac)]'
                                  : 'border-[var(--line)] bg-[var(--surface-2)] text-slate-400'
                              )}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom SSoT Status Badge */}
        <div className="border-t border-[var(--line)] p-3 bg-[var(--surface-2)]/30">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Active Coverage</span>
              <span className="font-mono text-[11px] font-semibold text-[var(--lilac)]">17 States · 49 DISCOMs</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-slate-300">Atlas SSoT • Database Connected</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
