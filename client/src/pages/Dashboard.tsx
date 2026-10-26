import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building2,
  Receipt,
  FileText,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import IndiaCoverageMap from '../components/IndiaCoverageMap';
import { TabId, StatsData } from '../types';

const defaultStats: StatsData = {
  states_covered: 17,
  discoms_covered: 49,
  tariff_schedules: 882,
  active_regulations: 119,
  verified_data_pct: 33,
  pending_verification_count: 294,
  recently_updated_states: [
    { id: 'maharashtra', name: 'Maharashtra', code: 'MH', regulator: 'MERC', discoms: 4, last_updated: '2025-04-01', status: 'Official Verified' },
    { id: 'gujarat', name: 'Gujarat', code: 'GJ', regulator: 'GERC', discoms: 5, last_updated: '2025-04-01', status: 'Official Verified' },
    { id: 'rajasthan', name: 'Rajasthan', code: 'RJ', regulator: 'RERC', discoms: 3, last_updated: '2025-04-01', status: 'Official Verified' },
    { id: 'karnataka', name: 'Karnataka', code: 'KA', regulator: 'KERC', discoms: 5, last_updated: '2025-04-01', status: 'Official Verified' },
    { id: 'tamil-nadu', name: 'Tamil Nadu', code: 'TN', regulator: 'TNERC', discoms: 1, last_updated: '2025-04-01', status: 'Official Verified' },
    { id: 'telangana', name: 'Telangana', code: 'TS', regulator: 'TSERC', discoms: 2, last_updated: '2025-04-01', status: 'Official Verified' }
  ],
  system_status: 'Online & API Ready'
};

const quickStatePills = [
  { id: 'maharashtra', name: 'Maharashtra', code: 'MH', discom: 'MSEDCL' },
  { id: 'gujarat', name: 'Gujarat', code: 'GJ', discom: 'DGVCL / GUVNL' },
  { id: 'rajasthan', name: 'Rajasthan', code: 'RJ', discom: 'JVVNL / RVPNL' },
  { id: 'karnataka', name: 'Karnataka', code: 'KA', discom: 'BESCOM / KPTCL' },
  { id: 'tamil-nadu', name: 'Tamil Nadu', code: 'TN', discom: 'TANGEDCO' },
  { id: 'telangana', name: 'Telangana', code: 'TS', discom: 'TSSPDCL' }
];

export interface DashboardProps {
  setActiveTab: (tab: TabId) => void;
  onSelectState: (stateId: string) => void;
  onSelectDiscom: (discomId: string) => void;
  clientFacing?: boolean;
}

