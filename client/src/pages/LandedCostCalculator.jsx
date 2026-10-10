import React, { useState, useEffect } from 'react';
import {
  Calculator,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  Building2,
  MapPin,
  Download,
  Info,
  CheckCircle2,
  Sparkles,
  Printer
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function LandedCostCalculator() {
  const [states, setStates] = useState([]);
  const [discoms, setDiscoms] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [selectedDiscom, setSelectedDiscom] = useState('msedcl');
  const [selectedVoltage, setSelectedVoltage] = useState('33 kV');

  // Input Parameters
  const [baseRePpaTariff, setBaseRePpaTariff] = useState(3.60); // Rs/kWh
  const [annualConsumptionMwh, setAnnualConsumptionMwh] = useState(12000); // 12,000 MWh = 12 MU/yr
  const [contractDemandKva, setContractDemandKva] = useState(2500); // 2.5 MVA

  // Loaded Profile Data
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [sRes, dRes] = await Promise.all([api.getStates(), api.getDiscoms()]);
        setStates(sRes.states || []);
        setDiscoms(dRes.discoms || []);
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    if (!selectedState || discoms.length === 0) return;
    const stateDiscoms = discoms.filter(d => d.state_id === selectedState);
    if (stateDiscoms.length > 0 && !stateDiscoms.some(d => d.id === selectedDiscom)) {
      setSelectedDiscom(stateDiscoms[0].id);
    }
  }, [selectedState, discoms, selectedDiscom]);

  useEffect(() => {
    async function loadProfile() {
      if (!selectedState || !selectedDiscom) return;
      try {
        setLoading(true);
        const data = await api.getRegulatoryProfile({
          state: selectedState,
          discom: selectedDiscom,
          consumer_category: 'ht-industrial-cont',
          voltage: selectedVoltage,
          fy: 'FY 2025-26'
        });
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [selectedState, selectedDiscom, selectedVoltage]);

  // Derived Regulatory Surcharges & Loss Multipliers
  const retailGridTariff = profile?.applicable_tariff?.energy_charge ?? 7.85; // Rs/kVAh
  const electricityDutyPct = profile?.applicable_tariff?.electricity_duty ?? 9.3; // %
  const facCharge = profile?.applicable_tariff?.fac_fppas ?? 0.45; // Rs/kWh

  // Technical Losses
  const txLossPct = profile?.grid_losses?.matching_loss?.transmission_loss_pct ?? 3.18; // %
  const whLossPct = profile?.grid_losses?.matching_loss?.wheeling_loss_pct ?? 3.60; // %
  const totalLossPct = profile?.grid_losses?.matching_loss?.total_technical_loss_pct ?? (txLossPct + whLossPct);
  // Gross-up multiplier: 1 unit delivered requires 1 / (1 - Loss) injected
  const lossMultiplier = totalLossPct < 100 ? 1 / (1 - totalLossPct / 100) : 1.0;
  const grossedUpPpaCost = baseRePpaTariff * lossMultiplier;
  const lossCostComponent = grossedUpPpaCost - baseRePpaTariff;

  // Open Access Surcharges
  const rawWheelingCharge = profile?.oa_charges_breakdown?.[0]?.wheeling_charge ?? 1.18; // Rs/kWh
  const rawTxChargePerMwDay = profile?.oa_charges_breakdown?.[0]?.transmission_charge ?? 4120; // Rs/MW/day
  // Convert Rs/MW/day to approximate Rs/kWh (assuming 80% PLF equivalent = 19.2 kWh/kW/day)
  const txChargePerKwh = Number((rawTxChargePerMwDay / (1000 * 24 * 0.8)).toFixed(3)) || 0.215;

  const rawCss = profile?.oa_charges_breakdown?.[0]?.css ?? 2.18; // Rs/kWh
  const rawAs = profile?.oa_charges_breakdown?.[0]?.additional_surcharge ?? 1.34; // Rs/kWh
  const sldcOperatingCharge = 0.05; // Rs/kWh standard scheduling fee
  const electricityDutyCost = (retailGridTariff * electricityDutyPct) / 100;

  // National Tariff Policy 2016 (Para 8.5.1) - Surcharge cannot exceed 20% of consumer tariff
  const effectiveDiscomTariff = retailGridTariff + facCharge;
  const statutoryCssCap = Number((effectiveDiscomTariff * 0.20).toFixed(2));
  const effectiveThirdPartyCss = Math.min(rawCss, statutoryCssCap);
  const isCssCappedByTariffPolicy = rawCss > statutoryCssCap;

  // --- Route 1: Group Captive Route (26% Equity / 51% Consumption) ---
  // CSS = 0, AS = 0 (100% Exempt under Electricity Rules 2005 Rule 3)
  const captiveLandedCost = Number(
    (baseRePpaTariff + lossCostComponent + txChargePerKwh + rawWheelingCharge + sldcOperatingCharge + electricityDutyCost).toFixed(2)
  );
  const captiveSavingsPerKwh = Number((retailGridTariff + facCharge - captiveLandedCost).toFixed(2));
  const captiveAnnualSavingsRs = (annualConsumptionMwh * 1000 * captiveSavingsPerKwh) / 10000000; // in Crores

  // --- Route 2: Third-Party Bilateral PPA ---
  // Subject to Capped CSS (Tariff Policy 20% rule) and Additional Surcharge
  const thirdPartyLandedCost = Number(
    (baseRePpaTariff + lossCostComponent + txChargePerKwh + rawWheelingCharge + effectiveThirdPartyCss + rawAs + sldcOperatingCharge + electricityDutyCost).toFixed(2)
  );
  const thirdPartySavingsPerKwh = Number((retailGridTariff + facCharge - thirdPartyLandedCost).toFixed(2));
  const thirdPartyAnnualSavingsRs = (annualConsumptionMwh * 1000 * thirdPartySavingsPerKwh) / 10000000; // in Crores

  // --- Route 3: Green Energy Open Access (GEOA Rules 2022) ---
  // Additional Surcharge is 0 under MoP GEOA Rule 9(2); CSS capped at 20% of tariff
  const geoaCss = Number(Math.min(rawCss * 0.85, statutoryCssCap).toFixed(2));
  const geoaAs = 0.00; // 100% exempt from Additional Surcharge under Central GEOA Rules 2022
  const geoaLandedCost = Number(
    (baseRePpaTariff + lossCostComponent + txChargePerKwh + rawWheelingCharge + geoaCss + geoaAs + sldcOperatingCharge + electricityDutyCost).toFixed(2)
  );
  const geoaSavingsPerKwh = Number((retailGridTariff + facCharge - geoaLandedCost).toFixed(2));
  const geoaAnnualSavingsRs = (annualConsumptionMwh * 1000 * geoaSavingsPerKwh) / 10000000; // in Crores

  // Waterfall Chart Data
  const waterfallData = [
    { name: 'Base RE PPA', value: baseRePpaTariff, fill: '#28B8B4' },
    { name: 'Grid Losses', value: Number(lossCostComponent.toFixed(2)), fill: '#F79050' },
    { name: 'Transmission', value: Number(txChargePerKwh.toFixed(2)), fill: '#3b82f6' },
    { name: 'Wheeling', value: Number(rawWheelingCharge.toFixed(2)), fill: '#8b5cf6' },
    { name: 'Elec Duty', value: Number(electricityDutyCost.toFixed(2)), fill: '#ec4899' },
    { name: 'Captive Landed', value: captiveLandedCost, fill: '#10b981', isTotal: true },
    { name: 'CSS (Third-Party)', value: Number(effectiveThirdPartyCss.toFixed(2)), fill: '#f59e0b' },
    { name: 'AS (Third-Party)', value: Number(rawAs.toFixed(2)), fill: '#ef4444' },
    { name: 'Third-Party Landed', value: thirdPartyLandedCost, fill: '#6366f1', isTotal: true },
    { name: 'DISCOM Grid Tariff', value: Number((retailGridTariff + facCharge).toFixed(2)), fill: '#64748b', isTotal: true }
  ];

  const comparisonBarData = [
    {
      name: 'Captive (26/51)',
      Landed_Cost: captiveLandedCost,
      Grid_Tariff: Number((retailGridTariff + facCharge).toFixed(2)),
      Net_Savings_per_kWh: captiveSavingsPerKwh
    },
    {
      name: 'Green OA (GEOA)',
      Landed_Cost: geoaLandedCost,
      Grid_Tariff: Number((retailGridTariff + facCharge).toFixed(2)),
      Net_Savings_per_kWh: geoaSavingsPerKwh
    },
    {
      name: 'Third-Party PPA',
      Landed_Cost: thirdPartyLandedCost,
      Grid_Tariff: Number((retailGridTariff + facCharge).toFixed(2)),
      Net_Savings_per_kWh: thirdPartySavingsPerKwh
    }
  ];

  const handleExportPDF = async () => {
    setIsExportingPdf(true);
    try {
      await exportElementToPDF({
        elementId: 'landed-cost-report-area',
        fileName: `NewRa_LCoP_Waterfall_${selectedState}_${selectedDiscom}.pdf`,
        reportTitle: 'Institutional Landed Cost-of-Power (LCoP) Waterfall Audit',
        entityName: `${selectedState.toUpperCase()} - ${selectedDiscom.toUpperCase()} (${selectedVoltage} | PPA ₹${baseRePpaTariff}/kWh)`
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>Institutional Open Access Commercial Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
            Landed Cost-of-Power (LCoP) Waterfall Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Exact mathematical modeling of statutory transmission charges, wheeling fees, CSS/AS exemptions, technical grid loss gross-ups, and net corporate buyer savings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf || loading || !profile}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)]/50 border border-[var(--line)] text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-md"
            title="Download LCoP Analysis as Executive PDF"
          >
            <Printer className="w-4 h-4 text-[var(--lilac)]" />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Export LCoP PDF'}</span>
          </button>
          <span className="px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/25 text-xs font-semibold font-mono text-teal-300">
            Electricity Rules 2005 Compliant
          </span>
        </div>
      </div>

      {/* Selectors and Dynamic Parameters Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Commercial Modeling Coordinates</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            State â†’ Licensee â†’ Voltage â†’ Generation Assumptions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* State */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">State Jurisdiction</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 text-xs font-semibold focus:border-teal-400 focus:outline-none cursor-pointer"
            >
              {states.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* DISCOM */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">DISCOM Licensee</label>
            <select
              value={selectedDiscom}
              onChange={(e) => setSelectedDiscom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 text-xs font-semibold focus:border-teal-400 focus:outline-none cursor-pointer"
            >
              {discoms.filter((d) => d.state_id === selectedState).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.short_name || d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Interconnection Voltage */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Interconnection Voltage</label>
            <select
              value={selectedVoltage}
              onChange={(e) => setSelectedVoltage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 text-xs font-semibold focus:border-teal-400 focus:outline-none cursor-pointer"
            >
              <option value="11 kV">11 kV (Distribution)</option>
              <option value="33 kV">33 kV (Sub-Transmission)</option>
              <option value="66 kV">66 kV (Transmission)</option>
              <option value="132 kV">132 kV (EHT Grid)</option>
              <option value="220 kV">220 kV (EHT Grid)</option>
            </select>
          </div>

          {/* Base RE PPA Tariff */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Base RE PPA Tariff (â‚¹/kWh)</label>
            <input
              type="number"
              step="0.05"
              value={baseRePpaTariff}
              onChange={(e) => setBaseRePpaTariff(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700/80 text-teal-300 font-mono text-xs font-bold focus:border-teal-400 focus:outline-none"
            />
          </div>

          {/* Annual Consumption */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Annual Consumption (MWh)</label>
            <input
              type="number"
              step="500"
              value={annualConsumptionMwh}
              onChange={(e) => setAnnualConsumptionMwh(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 font-mono text-xs font-bold focus:border-teal-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {loading || !profile ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Calculating multi-route landed tariffs and loss gross-ups...</p>
        </div>
      ) : (
        <div id="landed-cost-report-area" className="space-y-6">
          {/* Executive 3-Route Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Route 1: Group Captive (Best Value) */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-teal-500/40 shadow-md space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-teal-500 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                Recommended Route
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Route 1: Group Captive (26% / 51%)
                </span>
                <h3 className="text-xs text-slate-400 mt-0.5">100% CSS & Additional Surcharge Exempted</h3>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-bold font-mono text-slate-100">
                  â‚¹{captiveLandedCost.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ kWh Landed</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Saves â‚¹{captiveSavingsPerKwh.toFixed(2)}/kWh vs Grid Tariff</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Annual Commercial Savings:</span>
                  <strong className="text-teal-400 font-mono text-sm">â‚¹{captiveAnnualSavingsRs.toFixed(2)} Cr / yr</strong>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>DISCOM Retail Tariff:</span>
                  <span>â‚¹{(retailGridTariff + facCharge).toFixed(2)}/kWh</span>
                </div>
              </div>
            </div>

            {/* Route 2: Green Energy Open Access (GEOA) */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3.5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Route 2: Green Energy OA (GEOA)
                </span>
                <h3 className="text-xs text-slate-400 mt-0.5">100 kW Threshold â€¢ Green Concessions</h3>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-bold font-mono text-slate-100">
                  â‚¹{geoaLandedCost.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ kWh Landed</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Saves â‚¹{geoaSavingsPerKwh.toFixed(2)}/kWh vs Grid Tariff</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Annual Commercial Savings:</span>
                  <strong className="text-sky-400 font-mono text-sm">â‚¹{geoaAnnualSavingsRs.toFixed(2)} Cr / yr</strong>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>CSS Applied:</span>
                  <span>â‚¹{geoaCss.toFixed(2)}/kWh</span>
                </div>
              </div>
            </div>

            {/* Route 3: Third-Party Bilateral PPA */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3.5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Route 3: Third-Party Bilateral PPA
                </span>
                <h3 className="text-xs text-slate-400 mt-0.5">Full CSS & Additional Surcharge Burden</h3>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-bold font-mono text-slate-100">
                  â‚¹{thirdPartyLandedCost.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ kWh Landed</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                  {thirdPartySavingsPerKwh > 0 ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Saves â‚¹{thirdPartySavingsPerKwh.toFixed(2)}/kWh vs Grid</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-rose-400">â‚¹{Math.abs(thirdPartySavingsPerKwh).toFixed(2)} Premium over Grid</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Annual Commercial Savings:</span>
                  <strong className="text-slate-100 font-mono text-sm">â‚¹{thirdPartyAnnualSavingsRs.toFixed(2)} Cr / yr</strong>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>CSS + AS Total Surcharges:</span>
                  <span className="text-amber-400 font-medium">â‚¹{(rawCss + rawAs).toFixed(2)}/kWh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Landed Cost Waterfall & Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Waterfall Component Chart */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Landed Tariff Waterfall Breakdown (â‚¹/kWh)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Itemized regulatory components building up to total landed cost.</p>
                </div>
                <span className="text-xs font-mono text-teal-400 font-semibold">â‚¹/kWh</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waterfallData} margin={{ top: 20, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E3A70" opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      stroke="#C6CBD9"
                      fontSize={10}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis stroke="#C6CBD9" fontSize={11} domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#07122A', borderColor: '#2D50A1', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(value) => [`â‚¹${value.toFixed(2)} / kWh`, 'Cost Component']}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {waterfallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Route Comparison Bar Chart */}
            <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--line)]/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Route Benchmarking vs DISCOM Grid Tariff
                  </h3>
                  <p className="text-xs text-[var(--muted)]">Direct comparison of effective tariffs and buyer savings margins.</p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonBarData} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E3A70" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#C6CBD9" fontSize={11} />
                    <YAxis stroke="#C6CBD9" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#07122A', borderColor: '#2D50A1', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(value) => [`â‚¹${value.toFixed(2)} / kWh`, 'Tariff']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Landed_Cost" fill="#28B8B4" radius={[6, 6, 0, 0]} name="Landed OA Tariff" />
                    <Bar dataKey="Grid_Tariff" fill="#64748b" radius={[6, 6, 0, 0]} name="DISCOM Retail Tariff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Mathematical Equations & Audit Proof Table */}
          <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--line)]/40 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--lilac)]" />
              <span>Institutional Regulatory Equations & Statutory Citations</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg)] text-[var(--muted)] uppercase text-[10px] font-bold border-b border-[var(--line)]/30">
                  <tr>
                    <th className="px-4 py-3">Cost Component</th>
                    <th className="px-4 py-3">Value / Formula</th>
                    <th className="px-4 py-3">Group Captive (26/51)</th>
                    <th className="px-4 py-3">Third-Party PPA</th>
                    <th className="px-4 py-3">Statutory Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D50A1]/30 text-[var(--text)]">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Base RE PPA Rate</td>
                    <td className="px-4 py-3 font-mono text-[var(--lilac)]">â‚¹{baseRePpaTariff.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 font-mono">â‚¹{baseRePpaTariff.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono">â‚¹{baseRePpaTariff.toFixed(2)}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">Contractual PPA term</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Technical Grid Losses ({selectedVoltage})</td>
                    <td className="px-4 py-3 font-mono text-[var(--lilac)]">
                      {totalLossPct}% (Tx {txLossPct}% + Wh {whLossPct}%)
                    </td>
                    <td className="px-4 py-3 font-mono">+â‚¹{lossCostComponent.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 font-mono">+â‚¹{lossCostComponent.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 text-[var(--muted)]">Multiplier: 1/(1 - Loss)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Intra-State Transmission Charge</td>
                    <td className="px-4 py-3 font-mono">â‚¹{rawTxChargePerMwDay}/MW/day</td>
                    <td className="px-4 py-3 font-mono">+â‚¹{txChargePerKwh.toFixed(3)}/kWh</td>
                    <td className="px-4 py-3 font-mono">+â‚¹{txChargePerKwh.toFixed(3)}/kWh</td>
                    <td className="px-4 py-3 text-[var(--muted)]">State STU MYT Tariff Order</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Wheeling Charge</td>
                    <td className="px-4 py-3 font-mono">â‚¹{rawWheelingCharge.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 font-mono">+â‚¹{rawWheelingCharge.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 font-mono">+â‚¹{rawWheelingCharge.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 text-[var(--muted)]">DISCOM Open Access Order</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Cross Subsidy Surcharge (CSS)</td>
                    <td className="px-4 py-3 font-mono">â‚¹{rawCss.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 font-bold text-[var(--lilac)]">â‚¹0.00 (Exempted)</td>
                    <td className="px-4 py-3 font-mono text-[var(--lilac)]">+â‚¹{rawCss.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 text-[var(--muted)]">Electricity Rules 2005 Rule 3</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Additional Surcharge (AS)</td>
                    <td className="px-4 py-3 font-mono">â‚¹{rawAs.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 font-bold text-[var(--lilac)]">â‚¹0.00 (Exempted)</td>
                    <td className="px-4 py-3 font-mono text-[var(--lilac)]">+â‚¹{rawAs.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 text-[var(--muted)]">Supreme Court & SERC Orders</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Electricity Duty ({electricityDutyPct}%)</td>
                    <td className="px-4 py-3 font-mono">â‚¹{electricityDutyCost.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 font-mono">+â‚¹{electricityDutyCost.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 font-mono">+â‚¹{electricityDutyCost.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 text-[var(--muted)]">State Electricity Duty Act</td>
                  </tr>
                  <tr className="bg-[var(--bg)] font-bold text-sm">
                    <td className="px-4 py-3 text-[var(--lilac)]">Total Landed Tariff (â‚¹/kWh)</td>
                    <td className="px-4 py-3 font-mono text-[var(--muted)]">â€”</td>
                    <td className="px-4 py-3 font-mono text-[var(--lilac)] text-base">â‚¹{captiveLandedCost.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-white text-base">â‚¹{thirdPartyLandedCost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-[var(--lilac)]">DISCOM: â‚¹{(retailGridTariff + facCharge).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}