import React from 'react';
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
  TrendingDown,
  Unlock,
  Zap
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuSections = [
    {
      title: 'ATLAS INTELLIGENCE CORE',
      items: [
        { id: 'dashboard', label: 'Atlas Control Tower', icon: LayoutDashboard },
        { id: 'explorer', label: 'Regulatory Explorer', icon: Sparkles, badge: 'SSoT Flow' },
        { id: 'passport', label: 'GES Regulatory Passport', icon: FileText, badge: 'NewRa URN' }
      ]
    },
    {
      title: 'THE 6 LIFECYCLE ENGINES',
      items: [
        { id: 'consumer-eligibility', label: '1. Feasibility (GES Qualifier)', icon: UserCheck, badge: 'Stage 1' },
        { id: 'generator-eligibility', label: '1b. Generator (GEP Qualifier)', icon: Zap, badge: 'GEP' },
        { id: 'captive-structuring', label: '2. Contracted (26/51 Equity)', icon: Factory, badge: 'Stage 2' },
        { id: 'connectivity', label: '3. Delivered (Voltage Matrix)', icon: Network, badge: 'Stage 3' },
        { id: 'tod', label: '4. Scheduled (96-Block TOD)', icon: Clock, badge: 'Stage 4' },
        { id: 'settlement-waterfall', label: '5. Settled (Loss Waterfall)', icon: Waves, badge: 'Stage 5' },
        { id: 'bill-audit', label: '6. Billed (DISCOM Invoice Audit)', icon: FileCheck, badge: 'Stage 6' }
      ]
    },
    {
      title: 'PLATFORM SUITE & RISK',
      items: [
        { id: 'downstream-hub', label: 'Downstream Apps Hub', icon: Code2, badge: '10 Apps' },
        { id: 'guard-rules', label: 'Guard Compliance Rulebook', icon: ShieldAlert, badge: 'Guard' },
        { id: 'change-propagator', label: 'Regulatory Change Propagator', icon: SlidersHorizontal, badge: 'Risk' },
        { id: 'landed-cost', label: 'Landed Cost Calculator', icon: Calculator, badge: 'LCoP' }
      ]
    },
    {
      title: 'STATUTORY DIRECTORY & AUDIT',
      items: [
        { id: 'tariffs', label: 'Tariff Master (882 Tariffs)', icon: Receipt },
        { id: 'open-access', label: 'Open Access & Grid Losses', icon: Unlock },
        { id: 'banking', label: 'RE Banking & Settlement', icon: PiggyBank },
        { id: 'captive', label: 'Captive Regulations Archive', icon: Factory },
        { id: 'metering', label: 'Metering & Telemetry', icon: Gauge },
        { id: 'scheduling', label: 'Scheduling & DSM Rules', icon: CalendarClock },
        { id: 'states', label: 'State Master (17)', icon: MapPin },
        { id: 'discoms', label: 'DISCOM Directory (49)', icon: Building2 },
        { id: 'regulations', label: 'SERC Orders & Gazette', icon: FileText },
        { id: 'compare', label: 'Multi-State Comparator', icon: GitCompare },
        { id: 'admin', label: 'Governance & Audit Log', icon: SlidersHorizontal },
        { id: 'api-docs', label: 'REST API & SDK Reference', icon: Terminal }
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0B0F19]/95 border-r border-slate-800/80 min-h-[calc(100vh-53px)] p-3.5 flex flex-col justify-between select-none">
      <div className="space-y-5">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h2 className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              {section.title}
            </h2>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-slate-800/90 text-teal-300 font-semibold shadow-sm border border-slate-700/80'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide ${
                        isActive
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Status & Branding */}
      <div className="mt-6 pt-3 border-t border-[#2D50A1]/30 px-2 space-y-2 text-[11px]">
        <div className="flex items-center justify-between text-[#C6CBD9]">
          <span>Target States</span>
          <span className="text-[#28B8B4] font-mono font-semibold">17 / 17</span>
        </div>
        <div className="flex items-center justify-between text-[#C6CBD9]">
          <span>DISCOMs Active</span>
          <span className="text-[#7CD9D6] font-mono font-semibold">49 Utilities</span>
        </div>
        <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
          <img src="/brand/newra-symbol-aqua.png" alt="NewRa Grids" className="h-4 w-4 object-contain opacity-90" />
          <div className="text-[10px] text-slate-400 leading-tight">
            <span className="text-white font-semibold">NewRa Atlas</span> • SSoT v1.0
          </div>
        </div>
      </div>
    </aside>
  );
}
