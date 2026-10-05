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
  Zap
} from 'lucide-react';

const menuSections = [
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

export default function Sidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(() => new Set());

  const toggleSection = (id) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-white/10 bg-[#09193C] text-white">
      <nav
        aria-label="Atlas"
        className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-color:rgba(255,255,255,0.16)_transparent] [scrollbar-width:thin]"
      >
        {menuSections.map((section, index) => {
          const isOpen = !collapsed.has(section.id);
          const sectionHasActive = section.items.some((item) => item.id === activeTab);

          return (
            <div key={section.id} className={clsx(index > 0 && 'mt-2')}>
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 transition hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28B8B4]"
              >
                <span className={clsx(sectionHasActive && 'text-[#7CD9D6]')}>{section.title}</span>
                <ChevronRight className={clsx('size-3.5 transition-transform', isOpen && 'rotate-90')} />
              </button>

              {isOpen && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        title={item.label}
                        className={clsx(
                          'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28B8B4]',
                          isActive
                            ? 'bg-white/10 text-white shadow-[inset_2px_0_0_#28B8B4]'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        <Icon
                          className={clsx(
                            'size-4 shrink-0',
                            isActive ? 'text-[#28B8B4]' : 'text-slate-400 group-hover:text-slate-200'
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.badge ? (
                          <span
                            className={clsx(
                              'shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none',
                              isActive
                                ? 'bg-[#28B8B4]/15 text-[#7CD9D6]'
                                : 'bg-white/5 text-slate-400'
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

      <div className="border-t border-white/10 p-3">
        <div className="rounded-xl bg-white/5 px-3 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Coverage</span>
            <span className="font-mono text-[11px] text-[#7CD9D6]">17 · 49</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#28B8B4]" />
            <span className="text-[11px] text-slate-300">Atlas SSoT · live</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
