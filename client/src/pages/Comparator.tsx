import React, { useState, useEffect } from 'react';
import { GitCompare, MapPin, Building2, Layers, Check, ArrowRight, TrendingUp, Printer } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function Comparator() {
  const [compareType, setCompareType] = useState('state'); // 'state' | 'discom'
  const [availableStates, setAvailableStates] = useState([]);
  const [availableDiscoms, setAvailableDiscoms] = useState([]);

  const [selectedIds, setSelectedIds] = useState(['maharashtra', 'gujarat', 'rajasthan']);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPDF = async () => {
    if (!comparisonData || !comparisonData.matrix) return;
    setIsExportingPdf(true);
    try {
      await exportElementToPDF({
        elementId: 'comparator-report-area',
        fileName: `NewRa_Comparison_Matrix_${compareType}.pdf`,
        reportTitle: `Multi-${compareType === 'state' ? 'State' : 'DISCOM'} Regulatory Comparison Matrix`,
        entityName: `Benchmarking: ${selectedIds.join(', ').toUpperCase()}`
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  useEffect(() => {
    async function loadMeta() {
      try {
        const [sRes, dRes] = await Promise.all([
          api.getStates(),
          api.getDiscoms()
        ]);
        setAvailableStates(sRes.states || []);
        setAvailableDiscoms(dRes.discoms || []);
      } catch (err) {
        console.error('Failed to load comparison metadata:', err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function fetchComparison() {
      if (selectedIds.length === 0) return;
      try {
        setLoading(true);
        const data = await api.compare(compareType, selectedIds);
        setComparisonData(data);
      } catch (err) {
        console.error('Failed to load comparison:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchComparison();
  }, [compareType, selectedIds]);

  const handleToggleId = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(i => i !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleSwitchType = (type) => {
    setCompareType(type);
    if (type === 'state') {
      setSelectedIds(['maharashtra', 'gujarat', 'rajasthan']);
    } else {
      setSelectedIds(['msedcl', 'dgvcl', 'jvvnl']);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs uppercase tracking-wider">
            <GitCompare className="w-4 h-4" />
            <span>Cross-Jurisdiction Matrix</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
            Side-by-Side Regulatory Comparator
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare tariffs, cross-subsidy surcharges, transmission losses, and renewable banking rules across up to 4 states or DISCOMs simultaneously.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf || loading || !comparisonData?.matrix}
            className="px-3.5 py-2 bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)]/50 border border-[var(--line)] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-md"
            title="Download Regulatory Matrix as Executive PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--lilac)]" />
            <span>{isExportingPdf ? 'Exporting...' : 'Export Matrix (PDF)'}</span>
          </button>

          {/* Type Toggle */}
          <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
            <button
              onClick={() => handleSwitchType('state')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                compareType === 'state'
                  ? 'bg-slate-800 text-teal-300 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>State vs State</span>
            </button>
            <button
              onClick={() => handleSwitchType('discom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                compareType === 'discom'
                  ? 'bg-slate-800 text-teal-300 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>DISCOM vs DISCOM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selector Pills */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
          <span>Select Entities to Compare (Max 4):</span>
          <span className="font-mono text-teal-400 font-semibold">{selectedIds.length} / 4 Selected</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {compareType === 'state'
            ? availableStates.map((st) => {
                const isSelected = selectedIds.includes(st.id);
                return (
                  <button
                    key={st.id}
                    onClick={() => handleToggleId(st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-teal-400" />}
                    <span>{st.name}</span>
                  </button>
                );
              })
            : availableDiscoms.slice(0, 18).map((d) => {
                const isSelected = selectedIds.includes(d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => handleToggleId(d.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-teal-400" />}
                    <span>{d.short_name || d.name}</span>
                  </button>
                );
              })}
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      {loading || !comparisonData || !comparisonData.matrix ? (
        <div className="py-20 text-center text-xs text-slate-400">Building comparison matrix...</div>
      ) : (
        <div id="comparator-report-area" className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[780px]">
              <thead className="bg-slate-900/90 text-slate-300 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 w-72 sticky left-0 bg-slate-900 z-10 border-r border-slate-800">Regulatory Dimension</th>
                  {comparisonData.matrix.map((item, idx) => (
                    <th key={idx} className="px-5 py-3.5 font-bold text-slate-100 text-sm">
                      <div className="text-teal-400 text-base">{item.state_name || item.discom_name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {compareType === 'state' ? `Regulator: ${item.regulator}` : `State: ${item.state_name}`}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {/* 1. Base Energy Tariff */}
                <tr className="hover:bg-slate-900/40">
                  <td className="px-5 py-3.5 text-slate-400 font-semibold sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    HT Base Energy Rate (Rs/kVAh)
                  </td>
                  {comparisonData.matrix.map((item, idx) => (
                    <td key={idx} className="px-5 py-3.5 font-mono text-cyan-300 font-bold text-sm">
                      Rs {item.avg_ht_energy_charge_rs_kvah || item.energy_charge_rs_kvah || '7.50'}
                    </td>
                  ))}
                </tr>

                {/* 2. Demand Charge */}
                <tr className="hover:bg-slate-900/40">
                  <td className="px-5 py-3.5 text-slate-400 font-semibold sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Demand Charge (Rs/kVA/mo)
                  </td>
                  {comparisonData.matrix.map((item, idx) => (
                    <td key={idx} className="px-5 py-3.5 font-mono text-white">
                      Rs {item.avg_demand_charge_rs_kva_month || item.demand_charge_rs_kva_m || '450'}
                    </td>
                  ))}
                </tr>

                {/* 3. Cross Subsidy Surcharge */}
                <tr className="hover:bg-slate-900/40">
                  <td className="px-5 py-3.5 text-slate-400 font-semibold sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Cross Subsidy Surcharge (CSS)
                  </td>
                  {comparisonData.matrix.map((item, idx) => (
                    <td key={idx} className="px-5 py-3.5 font-mono text-amber-400">
                      Rs {item.cross_subsidy_surcharge_rs_kwh || item.cross_subsidy_surcharge || '1.85'} / kWh
                    </td>
                  ))}
                </tr>

                {/* 4. Additional Surcharge */}
                <tr className="hover:bg-slate-900/40">
                  <td className="px-5 py-3.5 text-slate-400 font-semibold sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Additional Surcharge (AS)
                  </td>
                  {comparisonData.matrix.map((item, idx) => (
                    <td key={idx} className="px-5 py-3.5 font-mono text-purple-400">
                      Rs {item.additional_surcharge_rs_kwh || item.additional_surcharge || '0.90'} / kWh
                    </td>
                  ))}
                </tr>

                {/* 5. Wheeling & Transmission Technical Loss */}
                <tr className="hover:bg-slate-900/40">
                  <td className="px-5 py-3.5 text-slate-400 font-semibold sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Technical Grid Losses (33 kV)
                  </td>
                  {comparisonData.matrix.map((item, idx) => (
                    <td key={idx} className="px-5 py-3.5 font-mono text-emerald-400 font-bold text-sm">
                      Tx: {item.transmission_loss_pct || '3.20%'} | Wh: {item.wheeling_loss_pct || '4.50%'}
                    </td>
                  ))}
                </tr>

                {/* 6. RE Banking Horizon & Charge */}
                <tr className="hover:bg-slate-900/40">
                  <td className="px-5 py-3.5 text-slate-400 font-semibold sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Renewable Banking Framework
                  </td>
                  {comparisonData.matrix.map((item, idx) => (
                    <td key={idx} className="px-5 py-3.5 text-xs text-slate-300">
                      <div className="font-semibold text-white">{item.banking_period || 'Monthly Cycle'}</div>
                      <div className="text-[11px] text-cyan-400 font-mono">Charge: {item.banking_charge_pct || 2}% in-kind</div>
                    </td>
                  ))}
                </tr>

                {/* 7. GEOA Threshold */}
                <tr className="hover:bg-slate-900/40">
                  <td className="px-5 py-3.5 text-slate-400 font-semibold sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Green Energy OA Threshold
                  </td>
                  {comparisonData.matrix.map((item, idx) => (
                    <td key={idx} className="px-5 py-3.5 font-mono text-emerald-400">
                      {item.geoa_threshold_kw || 100} kW
                    </td>
                  ))}
                </tr>

                {/* 8. Captive CSS Exemption */}
                <tr className="hover:bg-slate-900/40">
                  <td className="px-5 py-3.5 text-slate-400 font-semibold sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Captive CSS & AS Exemption
                  </td>
                  {comparisonData.matrix.map((item, idx) => (
                    <td key={idx} className="px-5 py-3.5 text-xs text-emerald-400 font-bold">
                      100% Exempted (Rule 3)
                    </td>
                  ))}
                </tr>

                {/* 9. Data Verification Badge */}
                <tr className="hover:bg-slate-900/40">
                  <td className="px-5 py-3.5 text-slate-400 font-semibold sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Commission Sync Status
                  </td>
                  {comparisonData.matrix.map((item, idx) => (
                    <td key={idx} className="px-5 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


