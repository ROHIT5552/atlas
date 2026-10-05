import React, { useState, useEffect } from 'react';
import { Building2, Search, MapPin, ExternalLink, ArrowRight, Filter, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function DiscomMaster({ onSelectDiscom, onOpenDetail }) {
  const [discoms, setDiscoms] = useState([]);
  const [states, setStates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('All');
  const [selectedOwnership, setSelectedOwnership] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dRes, sRes] = await Promise.all([
          api.getDiscoms({
            search: searchTerm,
            state_id: selectedStateFilter === 'All' ? undefined : selectedStateFilter
          }),
          api.getStates()
        ]);
        setDiscoms(dRes.discoms || []);
        setStates(sRes.states || []);
      } catch (err) {
        console.error('Failed to load discoms:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchTerm, selectedStateFilter]);

  const filteredDiscoms = discoms.filter(d => {
    if (selectedOwnership === 'All') return true;
    const type = (d.ownership_type || d.ownership || '').toLowerCase();
    if (selectedOwnership === 'State PSU') return type.includes('state') || type.includes('public') || type.includes('municipal');
    if (selectedOwnership === 'Private') return type.includes('private');
    if (selectedOwnership === 'Joint Venture (JV)') return type.includes('joint venture') || type.includes('jv');
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Distribution Utilities</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Indian Electricity DISCOM Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            49 state and private electricity distribution licensees, consumer category classifications, and retail supply territories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 font-bold">
            {filteredDiscoms.length} DISCOMs Listed
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search DISCOM (e.g. MSEDCL, DGVCL, JVVNL, BESCOM, BRPL, Tata Power)..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">State:</span>
          <select
            value={selectedStateFilter}
            onChange={(e) => setSelectedStateFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All States (17)</option>
            {states.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ownership Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Ownership:</span>
          <select
            value={selectedOwnership}
            onChange={(e) => setSelectedOwnership(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Types</option>
            <option value="State PSU">State PSU / Public</option>
            <option value="Private">Private</option>
            <option value="Joint Venture (JV)">Joint Venture (JV)</option>
          </select>
        </div>
      </div>

      {/* DISCOM Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading DISCOMs directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiscoms.map((disc) => (
            <div
              key={disc.id}
              className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-md flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                        {disc.ownership_type || disc.ownership}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{disc.state_name || disc.state_id}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition mt-1">
                      {disc.name}
                    </h3>
                  </div>
                  <StatusBadge status={disc.status} />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-slate-500">Coverage:</span> {disc.service_territory}
                </p>

                <div className="space-y-1 text-xs text-slate-300 pt-1">
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-slate-500">Official Code:</span>
                    <span className="text-cyan-400 font-mono text-xs font-bold">{disc.code}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-slate-500">Customer Base:</span>
                    <span className="text-slate-300 font-medium">{disc.consumer_base || 'Statewide Consumers'}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-slate-500">Tariff Order Ref:</span>
                    <span className="text-cyan-400 font-mono text-[11px] truncate max-w-[170px]">{disc.tariff_order_ref}</span>
                  </div>
                </div>

                {/* Connection Categories Tag Cloud */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Configured Categories:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {disc.connection_categories?.slice(0, 3).map((cat, cIdx) => (
                      <span key={cIdx} className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-slate-400 border border-slate-800">
                        {cat}
                      </span>
                    ))}
                    {disc.connection_categories?.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-slate-500 border border-slate-800">
                        +{disc.connection_categories.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => onSelectDiscom(disc.id)}
                  className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>Query Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onOpenDetail(disc.id)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

