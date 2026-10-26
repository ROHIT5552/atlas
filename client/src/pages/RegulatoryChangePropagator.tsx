import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Building2,
  MapPin,
  RefreshCw,
  Coins,
  ShieldAlert,
  ArrowRight,
  Gauge,
  Sparkles,
  Info,
  CheckCircle2,
  HelpCircle,
  Printer
} from 'lucide-react';
import { api } from '../services/api';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function RegulatoryChangePropagator() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');

  // Multi-Year Tariff Order Delta Sliders (₹/kWh)
  const [deltaBaseTariff, setDeltaBaseTariff] = useState(0.35);
  const [deltaCss, setDeltaCss] = useState(0.20);
  const [deltaAs, setDeltaAs] = useState(0.15);
  const [deltaWheeling, setDeltaWheeling] = useState(0.05);

  const [loading, setLoading] = useState(true);
  const [simulationData, setSimulationData] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPDF = async () => {
    setIsExportingPdf(true);
    try {
      await exportElementToPDF({
        elementId: 'change-propagator-report-area',
        fileName: `NewRa_Regulatory_Sensitivity_${selectedState}.pdf`,
        reportTitle: 'SERC MYT Regulatory Impact & Sensitivity Memo',
        entityName: `${selectedState.toUpperCase()} - Tariff Delta (Base: ₹${deltaBaseTariff >= 0 ? '+' : ''}${deltaBaseTariff}, CSS: ₹${deltaCss >= 0 ? '+' : ''}${deltaCss})`
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      runSimulation();
    }
  }, [selectedState, deltaBaseTariff, deltaCss, deltaAs, deltaWheeling]);

  const loadStates = async () => {
    try {
      const stList = await api.getStates();
      setStates(stList.states || (Array.isArray(stList) ? stList : []));
    } catch (err) {
      console.error('Failed to load states', err);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.simulateRegulatoryChange({
        state_id: selectedState,
        delta_base_tariff: deltaBaseTariff,
        delta_css: deltaCss,
        delta_as: deltaAs,
        delta_wheeling: deltaWheeling
      });
      setSimulationData(res);
    } catch (err) {
      console.error('Failed to simulate change impact', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDeltas = () => {
    setDeltaBaseTariff(0.35);
    setDeltaCss(0.20);
    setDeltaAs(0.15);
    setDeltaWheeling(0.05);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-[var(--bg)] border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                Platform Risk Engine • Symphony & Guard SSoT
              </span>
              <span className="text-xs text-slate-400">SERC MYT Tariff Order Sensitivity Simulator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <SlidersHorizontal className="w-7 h-7 text-amber-400" />
              Regulatory Change Propagator
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Simulate the macroeconomic and portfolio financial impact of new SERC tariff orders across Group Captive, Third-Party, and GEOA contracts before they take effect.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={handleResetDeltas}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf || loading || !simulationData}
              className="px-3.5 py-2 bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)]/60 text-white border border-[var(--line)] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              title="Download Sensitivity Memo as Executive PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[var(--lilac)]" />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Export Risk Memo (PDF)'}</span>
            </button>
            <button
              onClick={runSimulation}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-teal-900/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Simulate Impact
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Control Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* State Selection */}
        <div className="bg-[var(--bg)] border border-slate-800 rounded-xl p-4 space-y-3 lg:col-span-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Target Regulatory Jurisdiction (SERC)
              </span>
            </div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            >
              {states.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.regulator_code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Delta 1: Base Tariff Hike */}
        <div className="bg-[var(--bg)] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Base Retail Tariff (Δ)</span>
            <span className={`text-xs font-mono font-bold ${deltaBaseTariff >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {deltaBaseTariff >= 0 ? `+₹${deltaBaseTariff.toFixed(2)}` : `-₹${Math.abs(deltaBaseTariff).toFixed(2)}`}/kWh
            </span>
          </div>
          <p className="text-[11px] text-slate-400">DISCOM Average Cost of Supply / retail tariff shift.</p>
          <input
            type="range"
            min="-1.00"
            max="2.00"
            step="0.05"
            value={deltaBaseTariff}
            onChange={(e) => setDeltaBaseTariff(parseFloat(e.target.value))}
            className="w-full accent-teal-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-₹1.00</span>
            <span>0.00</span>
            <span>+₹2.00</span>
          </div>
        </div>

        {/* Delta 2: Cross Subsidy Surcharge (CSS) */}
        <div className="bg-[var(--bg)] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">CSS Shift (Δ)</span>
            <span className={`text-xs font-mono font-bold ${deltaCss >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {deltaCss >= 0 ? `+₹${deltaCss.toFixed(2)}` : `-₹${Math.abs(deltaCss).toFixed(2)}`}/kWh
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Section 42 surcharge on open access consumers.</p>
          <input
            type="range"
            min="-0.50"
            max="1.50"
            step="0.05"
            value={deltaCss}
            onChange={(e) => setDeltaCss(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-₹0.50</span>
            <span>0.00</span>
            <span>+₹1.50</span>
          </div>
        </div>

        {/* Delta 3: Additional Surcharge (AS) */}
        <div className="bg-[var(--bg)] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Additional Surcharge (Δ)</span>
            <span className={`text-xs font-mono font-bold ${deltaAs >= 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
              {deltaAs >= 0 ? `+₹${deltaAs.toFixed(2)}` : `-₹${Math.abs(deltaAs).toFixed(2)}`}/kWh
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Stranded capacity levy on DISCOM network.</p>
          <input
            type="range"
            min="-0.50"
            max="1.50"
            step="0.05"
            value={deltaAs}
            onChange={(e) => setDeltaAs(parseFloat(e.target.value))}
            className="w-full accent-orange-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-₹0.50</span>
            <span>0.00</span>
            <span>+₹1.50</span>
          </div>
        </div>

        {/* Delta 4: Wheeling Charges */}
        <div className="bg-[var(--bg)] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Wheeling Charge (Δ)</span>
            <span className={`text-xs font-mono font-bold ${deltaWheeling >= 0 ? 'text-sky-400' : 'text-emerald-400'}`}>
              {deltaWheeling >= 0 ? `+₹${deltaWheeling.toFixed(2)}` : `-₹${Math.abs(deltaWheeling).toFixed(2)}`}/kWh
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Discom network utilization tariff revision.</p>
          <input
            type="range"
            min="-0.20"
            max="0.50"
            step="0.02"
            value={deltaWheeling}
            onChange={(e) => setDeltaWheeling(parseFloat(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-₹0.20</span>
            <span>0.00</span>
            <span>+₹0.50</span>
          </div>
        </div>
      </div>

      {/* Simulation Results Breakdown */}
      {simulationData && (
        <div id="change-propagator-report-area" className="space-y-6">
          {/* Strategic Executive Summary Card */}
          <div className="bg-[var(--bg)] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">
                    SERC MYT Regulatory Impact Verdict ({simulationData.state})
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Benchmark Portfolio: {simulationData.simulation_inputs.benchmark_consumer_size}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {simulationData.strategic_verdict}
                </p>
              </div>
            </div>
          </div>

          {/* Three Route Comparative Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Group Captive (26/51) */}
            <div className="bg-[var(--bg)] border border-teal-500/40 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-lg shadow-teal-950/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
                    Rule 3 Structuring
                  </span>
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-white">Group Captive (26/51)</h4>
                  <p className="text-xs text-teal-300/80 font-medium mt-0.5">
                    {simulationData.procurement_routes_impact.group_captive.css_exemption_protection}
                  </p>
                </div>

                <div className="pt-2 divide-y divide-slate-800 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-400">Landed Cost Shift:</span>
                    <span className="font-mono font-bold text-slate-200">
                      +₹{simulationData.procurement_routes_impact.group_captive.landed_cost_shift_rs_kwh.toFixed(2)}/kWh
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-400">Net Client Margin Shift:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +₹{simulationData.procurement_routes_impact.group_captive.net_savings_shift_rs_kwh.toFixed(2)}/kWh
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-400">Annual P&L Impact:</span>
                    <span className="font-mono font-black text-emerald-300 text-sm">
                      +₹{simulationData.procurement_routes_impact.group_captive.annual_portfolio_delta_inr.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-teal-950/40 border border-teal-500/30 rounded-xl text-[11px] text-teal-200 leading-snug">
                Because Captive contracts are exempt from CSS & AS, retail tariff hikes directly widen captive client savings margins.
              </div>
            </div>

            {/* 2. Third Party Bilateral */}
            <div className="bg-[var(--bg)] border border-rose-500/40 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-lg shadow-rose-950/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    Unhedged Commercial
                  </span>
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-white">Third-Party Bilateral</h4>
                  <p className="text-xs text-rose-300/80 font-medium mt-0.5">
                    {simulationData.procurement_routes_impact.third_party_bilateral.css_exemption_protection}
                  </p>
                </div>

                <div className="pt-2 divide-y divide-slate-800 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-400">Landed Cost Shift:</span>
                    <span className="font-mono font-bold text-rose-400">
                      +₹{simulationData.procurement_routes_impact.third_party_bilateral.landed_cost_shift_rs_kwh.toFixed(2)}/kWh
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-400">Net Client Margin Shift:</span>
                    <span className={`font-mono font-bold ${simulationData.procurement_routes_impact.third_party_bilateral.net_savings_shift_rs_kwh >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {simulationData.procurement_routes_impact.third_party_bilateral.net_savings_shift_rs_kwh >= 0 ? '+' : ''}
                      ₹{simulationData.procurement_routes_impact.third_party_bilateral.net_savings_shift_rs_kwh.toFixed(2)}/kWh
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-400">Annual P&L Impact:</span>
                    <span className={`font-mono font-black text-sm ${simulationData.procurement_routes_impact.third_party_bilateral.annual_portfolio_delta_inr >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                      {simulationData.procurement_routes_impact.third_party_bilateral.annual_portfolio_delta_inr >= 0 ? '+' : ''}
                      ₹{simulationData.procurement_routes_impact.third_party_bilateral.annual_portfolio_delta_inr.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-[11px] text-rose-200 leading-snug">
                Third-party PPAs bear the brunt of SERC surcharge hikes (CSS + AS), eroding client savings unless hedged by PPA discount clauses.
              </div>
            </div>

            {/* 3. Green Energy Open Access (GEOA) */}
            <div className="bg-[var(--bg)] border border-sky-500/40 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-lg shadow-sky-950/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
                    GEOA Rules 2022
                  </span>
                  <Gauge className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-white">Green Energy OA (GEOA)</h4>
                  <p className="text-xs text-sky-300/80 font-medium mt-0.5">
                    {simulationData.procurement_routes_impact.green_energy_open_access.css_exemption_protection}
                  </p>
                </div>

                <div className="pt-2 divide-y divide-slate-800 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-400">Landed Cost Shift:</span>
                    <span className="font-mono font-bold text-sky-400">
                      +₹{simulationData.procurement_routes_impact.green_energy_open_access.landed_cost_shift_rs_kwh.toFixed(2)}/kWh
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-400">Net Client Margin Shift:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +₹{simulationData.procurement_routes_impact.green_energy_open_access.net_savings_shift_rs_kwh.toFixed(2)}/kWh
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-400">Annual P&L Impact:</span>
                    <span className="font-mono font-black text-emerald-300 text-sm">
                      +₹{simulationData.procurement_routes_impact.green_energy_open_access.annual_portfolio_delta_inr.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-xl text-[11px] text-sky-200 leading-snug">
                GEOA rules cap CSS and exempt RE from additional surcharges in progressive states, offering a balanced mid-tier risk profile.
              </div>
            </div>
          </div>

          {/* Integration Callout */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Simulated impacts are dynamically broadcast to <strong>NewRa Symphony</strong> (Portfolio Manager) and <strong>NewRa Guard</strong> (PPA Contract Protection).</span>
            </div>
            <span className="font-mono text-teal-400 font-semibold">API SSoT Sync Active</span>
          </div>
        </div>
      )}
    </div>
  );
}
