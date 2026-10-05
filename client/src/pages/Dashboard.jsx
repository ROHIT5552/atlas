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
  { id: 'maharashtra', name: 'Maharashtra', code: 'MH', discom: 'MSEDCL', color: 'border-teal-500/30 text-teal-300 bg-teal-950/20 hover:bg-teal-900/30' },
  { id: 'gujarat', name: 'Gujarat', code: 'GJ', discom: 'DGVCL / GUVNL', color: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/20 hover:bg-emerald-900/30' },
  { id: 'rajasthan', name: 'Rajasthan', code: 'RJ', discom: 'JVVNL / RVPNL', color: 'border-amber-500/30 text-amber-300 bg-amber-950/20 hover:bg-amber-900/30' },
  { id: 'karnataka', name: 'Karnataka', code: 'KA', discom: 'BESCOM / KPTCL', color: 'border-indigo-500/30 text-indigo-300 bg-indigo-950/20 hover:bg-indigo-900/30' },
  { id: 'tamil-nadu', name: 'Tamil Nadu', code: 'TN', discom: 'TANGEDCO', color: 'border-sky-500/30 text-sky-300 bg-sky-950/20 hover:bg-sky-900/30' },
  { id: 'telangana', name: 'Telangana', code: 'TS', discom: 'TSSPDCL', color: 'border-cyan-500/30 text-cyan-300 bg-cyan-950/20 hover:bg-cyan-900/30' }
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
      <div className="relative rounded-2xl p-6 sm:p-7 overflow-hidden bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-400 text-xs font-semibold tracking-wide">
            <Zap className="w-3.5 h-3.5" />
            <span>Standardized Indian Power Regulatory Intelligence Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
            NewRa State & DISCOM Regulatory Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Centralized database for retail electricity tariffs, TOD curves, Open Access surcharges, technical grid losses, banking rules, and captive compliance across 17 major industrial states.
          </p>

          {/* Quick Flow CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('explorer')}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-sm shadow-teal-500/20 transition flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Regulatory Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('landed-cost')}
              className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition flex items-center gap-2"
            >
              <span>LCoP Waterfall Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition flex items-center gap-2"
            >
              <span>Compare Jurisdictions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* States Covered */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-sm space-y-1.5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>States</span>
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{stats.states_covered}</div>
          <p className="text-[10px] text-slate-400">17 Major C&I state markets</p>
        </div>

        {/* DISCOMs Covered */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-sm space-y-1.5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>DISCOMs</span>
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">{stats.discoms_covered}</div>
          <p className="text-[10px] text-slate-400">Public & private utilities</p>
        </div>

        {/* Tariff Schedules */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-sm space-y-1.5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Tariffs</span>
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{stats.tariff_schedules}</div>
          <p className="text-[10px] text-slate-400">Categorized rate tables</p>
        </div>

        {/* Active Regulations */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-sm space-y-1.5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Orders & Acts</span>
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">{stats.active_regulations}</div>
          <p className="text-[10px] text-slate-400">Gazette notifications</p>
        </div>

        {/* Verified Data % */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-sm space-y-1.5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Verified %</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{stats.verified_data_pct}%</div>
          <p className="text-[10px] text-slate-400">Commission order verified</p>
        </div>

        {/* Pending Verification */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-sm space-y-1.5 hover:border-slate-700 transition">
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
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          </h3>
          <button
            onClick={() => setActiveTab('states')}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition"
          >
            <span>View All 17 States</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {quickStatePills.map((st) => (
            <button
              key={st.id}
              onClick={() => {
                onSelectState(st.id);
                setActiveTab('explorer');
              }}
              className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] shadow-sm flex flex-col justify-between ${st.color}`}
            >
              <div>
                <div className="text-xs font-bold text-slate-100">{st.name}</div>
                <div className="text-[11px] opacity-80 mt-0.5 font-medium">{st.discom}</div>
              </div>
              <div className="mt-2.5 text-[9px] uppercase font-bold tracking-wider opacity-80 flex items-center justify-between">
                <span>Query Profile</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recently Updated States & Architecture Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recently Updated States List */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                State Regulatory Commission Directory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Overview of latest MYT tariff orders, STU networks, and verification health.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-400 font-bold">
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


