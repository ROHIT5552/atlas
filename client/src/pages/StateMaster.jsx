import React, { useState, useEffect } from 'react';
import { MapPin, Search, Building2, ExternalLink, ArrowRight, Filter, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function StateMaster({ onSelectState, onOpenDetail }) {
  const [states, setStates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStates() {
      try {
        setLoading(true);
        const res = await api.getStates({
          search: searchTerm,
          ...(selectedRegion !== 'All' && { region: selectedRegion })
        });
        setStates(res.states || []);
      } catch (err) {
        console.error('Failed to load states:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStates();
  }, [searchTerm, selectedRegion]);

  const regions = ['All', 'Western', 'Southern', 'Northern', 'Eastern'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>State Jurisdictions</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Indian State Electricity Commission Master
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive regulatory commission, STU, SLDC, and open access framework records across 17 major Indian states.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 font-bold">
            {states.length} States Cataloged
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search state name, code (e.g. MH, GJ), or regulator (MERC, GERC)..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Region Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Region:
          </span>
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedRegion === reg
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* State Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading states master catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {states.map((st) => (
            <div
              key={st.id}
              className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-md flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-sm text-cyan-400">
                      {st.state_code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                        {st.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {st.region} Region
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={st.status} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-500">Regulator:</span>
                    <a
                      href={st.regulator_website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>{st.regulator_code}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-500">SLDC:</span>
                    <span className="text-slate-300 font-medium">{st.sldc_code}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-500">STU Network:</span>
                    <span className="text-slate-300 font-medium truncate max-w-[170px]">{st.stu_code}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">DISCOMs Cataloged:</span>
                    <span className="text-emerald-400 font-bold">{st.discom_count} utilities</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  {st.oa_framework}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => onSelectState(st.id)}
                  className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>Query Tariffs</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onOpenDetail(st.id)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  title="View State Regulations & STU details"
                >
                  Full Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
