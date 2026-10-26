import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Building2,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Send,
  HelpCircle,
  Printer
} from 'lucide-react';
import { api } from '../services/api';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function ConsumerEligibilityChecker({ onSendToGridflex }) {
  const [states, setStates] = useState([]);
  const [discoms, setDiscoms] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [selectedDiscom, setSelectedDiscom] = useState('msedcl');
  const [contractDemandKva, setContractDemandKva] = useState(1500);
  const [voltage, setVoltage] = useState('33 kV');
  const [loading, setLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [result, setResult] = useState(null);

  // Load states on mount
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

  // Load DISCOMs when state changes
  useEffect(() => {
    async function loadDiscoms() {
      try {
        const data = await api.getDiscoms({ state_id: selectedState });
        const list = data.discoms || [];
        setDiscoms(list);
        if (list.length > 0 && !list.some(d => d.id === selectedDiscom)) {
          setSelectedDiscom(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load discoms:', err);
      }
    }
    loadDiscoms();
  }, [selectedState]);

  // Evaluate eligibility
  useEffect(() => {
    async function evaluate() {
      setLoading(true);
      try {
        const res = await api.checkConsumerEligibility({
          state_id: selectedState,
          discom_id: selectedDiscom,
          contract_demand_kva: contractDemandKva,
          voltage_code: voltage
        });
        setResult(res);
      } catch (err) {
        console.error('Failed to evaluate eligibility:', err);
      } finally {
        setLoading(false);
      }
    }
    evaluate();
  }, [selectedState, selectedDiscom, contractDemandKva, voltage]);

  const voltages = ['11 kV', '22 kV', '33 kV', '66 kV', '110 kV', '132 kV', '220 kV'];

  const handleExportPDF = async () => {
    setIsExportingPdf(true);
    try {
      await exportElementToPDF({
        elementId: 'consumer-eligibility-report-area',
        fileName: `NewRa_GES_Eligibility_${selectedState}_${contractDemandKva}kVA.pdf`,
        reportTitle: 'Consumer Eligibility & Open Access Feasibility (GES)',
        entityName: `${selectedState.toUpperCase()} - ${selectedDiscom.toUpperCase()} (${contractDemandKva} kVA / ${voltage})`
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[var(--surface-1)] via-[var(--surface-1)] to-[var(--bg)] border border-[var(--line)]/40 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[var(--violet)]/20 border border-[var(--line)]/40 text-[var(--lilac)]">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--violet)]/20 text-[var(--lilac)] border border-[var(--line)]/30 rounded">
                Atlas Engine 4
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Consumer Eligibility Checker (GES)</h1>
            </div>
            <p className="text-xs text-[var(--muted)]/80 mt-1">
              Automated statutory Open Access, GEOA, Captive, and supply voltage eligibility diagnosis for any Green Energy Seeker.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf || !result}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)]/50 border border-[var(--line)] text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-md"
            title="Download Feasibility Assessment as Executive PDF"
          >
            <Printer className="w-4 h-4 text-[var(--lilac)]" />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Export Feasibility PDF'}</span>
          </button>
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-[var(--muted)]/60 block font-medium">Downstream Destination</span>
            <span className="text-xs font-bold text-[var(--lilac)] flex items-center gap-1 justify-end">
              <Sparkles className="w-3.5 h-3.5" /> Feeds NewRa Lens & GridFlex
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--line)]/40 space-y-4 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lilac)] flex items-center gap-2 border-b border-[var(--line)]/30 pb-2">
              <Building2 className="w-4 h-4" /> 1. Consumer Facility Parameters
            </h2>

            {/* State Selector */}
            <div>
              <label className="text-[11px] font-bold text-[var(--muted)] block mb-1">State Jurisdiction</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--line)]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--line)]"
              >
                {states.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.regulator_code})</option>
                ))}
              </select>
            </div>

            {/* DISCOM Selector */}
            <div>
              <label className="text-[11px] font-bold text-[var(--muted)] block mb-1">Host DISCOM Licensee</label>
              <select
                value={selectedDiscom}
                onChange={(e) => setSelectedDiscom(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--line)]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--line)]"
              >
                {discoms.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            {/* Contract Demand */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-[var(--muted)]">Contract Demand</label>
                <span className="text-xs font-mono font-bold text-[var(--lilac)]">
                  {contractDemandKva.toLocaleString()} kVA ({(contractDemandKva / 1000).toFixed(2)} MW)
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="25000"
                step="50"
                value={contractDemandKva}
                onChange={(e) => setContractDemandKva(Number(e.target.value))}
                className="w-full accent-[#28B8B4] bg-[var(--bg)] h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)]/50 mt-1 font-mono">
                <span>50 kW (GEOA Min)</span>
                <span>1,000 kVA (1 MW OA)</span>
                <span>25,000 kVA</span>
              </div>
            </div>

            {/* Supply Voltage */}
            <div>
              <label className="text-[11px] font-bold text-[var(--muted)] block mb-1">Interconnection Voltage</label>
              <div className="grid grid-cols-3 gap-1.5">
                {voltages.map(v => (
                  <button
                    key={v}
                    onClick={() => setVoltage(v)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold border transition ${
                      voltage === v
                        ? 'bg-[var(--violet)] text-[var(--text)] border-[var(--line)] shadow-md shadow-[#28B8B4]/20'
                        : 'bg-[var(--bg)] border-[var(--line)]/40 text-[var(--muted)] hover:border-[var(--line)]/40'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-xl bg-[var(--surface-1)]/60 border border-[var(--line)]/30 text-xs text-[var(--muted)] space-y-2">
            <div className="flex items-center gap-1.5 text-[var(--lilac)] font-bold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Electricity Act 2003 Rule 3</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--muted)]/80">
              Captive generation requires the captive consumer to hold at least <strong className="text-white">26% equity</strong> in the generating plant and consume at least <strong className="text-white">51%</strong> of electricity generated annually, granting 100% exemption from Cross Subsidy Surcharge (CSS) and Additional Surcharge (AS).
            </p>
          </div>
        </div>

        {/* Right Output Assessment (8 Cols) */}
        <div id="consumer-eligibility-report-area" className="lg:col-span-8 space-y-4">
          {result && (
            <>
              {/* Route Viability Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Group Captive Route */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  result.eligibility.group_captive.eligible
                    ? 'bg-[var(--surface-1)] border-[var(--line)]/60 shadow-lg shadow-[#28B8B4]/10'
                    : 'bg-[var(--surface-1)]/40 border-red-500/30'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lilac)] bg-[var(--violet)]/10 px-2 py-0.5 rounded border border-[var(--line)]/30">
                      Best Financial Route
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-[var(--lilac)]" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Group Captive (26/51)</h3>
                  <p className="text-[11px] text-[var(--muted)]/70 mb-3">100% CSS & AS Exemption under EA 2003</p>
                  <div className="pt-2 border-t border-[var(--line)]/30 flex justify-between items-center text-xs">
                    <span className="text-[var(--muted)]/60">Surcharge Savings:</span>
                    <span className="font-mono font-bold text-[var(--lilac)]">
                      +₹{result.surcharges_preview.captive_exemption_savings_rs_kwh}/kWh
                    </span>
                  </div>
                </div>

                {/* 2. Green Energy OA (GEOA) */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  result.eligibility.green_energy_open_access.eligible
                    ? 'bg-[var(--surface-1)] border-[var(--line)]/60'
                    : 'bg-[var(--surface-1)]/40 border-red-500/30'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lilac)] bg-[var(--surface-2)]/30 px-2 py-0.5 rounded border border-[var(--line)]/40">
                      MoP GEOA 2022
                    </span>
                    {result.eligibility.green_energy_open_access.eligible ? (
                      <CheckCircle2 className="w-5 h-5 text-[var(--lilac)]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Green Energy OA</h3>
                  <p className="text-[11px] text-[var(--muted)]/70 mb-3">Threshold: =100 kW load</p>
                  <div className="pt-2 border-t border-[var(--line)]/30 flex justify-between items-center text-xs">
                    <span className="text-[var(--muted)]/60">Status:</span>
                    <span className="font-bold text-[var(--lilac)]">{result.eligibility.green_energy_open_access.status}</span>
                  </div>
                </div>

                {/* 3. Conventional Third-Party OA */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  result.eligibility.conventional_open_access.eligible
                    ? 'bg-[var(--surface-1)] border-[var(--line)]/40'
                    : 'bg-[var(--surface-1)]/40 border-red-500/20'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      Third-Party Bilateral
                    </span>
                    {result.eligibility.conventional_open_access.eligible ? (
                      <CheckCircle2 className="w-5 h-5 text-[var(--lilac)]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Conventional OA</h3>
                  <p className="text-[11px] text-[var(--muted)]/70 mb-3">Threshold: =1,000 kVA (1 MW)</p>
                  <div className="pt-2 border-t border-[var(--line)]/30 flex justify-between items-center text-xs">
                    <span className="text-[var(--muted)]/60">Status:</span>
                    <span className={`font-bold ${result.eligibility.conventional_open_access.eligible ? 'text-white' : 'text-red-400'}`}>
                      {result.eligibility.conventional_open_access.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Voltage Code Compliance Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                result.eligibility.voltage_code_compliance.compliant
                  ? 'bg-[var(--violet)]/10 border-[var(--line)]/30 text-white'
                  : 'bg-[var(--violet)]/10 border-[var(--line)]/40 text-white'
              }`}>
                <div className="flex items-center gap-3">
                  {result.eligibility.voltage_code_compliance.compliant ? (
                    <ShieldCheck className="w-6 h-6 text-[var(--lilac)] shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-[var(--lilac)] shrink-0" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold">
                      Voltage Code Compliance: {result.eligibility.voltage_code_compliance.current_voltage} Interconnection
                    </h4>
                    <p className="text-[11px] text-[var(--muted)]/80 mt-0.5">
                      {result.eligibility.voltage_code_compliance.note}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)]/60 block">SERC Mandate</span>
                  <span className="text-xs font-mono font-bold text-[var(--lilac)]">
                    {result.eligibility.voltage_code_compliance.recommended_voltage}
                  </span>
                </div>
              </div>

              {/* Statutory Open Access Surcharges Matrix */}
              <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--line)]/40 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center justify-between">
                  <span>Host DISCOM Surcharge Breakdown ({result.ges_query.discom})</span>
                  <span className="text-[10px] font-normal text-[var(--muted)]/50">Per DISCOM Tariff Order</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]/30">
                    <span className="text-[10px] text-[var(--muted)]/60 block font-medium">Wheeling Charge</span>
                    <span className="text-base font-mono font-bold text-white">
                      ₹ {result.surcharges_preview.wheeling_charge}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]/40 block">per kWh</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]/30">
                    <span className="text-[10px] text-[var(--muted)]/60 block font-medium">Transmission Charge</span>
                    <span className="text-base font-mono font-bold text-white">
                      ₹ {result.surcharges_preview.transmission_charge_per_mw_day.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]/40 block">per MW/day</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]/30">
                    <span className="text-[10px] text-[var(--muted)]/60 block font-medium">Cross Subsidy (CSS)</span>
                    <span className="text-base font-mono font-bold text-[var(--lilac)]">
                      ₹ {result.surcharges_preview.css_third_party}
                    </span>
                    <span className="text-[10px] text-green-400 block font-medium">Exempt in Captive</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]/30">
                    <span className="text-[10px] text-[var(--muted)]/60 block font-medium">Additional Surcharge</span>
                    <span className="text-base font-mono font-bold text-[var(--lilac)]">
                      ₹ {result.surcharges_preview.as_third_party}
                    </span>
                    <span className="text-[10px] text-green-400 block font-medium">Exempt in Captive</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg)]/80 border border-[var(--line)]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--lilac)]" />
                      Net Captive Advantage: ₹ {result.surcharges_preview.captive_exemption_savings_rs_kwh}/kWh in Surcharge Waivers
                    </span>
                    <p className="text-[11px] text-[var(--muted)]/70 mt-0.5">
                      Governed by: {result.regulatory_citation}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (onSendToGridflex) {
                          onSendToGridflex();
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--violet)] text-[var(--text)] hover:bg-[var(--surface-2)] transition flex items-center gap-1.5 shadow-md shadow-[#28B8B4]/20"
                      title="Seamlessly transfer parameters to Landed Cost Calculator"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Propagate to GridFlex (LCoP)</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
