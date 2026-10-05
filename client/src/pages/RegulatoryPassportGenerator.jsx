import React, { useState, useEffect } from 'react';
import {
  FileText,
  Building2,
  Zap,
  Download,
  Copy,
  Check,
  Printer,
  Sparkles,
  QrCode,
  ShieldCheck,
  Send,
  ArrowRight,
  TrendingDown,
  Layers,
  Clock,
  PiggyBank
} from 'lucide-react';
import { api } from '../services/api';
import { exportPassportToCSV } from '../utils/exportUtils';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function RegulatoryPassportGenerator() {
  const [states, setStates] = useState([]);
  const [discoms, setDiscoms] = useState([]);
  const [gesId, setGesId] = useState('GES-023');
  const [consumerName, setConsumerName] = useState('Jalna Steel Alloys Plant 02');
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [selectedDiscom, setSelectedDiscom] = useState('msedcl');
  const [contractDemandKva, setContractDemandKva] = useState(2500);
  const [voltage, setVoltage] = useState('33 kV');
  const [technology, setTechnology] = useState('Solar + Wind Hybrid');

  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

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

  // Load DISCOMs on state change
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

  // Generate Passport
  useEffect(() => {
    async function fetchPassport() {
      setLoading(true);
      try {
        const res = await api.generatePassport({
          ges_id: gesId,
          consumer_name: consumerName,
          state_id: selectedState,
          discom_id: selectedDiscom,
          contract_demand_kva: contractDemandKva,
          voltage_code: voltage,
          technology
        });
        setPassport(res);
      } catch (err) {
        console.error('Failed to generate passport:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPassport();
  }, [gesId, consumerName, selectedState, selectedDiscom, contractDemandKva, voltage, technology]);

  const handleCopyJSON = () => {
    if (!passport) return;
    navigator.clipboard.writeText(JSON.stringify(passport, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    if (!passport) return;
    setIsExportingPdf(true);
    await exportElementToPDF({
      elementId: 'regulatory-passport-report-area',
      fileName: `NewRa_Passport_${passport.entity.ges_id}_${passport.entity.state}`,
      reportTitle: `GES / GEP Regulatory Passport - ${passport.passport_urn}`,
      entityName: passport.entity.consumer_name
    });
    setIsExportingPdf(false);
  };

  const voltages = ['11 kV', '22 kV', '33 kV', '66 kV', '110 kV', '132 kV', '220 kV'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#09193C] via-[#0B1B3D] to-[#07122A] border border-[#2D50A1]/40 shadow-xl print:hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#28B8B4]/20 border border-[#28B8B4]/40 text-[#28B8B4]">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#28B8B4]/20 text-[#28B8B4] border border-[#28B8B4]/30 rounded">
                Master Entity SSoT
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">GES / GEP Regulatory Passport Generator</h1>
            </div>
            <p className="text-xs text-[#C6CBD9]/80 mt-1">
              Creates a unified, version-stamped regulatory asset bundling tariffs, losses, banking, and OA rules for seamless propagation to Lens, GridFlex, Connect, and Ledger.
            </p>
          </div>
        </div>

        {passport && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#07122A] border border-[#2D50A1]/60 text-[#C6CBD9] hover:text-white hover:border-[#28B8B4] transition flex items-center gap-1.5 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={() => exportPassportToCSV(passport)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#07122A] border border-[#2D50A1]/60 text-[#C6CBD9] hover:text-white hover:border-[#28B8B4] transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#28B8B4]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#28B8B4] text-[#09193C] hover:bg-[#7CD9D6] transition flex items-center gap-1.5 shadow-md shadow-[#28B8B4]/20 disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Exporting PDF...' : 'Export Passport PDF'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid: Left Input Parameters vs Right Visual Passport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          <div className="p-5 rounded-2xl bg-[#09193C] border border-[#2D50A1]/40 space-y-4 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#28B8B4] flex items-center gap-2 border-b border-[#2D50A1]/30 pb-2">
              <Building2 className="w-4 h-4" /> Consumer & Grid Parameters
            </h2>

            {/* GES Permanent ID */}
            <div>
              <label className="text-[11px] font-bold text-[#C6CBD9] block mb-1">Consumer Master ID (NewRa Identity)</label>
              <input
                type="text"
                value={gesId}
                onChange={(e) => setGesId(e.target.value)}
                className="w-full bg-[#07122A] border border-[#2D50A1]/50 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#28B8B4] focus:outline-none focus:border-[#28B8B4]"
                placeholder="e.g. GES-023"
              />
            </div>

            {/* Consumer Name */}
            <div>
              <label className="text-[11px] font-bold text-[#C6CBD9] block mb-1">Company / Plant Name</label>
              <input
                type="text"
                value={consumerName}
                onChange={(e) => setConsumerName(e.target.value)}
                className="w-full bg-[#07122A] border border-[#2D50A1]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#28B8B4]"
                placeholder="e.g. Tata Steel Jalna Plant"
              />
            </div>

            {/* State */}
            <div>
              <label className="text-[11px] font-bold text-[#C6CBD9] block mb-1">State Jurisdiction</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-[#07122A] border border-[#2D50A1]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#28B8B4]"
              >
                {states.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.regulator_code})</option>
                ))}
              </select>
            </div>

            {/* DISCOM */}
            <div>
              <label className="text-[11px] font-bold text-[#C6CBD9] block mb-1">Host DISCOM Licensee</label>
              <select
                value={selectedDiscom}
                onChange={(e) => setSelectedDiscom(e.target.value)}
                className="w-full bg-[#07122A] border border-[#2D50A1]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#28B8B4]"
              >
                {discoms.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            {/* Contract Demand */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-[#C6CBD9]">Contract Demand</label>
                <span className="text-xs font-mono font-bold text-[#28B8B4]">
                  {contractDemandKva.toLocaleString()} kVA ({(contractDemandKva / 1000).toFixed(2)} MW)
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="25000"
                step="50"
                value={contractDemandKva}
                onChange={(e) => setContractDemandKva(Number(e.target.value))}
                className="w-full accent-[#28B8B4] bg-[#07122A] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Voltage */}
            <div>
              <label className="text-[11px] font-bold text-[#C6CBD9] block mb-1">Interconnection Voltage</label>
              <div className="grid grid-cols-4 gap-1.5">
                {voltages.map(v => (
                  <button
                    key={v}
                    onClick={() => setVoltage(v)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold border transition ${
                      voltage === v
                        ? 'bg-[#28B8B4] text-[#09193C] border-[#28B8B4]'
                        : 'bg-[#07122A] border-[#2D50A1]/40 text-[#C6CBD9] hover:border-[#28B8B4]/40'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Sourced RE Technology */}
            <div>
              <label className="text-[11px] font-bold text-[#C6CBD9] block mb-1">Proposed RE Sourcing</label>
              <select
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                className="w-full bg-[#07122A] border border-[#2D50A1]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#28B8B4]"
              >
                <option value="Solar PV">Solar PV Ground Mounted</option>
                <option value="Wind">Wind Power</option>
                <option value="Solar + Wind Hybrid">Solar + Wind Hybrid</option>
                <option value="Solar + BESS">Solar + BESS (Storage)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Visual Passport Card (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {passport && (
            <div id="regulatory-passport-report-area" className="p-6 rounded-3xl bg-gradient-to-br from-[#09193C] via-[#0B1B3D] to-[#07122A] border-2 border-[#28B8B4]/50 shadow-2xl space-y-6 relative overflow-hidden print:p-0 print:border-none print:shadow-none">
              {/* Background Watermark Aesthetic */}
              <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none text-white select-none">
                <ShieldCheck className="w-80 h-80" />
              </div>

              {/* Passport Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2D50A1]/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#28B8B4]/20 text-[#28B8B4] border border-[#28B8B4]/40 rounded">
                      Official Regulatory Passport
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/30 rounded">
                      {passport.verification_status}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1 tracking-tight">
                    {passport.entity.consumer_name}
                  </h2>
                  <div className="font-mono text-xs text-[#7CD9D6] mt-0.5 flex items-center gap-2">
                    <span>URN: {passport.passport_urn}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-[#07122A] border border-[#2D50A1]/50 text-right">
                    <span className="text-[10px] text-[#C6CBD9]/60 uppercase block font-mono">Entity ID</span>
                    <span className="text-base font-mono font-black text-[#28B8B4]">{passport.entity.ges_id}</span>
                  </div>
                </div>
              </div>

              {/* Grid Node Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#07122A]/80 border border-[#2D50A1]/40">
                  <span className="text-[10px] text-[#C6CBD9]/60 block font-medium">State / SERC</span>
                  <span className="text-xs font-bold text-white block truncate">{passport.entity.state}</span>
                  <span className="text-[10px] font-mono text-[#28B8B4]">{passport.entity.regulator}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#07122A]/80 border border-[#2D50A1]/40">
                  <span className="text-[10px] text-[#C6CBD9]/60 block font-medium">Host DISCOM</span>
                  <span className="text-xs font-bold text-white block truncate">{passport.entity.discom}</span>
                  <span className="text-[10px] font-mono text-[#C6CBD9]/70">{passport.entity.discom_code}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#07122A]/80 border border-[#2D50A1]/40">
                  <span className="text-[10px] text-[#C6CBD9]/60 block font-medium">Contract Demand</span>
                  <span className="text-xs font-mono font-bold text-white block">
                    {passport.entity.contract_demand_kva.toLocaleString()} kVA
                  </span>
                  <span className="text-[10px] font-mono text-[#F79050]">{passport.entity.contract_demand_mw} MW</span>
                </div>
                <div className="p-3 rounded-xl bg-[#07122A]/80 border border-[#2D50A1]/40">
                  <span className="text-[10px] text-[#C6CBD9]/60 block font-medium">Interconnection</span>
                  <span className="text-xs font-mono font-bold text-white block">{passport.entity.voltage_code}</span>
                  <span className="text-[10px] text-[#28B8B4]">{passport.entity.technology}</span>
                </div>
              </div>

              {/* Module 1 & 2: Tariffs (Lens) vs Landed Surcharges (GridFlex) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Module 1: Retail Tariff (Feed to NewRa Lens) */}
                <div className="p-4 rounded-2xl bg-[#07122A] border border-[#2D50A1]/40 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#2D50A1]/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#28B8B4]">
                      1. Retail Tariff Feed (Lens)
                    </span>
                    <span className="text-[10px] font-mono text-[#C6CBD9]/60">{passport.tariff_and_billing.financial_year}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#C6CBD9]/60 block font-sans">Base Energy</span>
                      <span className="font-bold text-white">₹{passport.tariff_and_billing.base_energy_charge_rs_unit}</span>
                      <span className="text-[10px] text-[#C6CBD9]/50 block font-sans">per {passport.tariff_and_billing.energy_unit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#C6CBD9]/60 block font-sans">Demand Charge</span>
                      <span className="font-bold text-white">₹{passport.tariff_and_billing.demand_charge_rs_kva_mo}</span>
                      <span className="text-[10px] text-[#C6CBD9]/50 block font-sans">per kVA/mo</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#2D50A1]/20 text-[11px] text-[#C6CBD9]/80 space-y-1">
                    <div><strong>Billing Demand:</strong> {passport.tariff_and_billing.billing_demand_rule}</div>
                    <div><strong>Electricity Duty:</strong> {passport.tariff_and_billing.electricity_duty_pct}% • <strong>FAC:</strong> ₹{passport.tariff_and_billing.fac_fppas_rs_kwh}/kWh</div>
                  </div>
                </div>

                {/* Module 2: Open Access Surcharges (Feed to GridFlex) */}
                <div className="p-4 rounded-2xl bg-[#07122A] border border-[#2D50A1]/40 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#2D50A1]/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F79050]">
                      2. Open Access Surcharges (GridFlex)
                    </span>
                    <span className="text-[10px] font-mono text-green-400 font-bold">Captive 100% Exempt</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#C6CBD9]/60 block font-sans">Wheeling Charge</span>
                      <span className="font-bold text-white">₹{passport.open_access_and_landed.wheeling_charge_rs_kwh}/kWh</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#C6CBD9]/60 block font-sans">Transmission</span>
                      <span className="font-bold text-white">₹{passport.open_access_and_landed.transmission_charge_rs_mw_day}/MW/day</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#C6CBD9]/60 block font-sans">Cross Subsidy (CSS)</span>
                      <span className="font-bold text-[#F79050]">₹{passport.open_access_and_landed.cross_subsidy_surcharge_rs_kwh}/kWh</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#C6CBD9]/60 block font-sans">Additional Surcharge</span>
                      <span className="font-bold text-[#F79050]">₹{passport.open_access_and_landed.additional_surcharge_rs_kwh}/kWh</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#2D50A1]/20 flex justify-between items-center text-xs">
                    <span className="text-[#C6CBD9]/70 font-sans">Net Captive Savings:</span>
                    <span className="font-mono font-bold text-green-400">
                      +₹{passport.open_access_and_landed.captive_exemption_savings_rs_kwh}/kWh
                    </span>
                  </div>
                </div>
              </div>

              {/* Module 3 & 4: Losses & Banking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Module 3: Technical Losses */}
                <div className="p-4 rounded-2xl bg-[#07122A] border border-[#2D50A1]/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7CD9D6] block">
                    3. Technical Losses & Multiplier
                  </span>
                  <div className="flex justify-between items-center text-xs font-mono pt-1">
                    <span className="text-[#C6CBD9]/70">STU Loss: {passport.technical_losses.stu_transmission_loss_pct}%</span>
                    <span className="text-[#C6CBD9]/70">Wheeling Loss: {passport.technical_losses.discom_wheeling_loss_pct}%</span>
                    <span className="font-bold text-[#F79050]">Total: {passport.technical_losses.total_loss_pct}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#09193C] text-xs font-mono flex justify-between items-center">
                    <span className="text-[#C6CBD9]/70">Loss Gross-up Multiplier:</span>
                    <span className="font-bold text-[#28B8B4]">× {passport.technical_losses.loss_gross_up_multiplier}</span>
                  </div>
                </div>

                {/* Module 4: RE Banking Rules */}
                <div className="p-4 rounded-2xl bg-[#07122A] border border-[#2D50A1]/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F79050] block">
                    4. RE Banking & Settlement
                  </span>
                  <div className="flex justify-between items-center text-xs font-mono pt-1">
                    <span className="text-[#C6CBD9]/70">Cycle: {passport.banking_and_settlement.settlement_cycle}</span>
                    <span className="font-bold text-[#F79050]">In-Kind: {passport.banking_and_settlement.in_kind_deduction_pct}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#09193C] text-[11px] text-[#C6CBD9]/80 truncate">
                    <strong>Drawal:</strong> {passport.banking_and_settlement.tod_restrictions}
                  </div>
                </div>
              </div>

              {/* Passport Footer Guarantee */}
              <div className="pt-3 border-t border-[#2D50A1]/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#C6CBD9]/60 font-mono gap-2">
                <span>NEWRA CORE COMPLIANCE ENGINE • RULE 3 EA 2003 VERIFIED</span>
                <span>Timestamp: {new Date(passport.generated_at).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}