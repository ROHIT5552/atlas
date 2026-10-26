import React, { useState, useEffect } from 'react';
import { Receipt, Search, Filter, Layers, Download, Check, FileText } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { cleanUnit } from '../utils/formatUtils';

export default function TariffMaster({ onSelectTariff }) {
  const [tariffs, setTariffs] = useState([]);
  const [states, setStates] = useState([]);
  const [discoms, setDiscoms] = useState([]);
  const [consumerCategories, setConsumerCategories] = useState([]);

  const [selectedState, setSelectedState] = useState('All');
  const [selectedDiscom, setSelectedDiscom] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFy, setSelectedFy] = useState('FY 2025-26');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [sRes, cRes] = await Promise.all([
          api.getStates(),
          api.getConsumerCategories()
        ]);
        setStates(sRes.states || []);
        setConsumerCategories(cRes.categories || []);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function loadDiscoms() {
      if (selectedState === 'All') {
        setDiscoms([]);
        setSelectedDiscom('All');
        return;
      }
      try {
        const dRes = await api.getDiscoms({ state_id: selectedState });
        setDiscoms(dRes.discoms || []);
        setSelectedDiscom('All');
      } catch (err) {
        console.error('Failed to load DISCOMs for state:', err);
      }
    }
    loadDiscoms();
  }, [selectedState]);

  useEffect(() => {
    async function loadTariffs() {
      try {
        setLoading(true);
        const res = await api.getTariffs({
          state_id: selectedState === 'All' ? undefined : selectedState,
          discom_id: selectedDiscom === 'All' ? undefined : selectedDiscom,
          consumer_category_id: selectedCategory === 'All' ? undefined : selectedCategory,
          financial_year: selectedFy
        });
        setTariffs(res.tariffs || []);
      } catch (err) {
        console.error('Failed to load tariffs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTariffs();
  }, [selectedState, selectedDiscom, selectedCategory, selectedFy]);

  const filteredTariffs = tariffs.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.tariff_category_name?.toLowerCase().includes(term) ||
      t.discom_name?.toLowerCase().includes(term) ||
      t.state_name?.toLowerCase().includes(term) ||
      t.voltage_level?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <Receipt className="w-4 h-4" />
            <span>Structured Rate Cards</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Retail Electricity Tariff Master
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Structured energy tariffs, demand charges, power factor rules, and electricity duty across Indian utilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 font-bold">
            {filteredTariffs.length} Tariffs Matching
          </span>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search category, voltage..."
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* State Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400">State</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All States</option>
            {states.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* DISCOM Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400">DISCOM</label>
          <select
            value={selectedDiscom}
            onChange={(e) => setSelectedDiscom(e.target.value)}
            disabled={selectedState === 'All'}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
          >
            <option value="All">All DISCOMs</option>
            {discoms.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Categories</option>
            {consumerCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* FY Version Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400">Financial Year</label>
          <select
            value={selectedFy}
            onChange={(e) => setSelectedFy(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="FY 2025-26">FY 2025-26 (Active)</option>
            <option value="FY 2024-25">FY 2024-25 (Historical)</option>
            <option value="FY 2026-27">FY 2026-27 (Draft)</option>
          </select>
        </div>
      </div>

      {/* Tariffs Master Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading structured tariff records...</div>
      ) : (
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">State / DISCOM</th>
                  <th className="px-4 py-3">Category Name</th>
                  <th className="px-4 py-3">Voltage</th>
                  <th className="px-4 py-3">Energy Charge</th>
                  <th className="px-4 py-3">Demand Charge</th>
                  <th className="px-4 py-3">Duty & Fuel</th>
                  <th className="px-4 py-3">Order Citation</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
                {filteredTariffs.slice(0, 100).map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{t.discom_name}</div>
                      <div className="text-[11px] text-slate-400">{t.state_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-200">{t.tariff_category_name}</div>
                      <div className="text-[10px] text-slate-500">{t.connection_type}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                      {t.voltage_level}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-white">
                      ₹ {t.energy_charge} <span className="text-[10px] text-slate-400">/ {cleanUnit(t.energy_charge_unit, 'kVAh')}</span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      ₹ {t.demand_charge} <span className="text-[10px] text-slate-400">/ {cleanUnit(t.demand_charge_unit, 'kVA/mo')}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-400">
                      {t.electricity_duty}% + ₹ {t.fac_fppas}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-400 max-w-[150px] truncate" title={`${t.source_document} (p. ${t.source_page})`}>
                      {t.source_document}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.verification_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

