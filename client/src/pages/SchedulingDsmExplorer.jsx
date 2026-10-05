import React, { useState, useEffect } from 'react';
import { CalendarClock, AlertTriangle, CheckCircle2, TrendingDown, Layers, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function SchedulingDsmExplorer() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [scheduling, setScheduling] = useState(null);
  const [dsm, setDsm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStates() {
      try {
        const sRes = await api.getStates();
        setStates(sRes.states || []);
      } catch (err) {
        console.error('Failed to load states:', err);
      }
    }
    loadStates();
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!selectedState) return;
      try {
        setLoading(true);
        const [sRes, dRes] = await Promise.all([
          api.getScheduling(selectedState),
          api.getDsm(selectedState)
        ]);
        setScheduling(sRes);
        setDsm(dRes);
      } catch (err) {
        console.error('Failed to load scheduling & DSM data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedState]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <CalendarClock className="w-4 h-4" />
            <span>Grid Dispatch & Deviation Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Scheduling, Forecasting & DSM Settlement
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Intra-day 15-minute dispatch timelines, day-ahead gate closures, QCA aggregation models, and commercial Deviation Settlement Mechanism (DSM) penalties.
          </p>
        </div>

        {/* State Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Select State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-semibold"
          >
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading || !scheduling || !dsm ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading scheduling & DSM regulations...</div>
      ) : (
        <div className="space-y-6">
          {/* Top Scheduling Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Dispatch Time Block</span>
              <div className="text-2xl font-extrabold font-mono text-cyan-400">{scheduling.time_block_duration_minutes} Mins</div>
              <p className="text-xs text-slate-400">96 dispatch blocks / day</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Max Daily Revisions</span>
              <div className="text-2xl font-extrabold font-mono text-white">{scheduling.max_revisions_per_day} Slots</div>
              <p className="text-xs text-slate-400">Intra-day dispatch updates</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Day-Ahead Gate Closure</span>
              <div className="text-xl font-bold text-amber-400">10:00 AM (D-1)</div>
              <p className="text-xs text-slate-400">Mandatory SLDC submission</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Intra-Day Lead Time</span>
              <div className="text-xl font-bold text-emerald-400">4 Time Blocks</div>
              <p className="text-xs text-slate-400">Effective from (N+4)th block</p>
            </div>
          </div>

          {/* DSM Error Bands & Penalty Tiers Table */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Renewable Energy DSM Deviation Error Bands & Penalties</span>
              </h3>
              <StatusBadge status={dsm.verification_status} />
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Deviation Band (% of AvC)</th>
                    <th className="px-4 py-3">Penalty Rate / Settlement Term</th>
                    <th className="px-4 py-3">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                  <tr className="hover:bg-slate-900/50">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">Within Â±10%</td>
                    <td className="px-4 py-3">100% Fixed PPA / Feed-in Tariff (No Penalty)</td>
                    <td className="px-4 py-3 text-emerald-400">Green Safe Zone</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">Â±10% to Â±15%</td>
                    <td className="px-4 py-3">90% of PPA rate (10% penalty on absolute deviation)</td>
                    <td className="px-4 py-3 text-amber-400">Moderate Penalty</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="px-4 py-3 font-mono font-bold text-rose-400">Beyond Â±15%</td>
                    <td className="px-4 py-3">75% to 50% of PPA rate + Ancillary Grid Support surcharge</td>
                    <td className="px-4 py-3 text-rose-400">Heavy Commercial Penalty</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-300 font-semibold">QCA Coordination Note:</span> Individual generators pooled under a Qualified Coordinating Agency (QCA) aggregate deviations at the pooling substation bus, reducing net portfolio penalties by up to 40%.
            </p>
          </div>

          {/* Statutory Documents Reference */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Governing Commission Order</span>
            <p className="text-slate-300 font-medium">{dsm.source_document}</p>
          </div>
        </div>
      )}
    </div>
  );
}

