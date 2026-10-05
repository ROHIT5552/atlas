import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Scale,
  Percent,
  TrendingDown,
  Gauge,
  Calendar,
  Sparkles,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function GuardComplianceRulebook() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [rulesData, setRulesData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Captive 26/51 Simulator State
  const [testEquityPct, setTestEquityPct] = useState(26.5);
  const [testConsumptionPct, setTestConsumptionPct] = useState(52.0);

  // 2. Contract Demand Overshoot Simulator State
  const [testCdKva, setTestCdKva] = useState(2000);
  const [testActualMdKva, setTestActualMdKva] = useState(2250);

  // 3. Power Factor Simulator State
  const [testPf, setTestPf] = useState(0.88);

  useEffect(() => {
    async function loadStates() {
      try {
        const data = await api.getStates();
        setStates(data.states || []);
      } catch (err) {
        console.error('Failed to load states:', err);
      }
    }
    loadStates();
  }, []);

  useEffect(() => {
    async function loadRules() {
      setLoading(true);
      try {
        const data = await api.getGuardComplianceRules({ state_id: selectedState });
        setRulesData(data);
      } catch (err) {
        console.error('Failed to load guard rules:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRules();
  }, [selectedState]);

  // Captive Evaluation
  const isEquityCompliant = testEquityPct >= 26;
  const isConsumptionCompliant = testConsumptionPct >= 51;
  const isCaptiveCompliant = isEquityCompliant && isConsumptionCompliant;
  const isCaptiveAtRisk = isCaptiveCompliant && (testEquityPct < 27 || testConsumptionPct < 52);

  // CD Overshoot Evaluation
  const excessKva = Math.max(0, testActualMdKva - testCdKva);
  const isCdOvershot = excessKva > 0;
  const normalDemandRate = rulesData?.rules?.contract_demand_overshoot?.normal_demand_charge || 480;
  const penaltyDemandRate = normalDemandRate * 1.5;
  const normalDemandBill = testCdKva * normalDemandRate;
  const excessDemandPenalty = excessKva * penaltyDemandRate;
  const totalDemandBill = (testCdKva * normalDemandRate) + excessDemandPenalty;

  // Power Factor Evaluation
  let pfStatus = 'Compliant';
  let pfAdjustmentText = 'No incentive or penalty';
  let pfAdjustmentColor = 'text-white';
  if (testPf >= 0.95) {
    const unitsAbove = Math.round((testPf - 0.95) * 100);
    const rebatePct = Math.min(3.5, unitsAbove * 0.5);
    pfStatus = `Incentive: +${rebatePct.toFixed(1)}% Rebate`;
    pfAdjustmentText = `${rebatePct.toFixed(1)}% rebate on energy charge`;
    pfAdjustmentColor = 'text-green-400';
  } else if (testPf < 0.90) {
    const unitsBelow = Math.round((0.90 - testPf) * 100);
    let penaltyPct = unitsBelow * 1.0;
    if (testPf < 0.85) {
      penaltyPct = 5.0 + (Math.round((0.85 - testPf) * 100) * 2.0);
    }
    pfStatus = `Penalty: -${penaltyPct.toFixed(1)}% Surcharge`;
    pfAdjustmentText = `${penaltyPct.toFixed(1)}% penalty surcharge on energy bill`;
    pfAdjustmentColor = 'text-red-400';
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#09193C] via-[#0B1B3D] to-[#07122A] border border-[#2D50A1]/40 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                Product #4 Rulebook
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">NewRa Guard Compliance Rulebook Engine</h1>
            </div>
            <p className="text-xs text-[#C6CBD9]/80 mt-1">
              Atlas codifies the statutory limits; NewRa Guard audits live projects against these thresholds to fire automated alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#C6CBD9]/70 font-medium">State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-[#07122A] border border-[#2D50A1]/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#28B8B4]"
          >
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.regulator_code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: 3 Interactive Compliance Simulators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Captive 26/51 Rule Audit */}
        <div className="p-5 rounded-2xl bg-[#09193C] border border-[#2D50A1]/40 space-y-4 shadow-lg">
          <div className="flex justify-between items-center pb-2 border-b border-[#2D50A1]/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#28B8B4]" /> 1. Captive 26/51 Rule
            </h3>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
              isCaptiveCompliant
                ? isCaptiveAtRisk ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {isCaptiveCompliant ? (isCaptiveAtRisk ? 'AT RISK' : 'COMPLIANT') : 'BREACH'}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#C6CBD9]/70">Captive Equity Share:</span>
                <span className="font-mono font-bold text-white">{testEquityPct}% (Min: 26%)</span>
              </div>
              <input
                type="range"
                min="15"
                max="35"
                step="0.5"
                value={testEquityPct}
                onChange={(e) => setTestEquityPct(Number(e.target.value))}
                className="w-full accent-[#28B8B4] bg-[#07122A] h-1.5 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#C6CBD9]/70">Annual Consumption:</span>
                <span className="font-mono font-bold text-white">{testConsumptionPct}% (Min: 51%)</span>
              </div>
              <input
                type="range"
                min="35"
                max="75"
                step="0.5"
                value={testConsumptionPct}
                onChange={(e) => setTestConsumptionPct(Number(e.target.value))}
                className="w-full accent-[#28B8B4] bg-[#07122A] h-1.5 rounded-lg"
              />
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-[11px] ${
            isCaptiveCompliant
              ? 'bg-[#07122A] border-green-500/30 text-[#C6CBD9]'
              : 'bg-red-500/10 border-red-500/40 text-red-300'
          }`}>
            {isCaptiveCompliant ? (
              <span>✓ User satisfies Rule 3 EA 2003 criteria. 100% CSS & AS exemptions safe.</span>
            ) : (
              <span>⚠️ Critical Breach: Plant loses captive status. DISCOM will retrospectively bill 100% CSS & AS with interest.</span>
            )}
          </div>
        </div>

        {/* 2. Contract Demand Overshoot Simulator */}
        <div className="p-5 rounded-2xl bg-[#09193C] border border-[#2D50A1]/40 space-y-4 shadow-lg">
          <div className="flex justify-between items-center pb-2 border-b border-[#2D50A1]/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#F79050]" /> 2. CD Overshoot Guard
            </h3>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
              isCdOvershot ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {isCdOvershot ? 'OVERSHOOT' : 'WITHIN LIMIT'}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#C6CBD9]/70">Contract Demand:</span>
                <span className="font-mono font-bold text-white">{testCdKva} kVA</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={testCdKva}
                onChange={(e) => setTestCdKva(Number(e.target.value))}
                className="w-full accent-[#2D50A1] bg-[#07122A] h-1.5 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#C6CBD9]/70">Actual Max Demand:</span>
                <span className="font-mono font-bold text-[#F79050]">{testActualMdKva} kVA</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="50"
                value={testActualMdKva}
                onChange={(e) => setTestActualMdKva(Number(e.target.value))}
                className="w-full accent-[#F79050] bg-[#07122A] h-1.5 rounded-lg"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#07122A] border border-[#2D50A1]/30 text-xs font-mono space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#C6CBD9]/70">Excess Demand:</span>
              <span className={excessKva > 0 ? 'text-red-400 font-bold' : 'text-green-400'}>
                {excessKva} kVA
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#C6CBD9]/70">Penalty Rate:</span>
              <span className="text-white">150% (₹{penaltyDemandRate}/kVA)</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1 border-t border-[#2D50A1]/30">
              <span className="text-[#C6CBD9]/70">Penalty Surcharge:</span>
              <span className="text-[#F79050] font-bold">₹{excessDemandPenalty.toLocaleString()}/mo</span>
            </div>
          </div>
        </div>

        {/* 3. Power Factor Guard */}
        <div className="p-5 rounded-2xl bg-[#09193C] border border-[#2D50A1]/40 space-y-4 shadow-lg">
          <div className="flex justify-between items-center pb-2 border-b border-[#2D50A1]/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#7CD9D6]" /> 3. Power Factor Guard
            </h3>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
              testPf >= 0.95 ? 'bg-green-500/20 text-green-400' : testPf < 0.90 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-white'
            }`}>
              PF {testPf}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#C6CBD9]/70">Recorded Monthly PF:</span>
                <span className="font-mono font-bold text-white">{testPf}</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.00"
                step="0.01"
                value={testPf}
                onChange={(e) => setTestPf(Number(e.target.value))}
                className="w-full accent-[#7CD9D6] bg-[#07122A] h-1.5 rounded-lg"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#07122A] border border-[#2D50A1]/30 text-xs font-mono space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#C6CBD9]/70">Status:</span>
              <span className={`font-bold ${pfAdjustmentColor}`}>{pfStatus}</span>
            </div>
            <p className="text-[11px] text-[#C6CBD9]/70 leading-tight">
              {pfAdjustmentText}
            </p>
            <div className="pt-1 text-[10px] text-[#C6CBD9]/50 font-sans">
              SERC Rule: Penalty begins &lt; 0.90; Incentive begins &gt; 0.95 up to unity (1.00).
            </div>
          </div>
        </div>
      </div>

      {/* Banking Forfeiture Countdown Card */}
      <div className="p-5 rounded-2xl bg-[#09193C] border border-[#2D50A1]/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-[#F79050]" />
          <div>
            <h4 className="text-sm font-bold text-white">RE Banking Year-End Settlement & Forfeiture Rule</h4>
            <p className="text-xs text-[#C6CBD9]/80 mt-0.5">
              Unutilized surplus banked energy cannot be carried forward across financial years. Must be settled at APPC rates or forfeited on 31st March.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-[#C6CBD9]/60 uppercase font-mono block">Annual Deadline</span>
          <span className="text-sm font-mono font-bold text-[#F79050]">31st March (Midnight)</span>
        </div>
      </div>
    </div>
  );
}