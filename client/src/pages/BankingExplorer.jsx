import React, { useState, useEffect } from 'react';
import { PiggyBank, Sun, Wind, CheckCircle2, AlertTriangle, Layers, Info, Calculator, ArrowRight, Zap, TrendingUp, RefreshCw, Printer } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function BankingExplorer() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [banking, setBanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Live Interactive Banking & Settlement Calculator State
  const [reCapacityMw, setReCapacityMw] = useState(5.0); // 5 MW Solar/Wind
  const [monthlyGenerationMwh, setMonthlyGenerationMwh] = useState(720); // 720 MWh
  const [monthlyConsumptionMwh, setMonthlyConsumptionMwh] = useState(540); // 540 MWh
  const [retailGridTariff, setRetailGridTariff] = useState(7.85); // Rs/kWh
  const [appcRate, setAppcRate] = useState(3.45); // Rs/kWh APPC cashout

  const handleExportPDF = async () => {
    if (!banking) return;
    setIsExportingPdf(true);
    try {
      await exportElementToPDF({
        elementId: 'banking-report-area',
        fileName: `NewRa_Banking_Settlement_${selectedState}.pdf`,
        reportTitle: 'RE Energy Banking & 15-Minute Settlement Architecture',
        entityName: `${selectedState.toUpperCase()} - Banking Period: ${banking.banking_period} | In-Kind Charge: ${banking.banking_charge_pct}%`
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
    async function loadBanking() {
      if (!selectedState) return;
      try {
        setLoading(true);
        const data = await api.getBanking(selectedState);
        setBanking(data);
      } catch (err) {
        console.error('Failed to load banking rules:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBanking();
  }, [selectedState]);

  // Settlement Mathematics
  const directConsumptionMwh = Math.min(monthlyGenerationMwh, monthlyConsumptionMwh);
  const grossSurplusMwh = Math.max(0, monthlyGenerationMwh - monthlyConsumptionMwh);
  const bankingChargePct = banking?.banking_charge_pct ?? 2.0;
  const inKindDeductionMwh = (grossSurplusMwh * bankingChargePct) / 100;
  const netBankedEnergyMwh = grossSurplusMwh - inKindDeductionMwh;
  const gridDeficitMwh = Math.max(0, monthlyConsumptionMwh - monthlyGenerationMwh);
  const bankedEnergyDrawnMwh = Math.min(netBankedEnergyMwh, gridDeficitMwh);
  const unutilizedSurplusMwh = Math.max(0, netBankedEnergyMwh - bankedEnergyDrawnMwh);
  const cashoutValueRs = unutilizedSurplusMwh * 1000 * appcRate;
  const directSavingsRs = directConsumptionMwh * 1000 * retailGridTariff;
  const bankedSavingsRs = bankedEnergyDrawnMwh * 1000 * retailGridTariff;
  const totalCommercialBenefitRs = directSavingsRs + bankedSavingsRs + cashoutValueRs;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2D50A1]/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#28B8B4] font-extrabold text-xs uppercase tracking-wider">
            <PiggyBank className="w-4 h-4" />
            <span>Energy Settlement Framework & Accounting Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Renewable Energy Banking Rules & Settlement Logic
          </h1>
          <p className="text-xs text-[#C6CBD9] mt-1">
            State-by-state 15-minute reconciliation, monthly/annual banking periods, in-kind energy deduction (2% to 8%), TOD cross-adjustment restrictions, and year-end APPC surplus cashout.
          </p>
        </div>

        {/* Actions & Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf || loading || !banking}
            className="px-3.5 py-2 bg-[#2D50A1]/30 hover:bg-[#2D50A1]/50 border border-[#2D50A1] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-md"
            title="Download Banking Rules & Settlement Analysis as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#28B8B4]" />
            <span>{isExportingPdf ? 'Exporting...' : 'Export Banking Memo (PDF)'}</span>
          </button>

          {/* State Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#C6CBD9]">Select State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-2 rounded-xl bg-[#07122A] border border-[#2D50A1]/60 text-xs text-white focus:outline-none focus:border-[#28B8B4] font-bold shadow-md"
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

      {loading || !banking ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#28B8B4] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#C6CBD9]">Loading state banking rules & settlement framework...</p>
        </div>
      ) : (
        <div id="banking-report-area" className="space-y-8">
          {/* Plain Language Summary Callout */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#09193C] via-[#0B1B3D] to-[#07132B] border border-[#2D50A1]/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#28B8B4] flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Statutory Banking Rule Framework ({banking.state_id?.toUpperCase()})</span>
              </span>
              <StatusBadge status={banking.verification_status} />
            </div>
            <p className="text-sm text-white leading-relaxed font-medium">
              {banking.plain_language_summary}
            </p>
          </div>

          {/* Key Parameters 4-Grid (NewRa Combined Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0B1B3D]/80 border border-[#2D50A1]/40 shadow-lg space-y-1 hover:border-[#28B8B4]/60 transition">
              <span className="text-[10px] uppercase font-extrabold text-[#C6CBD9]">Banking Horizon</span>
              <div className="text-lg font-bold text-white">{banking.banking_period}</div>
              <p className="text-[11px] text-[#28B8B4] font-semibold">{banking.settlement_cycle}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1B3D]/80 border border-[#2D50A1]/40 shadow-lg space-y-1 hover:border-[#28B8B4]/60 transition">
              <span className="text-[10px] uppercase font-extrabold text-[#C6CBD9]">In-Kind Banking Charge</span>
              <div className="text-2xl font-extrabold font-mono text-[#28B8B4]">{banking.banking_charge_pct}%</div>
              <p className="text-[11px] text-[#C6CBD9]/70">Deducted from injected surplus units</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1B3D]/80 border border-[#2D50A1]/40 shadow-lg space-y-1 hover:border-[#F79050]/60 transition">
              <span className="text-[10px] uppercase font-extrabold text-[#C6CBD9]">Surplus Cashout Rate</span>
              <div className="text-sm font-bold text-[#F79050]">{banking.surplus_treatment_rate}</div>
              <p className="text-[11px] text-[#C6CBD9]/70">Settled annually by licensee</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1B3D]/80 border border-[#2D50A1]/40 shadow-lg space-y-1 hover:border-[#2D50A1]/80 transition">
              <span className="text-[10px] uppercase font-extrabold text-[#C6CBD9]">TOD Drawal Rules</span>
              <div className="text-sm font-bold text-white">Restricted Peak Drawal</div>
              <p className="text-[11px] text-[#C6CBD9]/70 truncate">{banking.cross_tod_adjustment}</p>
            </div>
          </div>

          {/* Interactive Live RE Banking & Settlement Calculator */}
          <div className="p-6 rounded-3xl bg-[#0B1B3D] border border-[#2D50A1]/50 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2D50A1]/30 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#28B8B4]/20 border border-[#28B8B4]/40 flex items-center justify-center text-[#28B8B4]">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Live Banking Energy Accounting & Settlement Simulator</h3>
                  <p className="text-xs text-[#C6CBD9]">Simulate monthly injection, in-kind deductions, ledger credits, and financial settlement.</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-lg bg-[#28B8B4]/20 text-[#28B8B4] border border-[#28B8B4]/40 font-mono text-xs font-bold">
                {banking.banking_charge_pct}% State In-Kind Deduction Active
              </span>
            </div>

            {/* Interactive Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#C6CBD9]">RE Plant Capacity (MW)</label>
                <input
                  type="number"
                  step="0.5"
                  value={reCapacityMw}
                  onChange={(e) => setReCapacityMw(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#07122A] border border-[#2D50A1]/60 text-white font-mono text-xs focus:border-[#28B8B4] focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#C6CBD9]">Monthly Generation (MWh)</label>
                <input
                  type="number"
                  step="10"
                  value={monthlyGenerationMwh}
                  onChange={(e) => setMonthlyGenerationMwh(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#07122A] border border-[#2D50A1]/60 text-[#28B8B4] font-mono text-xs focus:border-[#28B8B4] focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#C6CBD9]">Monthly Consumption (MWh)</label>
                <input
                  type="number"
                  step="10"
                  value={monthlyConsumptionMwh}
                  onChange={(e) => setMonthlyConsumptionMwh(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#07122A] border border-[#2D50A1]/60 text-white font-mono text-xs focus:border-[#28B8B4] focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#C6CBD9]">DISCOM Grid Tariff (Rs/kWh)</label>
                <input
                  type="number"
                  step="0.1"
                  value={retailGridTariff}
                  onChange={(e) => setRetailGridTariff(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#07122A] border border-[#2D50A1]/60 text-white font-mono text-xs focus:border-[#28B8B4] focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#C6CBD9]">APPC Cashout Rate (Rs/kWh)</label>
                <input
                  type="number"
                  step="0.05"
                  value={appcRate}
                  onChange={(e) => setAppcRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#07122A] border border-[#2D50A1]/60 text-[#F79050] font-mono text-xs focus:border-[#28B8B4] focus:outline-none font-bold"
                />
              </div>
            </div>

            {/* Settlement Waterfall Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Direct Consumption */}
              <div className="p-4 rounded-2xl bg-[#07122A] border border-[#2D50A1]/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#C6CBD9]">1. Direct Self-Consumption</span>
                <div className="text-xl font-extrabold font-mono text-white">{directConsumptionMwh.toFixed(1)} MWh</div>
                <p className="text-[11px] text-[#28B8B4] font-bold">â‚¹{(directSavingsRs / 100000).toFixed(2)} Lakhs Saved</p>
              </div>

              {/* Gross Surplus Banked */}
              <div className="p-4 rounded-2xl bg-[#07122A] border border-[#2D50A1]/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#C6CBD9]">2. Gross Surplus Banked</span>
                <div className="text-xl font-extrabold font-mono text-[#F79050]">{grossSurplusMwh.toFixed(1)} MWh</div>
                <p className="text-[11px] text-[#C6CBD9]/70">Deduction: -{inKindDeductionMwh.toFixed(1)} MWh ({bankingChargePct}%)</p>
              </div>

              {/* Net Banked Energy Credited */}
              <div className="p-4 rounded-2xl bg-[#07122A] border border-[#2D50A1]/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#C6CBD9]">3. Net Banked Ledger Credit</span>
                <div className="text-xl font-extrabold font-mono text-[#28B8B4]">{netBankedEnergyMwh.toFixed(1)} MWh</div>
                <p className="text-[11px] text-[#28B8B4]">Available for Off-Peak Netting</p>
              </div>

              {/* Net Commercial Benefit */}
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#2D50A1]/30 to-[#28B8B4]/20 border border-[#28B8B4]/50 space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-[#28B8B4]">4. Total Commercial Value</span>
                <div className="text-2xl font-extrabold font-mono text-white">â‚¹{(totalCommercialBenefitRs / 100000).toFixed(2)} L</div>
                <p className="text-[11px] text-[#28B8B4] font-bold">Monthly Combined Benefit</p>
              </div>
            </div>
          </div>

          {/* Technology & Rule Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#0B1B3D]/80 border border-[#2D50A1]/40 space-y-3 shadow-lg">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#28B8B4] flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <span>Eligible Technologies & Capacity Limits</span>
              </h3>
              <p className="text-xs text-white leading-relaxed font-semibold">
                Eligible Resources: <span className="text-[#28B8B4]">{banking.eligible_technologies?.join(', ')}</span>
              </p>
              <p className="text-xs text-[#C6CBD9] leading-relaxed">
                Banking is allowed up to 100% of contracted RE capacity. Wind and Solar hybrid projects are settled under coordinated 15-minute time block reconciliation with SLDC.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0B1B3D]/80 border border-[#2D50A1]/40 space-y-3 shadow-lg">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#F79050] flex items-center gap-2">
                <Wind className="w-4 h-4" />
                <span>TOD Cross-Adjustment & Carry Forward</span>
              </h3>
              <p className="text-xs text-white leading-relaxed">
                {banking.tod_restrictions}
              </p>
              <div className="p-3 rounded-xl bg-[#07122A] border border-[#2D50A1]/40 text-[11px] text-[#C6CBD9]">
                Source Order: <span className="text-white font-semibold">{banking.source_order}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


