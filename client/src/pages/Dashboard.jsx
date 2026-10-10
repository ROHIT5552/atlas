import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
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

const defaultStats = {
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

export default function Dashboard({ setActiveTab, onSelectState, onSelectDiscom, clientFacing }) {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(false);

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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Welcome Hero Banner */}
      <div className="vesper-hero relative rounded-3xl p-6 sm:p-7 overflow-hidden backdrop-blur-sm">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-400 text-xs font-semibold tracking-wide">
            <Zap className="w-3.5 h-3.5" />
            <span>Standardized Indian Power Regulatory Intelligence Engine</span>
          </div>
          <h1 className="vesper-hero-title text-2xl sm:text-3xl font-medium tracking-tight leading-tight">
            NewRa State & DISCOM Regulatory Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Centralized database for retail electricity tariffs, TOD curves, Open Access surcharges, technical grid losses, banking rules, and captive compliance across 17 major industrial states.
          </p>

          {/* Quick Flow CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('explorer')}
              className="vesper-primary px-4 py-2 rounded-full font-medium text-xs transition flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Regulatory Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('landed-cost')}
              className="vesper-secondary px-4 py-2 rounded-full font-medium text-xs transition flex items-center gap-2"
            >
              <span>LCoP Waterfall Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className="vesper-secondary px-4 py-2 rounded-full font-medium text-xs transition flex items-center gap-2"
            >
              <span>Compare Jurisdictions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* States Covered */}
        <div className="vesper-panel p-4 rounded-2xl space-y-1.5 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>States</span>
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{stats.states_covered}</div>
          <p className="text-[10px] text-slate-400">17 Major C&I state markets</p>
        </div>

        {/* DISCOMs Covered */}
        <div className="vesper-panel p-4 rounded-2xl space-y-1.5 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>DISCOMs</span>
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">{stats.discoms_covered}</div>
          <p className="text-[10px] text-slate-400">Public & private utilities</p>
        </div>

        {/* Tariff Schedules */}
        <div className="vesper-panel p-4 rounded-2xl space-y-1.5 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Tariffs</span>
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{stats.tariff_schedules}</div>
          <p className="text-[10px] text-slate-400">Categorized rate tables</p>
        </div>

        {/* Active Regulations */}
        <div className="vesper-panel p-4 rounded-2xl space-y-1.5 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Orders & Acts</span>
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">{stats.active_regulations}</div>
          <p className="text-[10px] text-slate-400">Gazette notifications</p>
        </div>

        {/* Verified Data % */}
        <div className="vesper-panel p-4 rounded-2xl space-y-1.5 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Verified %</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{stats.verified_data_pct}%</div>
          <p className="text-[10px] text-slate-400">Commission order verified</p>
        </div>

        {/* Pending Verification */}
        <div className="vesper-panel p-4 rounded-2xl space-y-1.5 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Under Review</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-300 font-mono">{stats.pending_verification_count}</div>
          <p className="text-[10px] text-slate-400">Future FY draft schedules</p>
        </div>
      </div>

      {/* Quick Launch State Pills */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>Key State Power Markets</span>
            <span className="vesper-live-dot w-1.5 h-1.5 rounded-full" />
          </h3>
          <button
            onClick={() => setActiveTab('states')}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition"
          >
            <span>View All 17 States</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="vesper-state-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {quickStatePills.map((st) => (
            <button
              key={st.id}
              onClick={() => {
                onSelectState(st.id);
                setActiveTab('explorer');
              }}
              className="vesper-state-card flex min-w-0 flex-col justify-between p-4 text-left"
            >
              <div className="min-w-0 w-full">
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 text-xs font-semibold text-[var(--text)]">{st.name}</span>
                  <span className="shrink-0 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--lilac)]">
                    {st.code}
                  </span>
                </div>
                <div className="mt-1.5 truncate text-[11px] text-[var(--muted)]">{st.discom}</div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-2.5 text-[9px] font-mono uppercase tracking-[.14em] text-[var(--lilac)]">
                <span>Query profile</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <IndiaCoverageMap onSelectState={onSelectState} />

      {/* Recently Updated States & Architecture Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recently Updated States List */}
        <div className="vesper-panel lg:col-span-2 rounded-3xl p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                State Regulatory Commission Directory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Overview of latest MYT tariff orders, STU networks, and verification health.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[9px] font-mono uppercase tracking-[.14em] text-[var(--lilac)] font-medium">
              100% Synced
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {stats.recently_updated_states.map((st) => (
              <div
                key={st.id}
                onClick={() => {
                  onSelectState(st.id);
                  setActiveTab('states');
                }}
                className="py-2.5 flex items-center justify-between hover:bg-slate-800/40 px-2.5 rounded-lg cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-teal-300">
                    {st.code}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">{st.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      Regulator: {st.regulator} | Active DISCOMs: {st.discoms}
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
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3.5 flex flex-col justify-between shadow-md">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Data Integrity & Governance
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every tariff rate and rule is entered into structured relational fields. Unverified data is marked explicitly to protect commercial quotation accuracy.
            </p>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-slate-400">
                <span>API Endpoint:</span>
                <span className="font-mono text-teal-400 text-[11px] font-semibold">/api/regulatory-profile</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-slate-400">
                <span>GridFlex Integration:</span>
                <span className="text-teal-400 font-medium">Active & Live</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('api-docs')}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5"
          >
            <span>Open API Reference</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
