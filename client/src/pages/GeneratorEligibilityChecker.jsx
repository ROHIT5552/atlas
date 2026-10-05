import React, { useState, useEffect } from 'react';
import {
  Sun,
  Wind,
  BatteryCharging,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
  Sparkles,
  Layers,
  Calendar,
  DollarSign,
  Printer
} from 'lucide-react';
import { api } from '../services/api';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function GeneratorEligibilityChecker() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [technology, setTechnology] = useState('Solar PV');
  const [capacityMw, setCapacityMw] = useState(10);
  const [gridType, setGridType] = useState('InSTS / STU');
  const [loading, setLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [propagated, setPropagated] = useState(false);
  const [result, setResult] = useState(null);

  const handleExportPDF = async () => {
    setIsExportingPdf(true);
    try {
      await exportElementToPDF({
        elementId: 'generator-eligibility-report-area',
        fileName: `NewRa_Generator_Eligibility_${selectedState}_${technology.replace(/\s+/g, '_')}_${capacityMw}MW.pdf`,
        reportTitle: 'Generator Regulatory Eligibility & Grid Connection Assessment (GEP)',
        entityName: `${selectedState.toUpperCase()} - ${technology} (${capacityMw} MW | ${gridType})`
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
        const data = await api.getStates();
        setStates(data.states || []);
      } catch (err) {
        console.error('Failed to load states:', err);
      }
    }
    loadStates();
  }, []);

  useEffect(() => {
    async function evaluate() {
      setLoading(true);
      try {
        const res = await api.checkGeneratorEligibility({
          state_id: selectedState,
          technology,
          capacity_mw: capacityMw,
          grid_type: gridType
        });
        setResult(res);
      } catch (err) {
        console.error('Failed to evaluate generator eligibility:', err);
      } finally {
        setLoading(false);
      }
    }
    evaluate();
  }, [selectedState, technology, capacityMw, gridType]);

  const technologies = [
    { id: 'Solar PV', label: 'Ground Solar PV', icon: Sun },
    { id: 'Wind', label: 'Wind Power', icon: Wind },
    { id: 'Wind-Solar Hybrid', label: 'Wind-Solar Hybrid', icon: Zap },
    { id: 'BESS', label: 'Battery Storage (BESS)', icon: BatteryCharging }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#09193C] via-[#0B1B3D] to-[#07122A] border border-[#2D50A1]/40 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#F79050]/20 border border-[#F79050]/40 text-[#F79050]">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F79050]/20 text-[#F79050] border border-[#F79050]/30 rounded">
                Atlas Engine 5
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Generator Eligibility Checker (GEP)</h1>
            </div>
            <p className="text-xs text-[#C6CBD9]/80 mt-1">
              Location-based and technology-specific regulatory eligibility for Solar, Wind, Hybrid, and BESS power plants.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf || !result}
            className="flex items-center gap-2 px-4 py-2 bg-[#2D50A1]/30 hover:bg-[#2D50A1]/50 border border-[#2D50A1] text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-md"
            title="Download Generator Feasibility Assessment as Executive PDF"
          >
            <Printer className="w-4 h-4 text-[#F79050]" />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Export Feasibility PDF'}</span>
          </button>
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-[#C6CBD9]/60 block font-medium">Downstream Destination</span>
            <span className="text-xs font-bold text-[#F79050] flex items-center gap-1 justify-end">
              <Sparkles className="w-3.5 h-3.5" /> Feeds ResourceLab & Market
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls vs Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-[#09193C] border border-[#2D50A1]/40 space-y-4 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F79050] flex items-center gap-2 border-b border-[#2D50A1]/30 pb-2">
              <Layers className="w-4 h-4" /> 1. Generator Facility Parameters
            </h2>

            {/* State */}
            <div>
              <label className="text-[11px] font-bold text-[#C6CBD9] block mb-1">Plant Location State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-[#07122A] border border-[#2D50A1]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F79050]"
              >
                {states.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.regulator_code})</option>
                ))}
              </select>
            </div>

            {/* Technology */}
            <div>
              <label className="text-[11px] font-bold text-[#C6CBD9] block mb-1.5">RE Generation Technology</label>
              <div className="grid grid-cols-2 gap-2">
                {technologies.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTechnology(t.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition ${
                        technology === t.id
                          ? 'bg-[#F79050]/20 border-[#F79050] text-white shadow-md shadow-[#F79050]/10'
                          : 'bg-[#07122A] border-[#2D50A1]/40 text-[#C6CBD9] hover:border-[#F79050]/40'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${technology === t.id ? 'text-[#F79050]' : 'text-[#C6CBD9]/60'}`} />
                      <span className="text-xs font-bold">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plant Capacity (MW) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-[#C6CBD9]">Installed Capacity</label>
                <span className="text-xs font-mono font-bold text-[#F79050]">{capacityMw} MW</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={capacityMw}
                onChange={(e) => setCapacityMw(Number(e.target.value))}
                className="w-full accent-[#F79050] bg-[#07122A] h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#C6CBD9]/50 mt-1 font-mono">
                <span>1 MW</span>
                <span>25 MW</span>
                <span>50 MW</span>
                <span>100 MW</span>
              </div>
            </div>

            {/* Interconnection Grid */}
            <div>
              <label className="text-[11px] font-bold text-[#C6CBD9] block mb-1">Grid Interconnection Level</label>
              <div className="grid grid-cols-2 gap-2">
                {['InSTS / STU', 'ISTS / CTU'].map(g => (
                  <button
                    key={g}
                    onClick={() => setGridType(g)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      gridType === g
                        ? 'bg-[#2D50A1] text-white border-[#28B8B4]'
                        : 'bg-[#07122A] border-[#2D50A1]/40 text-[#C6CBD9] hover:border-[#2D50A1]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Evaluation (8 Cols) */}
        <div id="generator-eligibility-report-area" className="lg:col-span-8 space-y-4">
          {result && (
            <>
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. RE Banking Rules */}
                <div className="p-5 rounded-2xl bg-[#09193C] border border-[#2D50A1]/40 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#28B8B4] bg-[#28B8B4]/10 px-2 py-0.5 rounded border border-[#28B8B4]/30">
                        SERC Banking Order
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">Energy Banking Rules</h3>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      result.banking_rules.banking_permitted
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {result.banking_rules.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2D50A1]/30 text-xs">
                    <div>
                      <span className="text-[#C6CBD9]/60 block text-[10px]">Settlement Period</span>
                      <span className="font-bold text-white">{result.banking_rules.banking_period}</span>
                    </div>
                    <div>
                      <span className="text-[#C6CBD9]/60 block text-[10px]">In-Kind Deduction</span>
                      <span className="font-mono font-bold text-[#F79050]">
                        {result.banking_rules.in_kind_charge_pct}% of Injected Energy
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#07122A] text-[11px] text-[#C6CBD9]/80 border border-[#2D50A1]/30">
                    <strong className="text-white">TOD Restriction:</strong> {result.banking_rules.tod_restrictions}
                  </div>
                </div>

                {/* 2. Grid Interconnection Mandates */}
                <div className="p-5 rounded-2xl bg-[#09193C] border border-[#2D50A1]/40 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#F79050] bg-[#F79050]/10 px-2 py-0.5 rounded border border-[#F79050]/30">
                        Evacuation & Interconnection
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">Grid Technical Requirements</h3>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#2D50A1]/40 text-[#7CD9D6] border border-[#2D50A1] rounded-lg">
                      {result.grid_connectivity.evacuation_voltage} Evacuation
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#2D50A1]/30 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#C6CBD9]/60">Interconnection Grid:</span>
                      <span className="font-bold text-white">{result.grid_connectivity.grid_level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#C6CBD9]/60">Metering Protocol:</span>
                      <span className="font-mono text-white text-[11px]">0.2s ABT SEM + AMR</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#07122A] text-[11px] text-[#C6CBD9]/80 border border-[#2D50A1]/30">
                    <strong className="text-white">Scheduling:</strong> {result.grid_connectivity.scheduling_timeline}
                  </div>
                </div>
              </div>

              {/* Central ISTS Waiver & Policy Banner */}
              <div className="p-4 rounded-xl bg-[#0B1B3D] border border-[#2D50A1]/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#28B8B4] shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Transmission Pricing & Waiver Status</h4>
                    <p className="text-[11px] text-[#C6CBD9]/80 mt-0.5">{result.grid_connectivity.ists_waiver}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPropagated(true);
                    setTimeout(() => setPropagated(false), 3000);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shrink-0 ${
                    propagated
                      ? 'bg-[#28B8B4] text-[#09193C] shadow-[#28B8B4]/20'
                      : 'bg-[#F79050] text-[#09193C] hover:bg-[#F9A875] shadow-[#F79050]/20'
                  }`}
                >
                  {propagated ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{propagated ? 'Synced to ResourceLab & Market' : 'Send to ResourceLab'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