export default function Dashboard({ setActiveTab, onSelectState, clientFacing }: DashboardProps) {
  const [stats, setStats] = useState<StatsData>(defaultStats);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await api.getStats();
        if (data && data.states_covered) {
          setStats(data);
        }
      } catch (err) {
        console.warn('Backend connecting in background, using loaded dataset:', err);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12 w-full">
      {/* Top Welcome Hero Banner */}
      <div className="brand-card brand-card-lg relative p-5 sm:p-8 overflow-hidden backdrop-blur-sm border-[1.5px] border-[#273052] bg-[#0B1224]">
        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-2)] border border-[#C6CBD9]/20 text-[var(--lilac)] text-xs font-display font-medium tracking-wide">
            <Zap className="w-3.5 h-3.5 text-[#28B8B4]" />
            <span>Standardized Indian Power Regulatory Intelligence Engine</span>
          </div>
          <h1 className="headline-40 sm:headline-56 text-white tracking-tight leading-tight">
            NewRa State & DISCOM Regulatory Library
          </h1>
          <p className="body-16 text-[#9AA4C7] leading-relaxed max-w-2xl">
            Centralized Single Source of Truth (SSoT) for retail electricity tariffs, TOD curves, Open Access surcharges, technical grid losses, banking rules, and captive compliance across 17 major industrial states.
          </p>

          {/* Quick Flow CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('explorer')}
              className="cta-primary"
            >
              <Sparkles className="w-4 h-4 text-[#28B8B4]" />
              <span>Launch Regulatory Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('landed-cost')}
              className="cta-secondary"
            >
              <span>LCoP Waterfall Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className="px-4 py-2 rounded-full font-display font-medium text-xs text-[#9AA4C7] hover:text-white bg-[var(--surface-2)] border border-[#C6CBD9]/25 hover:border-[var(--primary-blue)] transition flex items-center gap-1.5"
            >
              <span>Compare Jurisdictions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* States Covered */}
        <div className="brand-card p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[#9AA4C7] text-[11px] font-display font-semibold uppercase tracking-wider">
            <span>States</span>
            <MapPin className="w-3.5 h-3.5 text-[#28B8B4]" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-white">{stats.states_covered}</div>
          <p className="text-[10px] text-[#9AA4C7]">17 Major C&I state markets</p>
        </div>

        {/* DISCOMs Covered */}
        <div className="brand-card p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[#9AA4C7] text-[11px] font-display font-semibold uppercase tracking-wider">
            <span>DISCOMs</span>
            <Building2 className="w-3.5 h-3.5 text-[#8EAAFB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-[#8EAAFB]">{stats.discoms_covered}</div>
          <p className="text-[10px] text-[#9AA4C7]">Public & private utilities</p>
        </div>

        {/* Tariff Schedules */}
        <div className="brand-card p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[#9AA4C7] text-[11px] font-display font-semibold uppercase tracking-wider">
            <span>Tariffs</span>
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-amber-400">{stats.tariff_schedules}</div>
          <p className="text-[10px] text-[#9AA4C7]">Categorized rate tables</p>
        </div>

        {/* Active Regulations */}
        <div className="brand-card p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[#9AA4C7] text-[11px] font-display font-semibold uppercase tracking-wider">
            <span>Orders & Acts</span>
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-indigo-300">{stats.active_regulations}</div>
          <p className="text-[10px] text-[#9AA4C7]">Gazette notifications</p>
        </div>

        {/* Verified Data % */}
        <div className="brand-card p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[#9AA4C7] text-[11px] font-display font-semibold uppercase tracking-wider">
            <span>Verified %</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3DDC97]" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-[#3DDC97]">{stats.verified_data_pct}%</div>
          <p className="text-[10px] text-[#9AA4C7]">Commission verified</p>
        </div>

        {/* Pending Verification */}
        <div className="brand-card p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[#9AA4C7] text-[11px] font-display font-semibold uppercase tracking-wider">
            <span>Under Review</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-[#9AA4C7]">{stats.pending_verification_count}</div>
          <p className="text-[10px] text-[#9AA4C7]">Future FY drafts</p>
        </div>
      </div>

      {/* Quick Launch State Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="eyebrow-text flex items-center gap-2">
            <span>Key State Power Markets</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#28B8B4] animate-pulse" />
          </h3>
          <button
            onClick={() => setActiveTab('states')}
            className="text-xs text-[var(--lilac)] hover:text-white font-display font-semibold flex items-center gap-1 transition"
          >
            <span>View All 17 States</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {quickStatePills.map((st) => (
            <button
              key={st.id}
              onClick={() => {
                onSelectState(st.id);
                setActiveTab('explorer');
              }}
              className="brand-card flex min-w-0 flex-col justify-between p-3.5 sm:p-4 text-left group hover:border-[#2D50A1]"
            >
              <div className="min-w-0 w-full">
                <div className="flex items-start justify-between gap-1.5">
                  <span className="min-w-0 text-xs sm:text-sm font-headline font-semibold text-white truncate">{st.name}</span>
                  <span className="shrink-0 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--lilac)]">
                    {st.code}
                  </span>
                </div>
                <div className="mt-1 truncate text-[11px] text-[#9AA4C7]">{st.discom}</div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-2 text-[10px] font-display font-medium text-[var(--lilac)] group-hover:text-white transition">
                <span>Query profile</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* India Coverage Map Component */}
      <IndiaCoverageMap onSelectState={onSelectState} />

      {/* Recently Updated States & Architecture Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recently Updated States List */}
        <div className="brand-card brand-card-lg lg:col-span-2 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="headline-24 text-white">
                State Regulatory Commission Directory
              </h3>
              <p className="text-xs text-[#9AA4C7] mt-0.5">
                Overview of latest MYT tariff orders, STU networks, and verification health.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[9px] font-mono uppercase tracking-[.14em] text-[var(--lilac)] font-medium">
              100% Synced
            </span>
          </div>

          <div className="divide-y divide-[#273052]/70">
            {stats.recently_updated_states.map((st) => (
              <div
                key={st.id}
                onClick={() => {
                  onSelectState(st.id);
                  setActiveTab('states');
                }}
                className="py-3 flex items-center justify-between hover:bg-[var(--surface-2)]/40 px-2 rounded-xl cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center font-bold text-xs text-[#28B8B4]">
                    {st.code}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white">{st.name}</h4>
                    <p className="text-[11px] text-[#9AA4C7]">
                      Regulator: {st.regulator} • Active DISCOMs: {st.discoms}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={st.status} />
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NewRa Architecture Callout */}
        <div className="brand-card brand-card-lg p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[#28B8B4]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="headline-24 text-white">
              Data Integrity & Governance
            </h3>
            <p className="body-16 text-[#9AA4C7] leading-relaxed text-xs">
              Every tariff rate and rule is entered into structured relational fields. Unverified data is marked explicitly to protect commercial quotation accuracy.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-between text-[#9AA4C7]">
                <span>API Endpoint:</span>
                <span className="font-mono text-[#8EAAFB] text-[11px] font-semibold">/api/regulatory-profile</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-between text-[#9AA4C7]">
                <span>GridFlex Integration:</span>
                <span className="text-[#3DDC97] font-medium">Active & Live</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('api-docs')}
            className="w-full py-2.5 rounded-full bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 border border-[var(--line)] text-xs font-display font-medium text-white transition flex items-center justify-center gap-1.5 mt-2"
          >
            <span>Open API Reference</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
