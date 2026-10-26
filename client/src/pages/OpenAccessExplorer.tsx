import React, { useState, useEffect } from 'react';
import { Unlock, MapPin, Building2, Layers, Filter, CheckCircle2, TrendingUp, Printer } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function OpenAccessExplorer() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [oaRules, setOaRules] = useState(null);
  const [oaCharges, setOaCharges] = useState([]);
  const [losses, setLosses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPDF = async () => {
    if (!oaRules) return;
    setIsExportingPdf(true);
    try {
      await exportElementToPDF({
        elementId: 'open-access-report-area',
        fileName: `NewRa_Open_Access_Framework_${selectedState}.pdf`,
        reportTitle: 'Statutory Open Access Rules, Surcharges & Loss Matrix',
        entityName: `${selectedState.toUpperCase()} - CSS & AS Surcharges, STU/DISCOM Wheeling & Losses`
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

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
    async function loadOaData() {
      if (!selectedState) return;
      try {
        setLoading(true);
        const [rRes, cRes, lRes] = await Promise.all([
          api.getOpenAccessRules(selectedState),
          api.getOaCharges({ state_id: selectedState }),
          api.getLosses({ state_id: selectedState })
        ]);
        setOaRules(rRes);
        setOaCharges(cRes.charges || []);
        setLosses(lRes.losses || []);
      } catch (err) {
        console.error('Failed to load OA data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOaData();
  }, [selectedState]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <Unlock className="w-4 h-4" />
            <span>Grid Wheeling & Surcharges</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Open Access Rules, Charges & Technical Loss Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Statutory eligibility thresholds (100 kW GEOA vs 1 MW Conventional), itemized CSS, AS, wheeling & transmission charges, and voltage loss tiers.
          </p>
        </div>

        {/* Actions & Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf || loading || !oaRules}
            className="px-3.5 py-2 bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)]/50 border border-[var(--line)] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-md"
            title="Download Open Access Framework & Losses as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--lilac)]" />
            <span>{isExportingPdf ? 'Exporting...' : 'Export OA Matrix (PDF)'}</span>
          </button>

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
      </div>

      {loading || !oaRules ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading Open Access rules & charges...</div>
      ) : (
        <div id="open-access-report-area" className="space-y-6">
          {/* Eligibility KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Conventional OA Threshold</span>
              <div className="text-2xl font-extrabold font-mono text-white">{oaRules.oa_threshold_conventional_mw} MW</div>
              <p className="text-xs text-slate-400">Connected contracted load</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Green Energy OA (GEOA)</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-400">{oaRules.oa_threshold_green_energy_kw} kW</div>
              <p className="text-xs text-slate-400">No cap for captive renewables</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Short-Term (STOA) Nodal</span>
              <div className="text-lg font-bold text-cyan-400">{oaRules.nodal_agency_st}</div>
              <p className="text-xs text-slate-400">Up to 1 month duration</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Approval Turnaround</span>
              <div className="text-2xl font-extrabold font-mono text-white">{oaRules.approval_turnaround_days} Days</div>
              <p className="text-xs text-slate-400">Single window clearance</p>
            </div>
          </div>

          {/* OA Charges Breakdown Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                DISCOM-Wise Open Access Charges (FY 2025-26)
              </h3>
              <span className="text-xs text-slate-500">{oaCharges.length} Route Configurations</span>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">DISCOM / Utility</th>
                      <th className="px-4 py-3">OA Route Type</th>
                      <th className="px-4 py-3">Wheeling</th>
                      <th className="px-4 py-3">Transmission</th>
                      <th className="px-4 py-3">Cross Subsidy (CSS)</th>
                      <th className="px-4 py-3">Additional Surcharge</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                    {oaCharges.map((ch, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="px-4 py-3 font-bold text-white uppercase">{ch.discom_id}</td>
                        <td className="px-4 py-3 font-semibold text-cyan-300">{ch.oa_type}</td>
                        <td className="px-4 py-3 font-mono">₹ {ch.wheeling_charge} / kWh</td>
                        <td className="px-4 py-3 font-mono">₹ {ch.transmission_charge} / MW/day</td>
                        <td className="px-4 py-3 font-mono text-amber-400">₹ {ch.css} / kWh</td>
                        <td className="px-4 py-3 font-mono text-purple-400">₹ {ch.additional_surcharge} / kWh</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={ch.verification_status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Technical Loss Matrix */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Voltage-Wise Technical Loss Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {losses.map((l, lIdx) => (
                <div key={lIdx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1.5 shadow-sm">
                  <div className="text-xs font-bold text-cyan-400 font-mono">{l.voltage_level}</div>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono">{l.total_technical_loss_pct}%</div>
                  <div className="text-[10px] text-slate-400">
                    Tx: {l.transmission_loss_pct}% | Wh: {l.wheeling_loss_pct}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

