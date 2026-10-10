import React, { useState, useEffect } from 'react';
import {
  Waves,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Zap,
  Building2,
  MapPin,
  Calculator,
  RefreshCw,
  Coins,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  PieChart,
  FileSpreadsheet,
  Download,
  Share2,
  Printer,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function SettlementWaterfallEngine() {
  const [states, setStates] = useState([]);
  const [discoms, setDiscoms] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [selectedDiscom, setSelectedDiscom] = useState('msedcl');
  const [voltageCode, setVoltageCode] = useState('33 kV');
  const [procurementType, setProcurementType] = useState('captive');

  // Physical inputs
  const [grossInjectionKwh, setGrossInjectionKwh] = useState(100000);
  const [consumerDrawalKwh, setConsumerDrawalKwh] = useState(92000);
  const [ppaTariff, setPpaTariff] = useState(3.80);
  const [appcRate, setAppcRate] = useState(3.45);

  const [loading, setLoading] = useState(true);
  const [waterfallData, setWaterfallData] = useState(null);
  const [copiedUrn, setCopiedUrn] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    if (selectedState) {
      calculateWaterfall();
    }
  }, [selectedState, selectedDiscom, voltageCode, procurementType, grossInjectionKwh, consumerDrawalKwh, ppaTariff, appcRate]);

  const loadMetadata = async () => {
    try {
      const [stList, discList] = await Promise.all([
        api.getStates(),
        api.getDiscoms()
      ]);
      setStates(stList.states || (Array.isArray(stList) ? stList : []));
      setDiscoms(discList.discoms || (Array.isArray(discList) ? discList : []));
    } catch (err) {
      console.error('Failed to load metadata', err);
    }
  };

  const calculateWaterfall = async () => {
    setLoading(true);
    try {
      const res = await api.simulateSettlementWaterfall({
        state_id: selectedState,
        discom_id: selectedDiscom,
        voltage_code: voltageCode,
        gross_injection_kwh: grossInjectionKwh,
        consumer_drawal_kwh: consumerDrawalKwh,
        procurement_type: procurementType,
        ppa_tariff: ppaTariff,
        appc_rate: appcRate
      });
      setWaterfallData(res);
    } catch (err) {
      console.error('Failed to simulate waterfall', err);
    } finally {
      setLoading(false);
    }
  };

  const stateDiscoms = discoms.filter(d => d.state_id === selectedState);

  const handleExportPDF = async () => {
    if (!waterfallData) return;
    setIsExportingPdf(true);
    await exportElementToPDF({
      elementId: 'settlement-waterfall-report-area',
      fileName: `NewRa_Settlement_Waterfall_${selectedState}_${voltageCode}`,
      reportTitle: `Energy Settlement & Loss Waterfall Report - ${waterfallData.state}`,
      entityName: waterfallData.discom
    });
    setIsExportingPdf(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-[var(--bg)] border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-500/10 via-sky-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
                Stage 5: Settled • NewRa Ledger SSoT
              </span>
              <span className="text-xs text-slate-400">15-Min Energy Accounting & Commercial Waterfall</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Waves className="w-7 h-7 text-teal-400" />
              Settlement & Loss Waterfall Engine
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Simulates precise multi-tier physical grid loss degradation (STU $\rightarrow$ Discom Wheeling $\rightarrow$ In-Kind Banking) and commercial reconciliation against SERC retail tariffs.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={calculateWaterfall}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
              Recalculate
            </button>
            {waterfallData && (
              <button
                onClick={handleExportPDF}
                disabled={isExportingPdf}
                className="px-4 py-2 bg-[var(--violet)] hover:bg-[var(--surface-2)] text-[var(--text)] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#28B8B4]/20 disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isExportingPdf ? 'Exporting PDF...' : 'Export Settlement PDF'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Simulator Control Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Jurisdiction & Grid Node */}
        <div className="bg-[var(--bg)] border border-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            1. Grid Jurisdiction
          </h2>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">State SERC Jurisdiction</label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                const firstDisc = discoms.find(d => d.state_id === e.target.value);
                if (firstDisc) setSelectedDiscom(firstDisc.id);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            >
              {states.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.state_code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Operating DISCOM</label>
            <select
              value={selectedDiscom}
              onChange={(e) => setSelectedDiscom(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            >
              {stateDiscoms.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Technical & Commercial Class */}
        <div className="bg-[var(--bg)] border border-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            2. Interconnection & Model
          </h2>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Interconnection Voltage</label>
            <select
              value={voltageCode}
              onChange={(e) => setVoltageCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="11 kV">11 kV (Distribution Level)</option>
              <option value="33 kV">33 kV (Sub-Transmission)</option>
              <option value="66 kV">66 kV (STU Network)</option>
              <option value="132 kV">132 kV (High Voltage STU)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Procurement Route</label>
            <select
              value={procurementType}
              onChange={(e) => setProcurementType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="captive">Group Captive (26/51 Rule 3)</option>
              <option value="third_party">Third-Party Bilateral PPA</option>
              <option value="geoa">Green Energy Open Access (GEOA)</option>
            </select>
          </div>
        </div>

        {/* Physical Energy Volumes */}
        <div className="bg-[var(--bg)] border border-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            3. Generation & Offtake
          </h2>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Gross Ex-Bus Injection (kWh)</label>
            <input
              type="number"
              value={grossInjectionKwh}
              onChange={(e) => setGrossInjectionKwh(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Consumer Metered Drawal (kWh)</label>
            <input
              type="number"
              value={consumerDrawalKwh}
              onChange={(e) => setConsumerDrawalKwh(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>
        </div>

        {/* Tariffs & Settlement Rates */}
        <div className="bg-[var(--bg)] border border-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            4. Pricing & APPC Cashout
          </h2>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">PPA Generation Tariff (₹/kWh)</label>
            <input
              type="number"
              step="0.05"
              value={ppaTariff}
              onChange={(e) => setPpaTariff(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">APPC Surplus Rate (₹/kWh)</label>
            <input
              type="number"
              step="0.05"
              value={appcRate}
              onChange={(e) => setAppcRate(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Main Results Display */}
      {waterfallData && (
        <div id="settlement-waterfall-report-area" className="space-y-6">
          {/* Physical Loss Degradation Waterfall Flow */}
          <div className="bg-[var(--bg)] border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800/80">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Waves className="w-5 h-5 text-teal-400" />
                  Physical Energy Accounting Waterfall (Units kWh)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Consecutive losses deducted from generation ex-bus to consumer boundary meter under SERC regulations.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Cumulative Loss:</span>
                <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-mono font-bold">
                  {waterfallData.waterfall_physical_units.cumulative_technical_loss_pct}%
                </span>
              </div>
            </div>

            {/* Stepped Waterfall Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              {/* Step 1: Gross */}
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-teal-400 uppercase">Step 1</span>
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">Gross Ex-Bus SEM</h4>
                  <p className="text-[11px] text-slate-400">Solar/Wind plant meter</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="text-lg font-bold text-white font-mono">
                    {waterfallData.waterfall_physical_units.step_1_gross_injection_kwh.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">100.0% injected</span>
                </div>
              </div>

              {/* Step 2: STU Loss */}
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-sky-400 uppercase">Step 2</span>
                    <span className="text-[10px] font-mono text-rose-400">-{waterfallData.waterfall_physical_units.step_2_stu_loss_pct}%</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">STU Transmission</h4>
                  <p className="text-[11px] text-slate-400">Loss: {waterfallData.waterfall_physical_units.step_2_stu_loss_units_kwh.toLocaleString()} kWh</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="text-lg font-bold text-sky-300 font-mono">
                    {waterfallData.waterfall_physical_units.step_2_stu_net_injection_kwh.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">STU Net Injected</span>
                </div>
              </div>

              {/* Step 3: Wheeling Loss */}
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">Step 3</span>
                    <span className="text-[10px] font-mono text-rose-400">-{waterfallData.waterfall_physical_units.step_3_wheeling_loss_pct}%</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">DISCOM Wheeling</h4>
                  <p className="text-[11px] text-slate-400">Loss: {waterfallData.waterfall_physical_units.step_3_wheeling_loss_units_kwh.toLocaleString()} kWh</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="text-lg font-bold text-amber-300 font-mono">
                    {waterfallData.waterfall_physical_units.step_3_discom_perimeter_kwh.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">DISCOM Perimeter</span>
                </div>
              </div>

              {/* Step 4: Banking Deduction */}
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-purple-400 uppercase">Step 4</span>
                    <span className="text-[10px] font-mono text-purple-400">-{waterfallData.waterfall_physical_units.step_4_banking_charge_pct}% In-Kind</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">Banking Charge</h4>
                  <p className="text-[11px] text-slate-400">Retained: {waterfallData.waterfall_physical_units.step_4_inkind_banking_deduction_kwh.toLocaleString()} kWh</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="text-lg font-bold text-purple-300 font-mono">
                    {waterfallData.waterfall_physical_units.step_5_net_creditable_consumer_kwh.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Net Creditable</span>
                </div>
              </div>

              {/* Step 5: Final Settlement */}
              <div className="bg-gradient-to-br from-teal-950/60 to-slate-900 border border-teal-500/40 rounded-xl p-4 flex flex-col justify-between shadow-inner">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-teal-300 uppercase">Final Stage</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <h4 className="text-xs font-semibold text-white">Reconciliation</h4>
                  <p className="text-[11px] text-slate-400">Demand: {consumerDrawalKwh.toLocaleString()} kWh</p>
                </div>
                <div className="mt-4 pt-3 border-t border-teal-800/40">
                  <div className="text-xs font-bold text-teal-300 font-mono">
                    Offset: {waterfallData.reconciliation_balance.direct_offset_kwh.toLocaleString()}
                  </div>
                  <span className={`text-[10px] font-semibold ${
                    waterfallData.reconciliation_balance.settlement_status === 'NET_SURPLUS_BANKED'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}>
                    {waterfallData.reconciliation_balance.settlement_status === 'NET_SURPLUS_BANKED'
                      ? `+${waterfallData.reconciliation_balance.surplus_banked_kwh.toLocaleString()} Banked`
                      : `-${waterfallData.reconciliation_balance.deficit_utility_kwh.toLocaleString()} from Grid`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Commercial Invoicing & Reconciliation Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Commercial Invoice Line Items */}
            <div className="lg:col-span-2 bg-[var(--bg)] border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-teal-400" />
                    Commercial Billing Reconciliation Waterfall
                  </h3>
                  <p className="text-xs text-slate-400">
                    Statutory Open Access, PPA, and Utility top-up settlement for {waterfallData.state}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {waterfallData.procurement_type.toUpperCase()}
                </span>
              </div>

              <div className="divide-y divide-slate-800/80 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200">1. Generator PPA Energy Charge</span>
                    <p className="text-[11px] text-slate-500">Ex-Bus Generation @ ₹{ppaTariff}/kWh</p>
                  </div>
                  <span className="font-mono font-bold text-white">
                    ₹{waterfallData.commercial_waterfall_inr.ppa_generation_charge_inr.toLocaleString()}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200">2. Transmission Charges (STU)</span>
                    <p className="text-[11px] text-slate-500">STU Net Injection @ statutory SERC tariff</p>
                  </div>
                  <span className="font-mono text-slate-300">
                    ₹{waterfallData.commercial_waterfall_inr.open_access_charges.transmission_charge_inr.toLocaleString()}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200">3. Wheeling Charges (DISCOM)</span>
                    <p className="text-[11px] text-slate-500">Perimeter flow @ {voltageCode} tariff rate</p>
                  </div>
                  <span className="font-mono text-slate-300">
                    ₹{waterfallData.commercial_waterfall_inr.open_access_charges.wheeling_charge_inr.toLocaleString()}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200">4. Cross-Subsidy Surcharge (CSS)</span>
                    <p className="text-[11px] text-slate-500">
                      {waterfallData.procurement_type === 'captive' ? '100% EXEMPT under Electricity Act §42(2)' : 'Applicable for non-captive drawal'}
                    </p>
                  </div>
                  <span className={`font-mono font-semibold ${waterfallData.procurement_type === 'captive' ? 'text-teal-400' : 'text-slate-200'}`}>
                    ₹{waterfallData.commercial_waterfall_inr.open_access_charges.cross_subsidy_surcharge_inr.toLocaleString()}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200">5. Additional Surcharge (AS)</span>
                    <p className="text-[11px] text-slate-500">
                      {waterfallData.procurement_type === 'captive' ? '100% EXEMPT under Supreme Court Cadbury ruling' : 'Levied by DISCOM on stranded capacity'}
                    </p>
                  </div>
                  <span className={`font-mono font-semibold ${waterfallData.procurement_type === 'captive' ? 'text-teal-400' : 'text-slate-200'}`}>
                    ₹{waterfallData.commercial_waterfall_inr.open_access_charges.additional_surcharge_inr.toLocaleString()}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200">6. SLDC / Scheduling Operational Fee</span>
                    <p className="text-[11px] text-slate-500">Monthly SLDC scheduling oversight</p>
                  </div>
                  <span className="font-mono text-slate-300">
                    ₹{waterfallData.commercial_waterfall_inr.open_access_charges.sldc_fee_inr.toLocaleString()}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-amber-300">7. Utility Grid Backup / Deficit Drawal</span>
                    <p className="text-[11px] text-slate-500">
                      {waterfallData.reconciliation_balance.deficit_utility_kwh.toLocaleString()} units @ ₹{waterfallData.commercial_waterfall_inr.grid_baseline_rate_per_kwh}/kWh all-in
                    </p>
                  </div>
                  <span className="font-mono font-bold text-amber-300">
                    ₹{waterfallData.commercial_waterfall_inr.utility_deficit_bill_inr.toLocaleString()}
                  </span>
                </div>

                {waterfallData.reconciliation_balance.potential_cashout_inr > 0 && (
                  <div className="py-2.5 flex items-center justify-between text-emerald-400">
                    <div className="space-y-0.5">
                      <span className="font-semibold">8. Surplus APPC Banking Cashout Credit</span>
                      <p className="text-[11px] text-emerald-500/80">
                        {waterfallData.reconciliation_balance.surplus_banked_kwh.toLocaleString()} surplus units @ ₹{appcRate}/kWh
                      </p>
                    </div>
                    <span className="font-mono font-bold">
                      -₹{waterfallData.commercial_waterfall_inr.surplus_cashout_credit_inr.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Client Financial Verdict & Savings */}
            <div className="bg-[var(--bg)] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Bottom Line Economics</span>
                <h3 className="text-xl font-extrabold text-white mt-1">Settlement Summary</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Reconciliation against Discom baseline retail invoice.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-[11px] text-slate-400">Baseline Utility Cost (No Open Access)</div>
                  <div className="text-lg font-bold text-slate-300 font-mono">
                    ₹{waterfallData.commercial_waterfall_inr.baseline_utility_bill_inr.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">₹{waterfallData.commercial_waterfall_inr.grid_baseline_rate_per_kwh}/kWh grid rate</div>
                </div>

                <div className="p-3.5 bg-teal-950/40 border border-teal-500/30 rounded-xl space-y-1">
                  <div className="text-[11px] text-teal-300">Net Landed Cost (Open Access + Utility Deficit)</div>
                  <div className="text-xl font-extrabold text-teal-300 font-mono">
                    ₹{waterfallData.commercial_waterfall_inr.net_landed_cost_inr.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-teal-400/80 font-mono">
                    Effective: ₹{waterfallData.commercial_waterfall_inr.effective_cost_per_kwh}/kWh
                  </div>
                </div>

                <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                    <span>Net Monthly Savings</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold">
                      {waterfallData.commercial_waterfall_inr.net_savings_pct}% Saved
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-300 font-mono">
                    ₹{waterfallData.commercial_waterfall_inr.net_savings_inr.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-400/70">
                    Annualized: ₹{(waterfallData.commercial_waterfall_inr.net_savings_inr * 12).toLocaleString()} / year
                  </div>
                </div>
              </div>

              {/* SSoT Downstream Tag */}
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>SSoT Feed:</span>
                <span className="font-mono text-teal-400 font-semibold">NewRa Ledger API</span>
              </div>
            </div>
          </div>

          {/* TOD Slot Settlement & Peak Banking Restriction Matrix */}
          {waterfallData.tod_slot_settlement && (
            <div className="bg-[var(--bg)] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-400" />
                    TOD Slot-Wise Settlement & Peak Banking Restriction Matrix
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {waterfallData.tod_slot_settlement.governing_banking_regulation}
                  </p>
                </div>
                {waterfallData.tod_slot_settlement.peak_draw_prohibited && (
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Evening Peak Draw Prohibited
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">TOD Time Block</th>
                      <th className="py-2.5 px-3">Hours</th>
                      <th className="py-2.5 px-3">Solar Gen (kWh)</th>
                      <th className="py-2.5 px-3">Drawal (kWh)</th>
                      <th className="py-2.5 px-3">Solar Offset</th>
                      <th className="py-2.5 px-3">Banked Draw</th>
                      <th className="py-2.5 px-3">DISCOM Grid Draw</th>
                      <th className="py-2.5 px-3 text-right">TOD Multiplier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {waterfallData.tod_slot_settlement.slots.map((slot, sIdx) => (
                      <tr key={sIdx} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 px-3 font-bold text-white font-sans">{slot.slot_name}</td>
                        <td className="py-3 px-3 text-slate-400">{slot.hours} hrs</td>
                        <td className="py-3 px-3 text-teal-300 font-bold">{slot.solar_generation_kwh.toLocaleString()}</td>
                        <td className="py-3 px-3 text-slate-300">{slot.consumer_drawal_kwh.toLocaleString()}</td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">{slot.offset_from_solar_kwh.toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            slot.banked_draw_allowed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {slot.banked_draw_allowed ? 'Permitted' : 'Prohibited'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-amber-300 font-bold">{slot.discom_grid_draw_kwh.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-slate-300 font-bold">{slot.tod_tariff_multiplier}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SERC Banking Cycle & Forfeiture Terms */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200">Statutory Settlement Cycle & Annual Lapse Rule:</span>
                  <p className="text-[11px] text-slate-400">
                    Settlement Cycle: <strong>{waterfallData.reconciliation_balance.banking_settlement_cycle || 'Annual'}</strong>. Banked surplus energy is evaluated monthly. At financial year end (March 31), unutilized banked units are settled at APPC (₹{waterfallData.reconciliation_balance.appc_surplus_cashout_rate}/kWh) and cannot roll over into the next fiscal year.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Potential Cashout</span>
                  <span className="text-sm font-bold text-teal-300 font-mono">
                    ₹{waterfallData.reconciliation_balance.potential_cashout_inr.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
