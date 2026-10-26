import React, { useState } from 'react';
import { X, Printer, Download, Copy, Check, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export interface ExecutiveDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export default function ExecutiveDossierModal({ isOpen, onClose, profile }: ExecutiveDossierModalProps) {
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!isOpen || !profile) return null;

  const state = profile.state_master;
  const discom = profile.discom_master;
  const tariff = profile.applicable_tariff;
  const losses = profile.grid_losses?.matching_loss;
  const banking = profile.banking_framework;
  const captive = profile.captive_framework;
  const voltageLevel = profile.query?.voltage_level || tariff?.voltage_level || '33 kV';

  const handleExportPDF = async () => {
    setIsExportingPdf(true);
    try {
      await exportElementToPDF({
        elementId: 'executive-dossier-report-area',
        fileName: `NewRa_Executive_Dossier_${state?.state_code || 'IN'}_${discom?.code || 'DISCOM'}.pdf`,
        reportTitle: 'Executive Regulatory Due Diligence Dossier',
        entityName: `${state?.name} — ${discom?.name} (${voltageLevel})`
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `# NEWRA GRIDS — REGULATORY DUE DILIGENCE DOSSIER
Jurisdiction: ${state?.name} (${state?.state_code}) | Licensee: ${discom?.name}
Date of Generation: ${new Date().toLocaleDateString('en-IN')}

## 1. Statutory Authorities & Infrastructure
- Electricity Regulatory Commission: ${state?.regulator_code}
- State Transmission Utility (STU): ${state?.stu_code}
- State Load Despatch Centre (SLDC): ${state?.sldc_code}
- Active Tariff Order Reference: ${discom?.tariff_order_ref}

## 2. Retail Tariff & Demand Charges
- Consumer Category: ${tariff?.tariff_category_name}
- Voltage Level: ${voltageLevel}
- Base Energy Charge: Rs ${tariff?.energy_charge} / ${tariff?.energy_charge_unit}
- Demand Charge: Rs ${tariff?.demand_charge} / ${tariff?.demand_charge_unit}
- Electricity Duty: ${tariff?.electricity_duty}% | FAC: Rs ${tariff?.fac_fppas}/kWh

## 3. Open Access & Grid Surcharges
- Wheeling Charge: Rs ${profile.oa_charges_breakdown?.[0]?.wheeling_charge}/kWh
- Cross Subsidy Surcharge (CSS): Rs ${profile.oa_charges_breakdown?.[0]?.css}/kWh (Captive: 100% EXEMPT)
- Additional Surcharge (AS): Rs ${profile.oa_charges_breakdown?.[0]?.additional_surcharge}/kWh (Captive: 100% EXEMPT)
- Technical Grid Losses (${voltageLevel}): ${losses?.total_technical_loss_pct}% (Tx: ${losses?.transmission_loss_pct}%, Wh: ${losses?.wheeling_loss_pct}%)

## 4. Renewable Energy Banking & Settlement
- Banking Horizon: ${banking?.banking_period}
- In-Kind Banking Charge: ${banking?.banking_charge_pct}%
- TOD Drawal Restrictions: ${banking?.tod_restrictions}
- Year-End Surplus Cashout: ${banking?.surplus_treatment_rate}

## 5. Captive Compliance Verification Framework
- Equity Threshold: Minimum 26% proprietary equity with voting rights
- Consumption Threshold: Minimum 51% proportional annual consumption
- Exemption Basis: Electricity Rules 2005 Rule 3 (Supreme Court Affirmation)
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[var(--bg)] border border-[var(--line)] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)]/30 bg-[var(--surface-1)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--violet)]/20 border border-[var(--line)]/40 flex items-center justify-center text-[var(--lilac)] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">Executive Regulatory Dossier</h2>
              <p className="text-[11px] sm:text-xs text-[var(--muted)]">Investment Committee & Commercial Structuring Brief</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 self-end sm:self-auto">
            <button
              onClick={handleCopyMarkdown}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]/60 text-xs font-bold text-[var(--muted)] hover:text-white transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs font-bold text-white hover:bg-[var(--surface-2)]/80 transition flex items-center gap-1.5 disabled:opacity-50"
              title="Download Executive Dossier as PDF"
            >
              <Download className="w-3.5 h-3.5 text-[var(--lilac)]" />
              <span>{isExportingPdf ? 'Exporting...' : 'PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[var(--violet)] text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable / Viewable Body */}
        <div id="executive-dossier-report-area" className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 text-xs leading-relaxed">
          {/* Header Identity */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--line)]/40 flex flex-wrap justify-between items-center gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[var(--lilac)]">Primary Jurisdiction Coordinate</span>
              <h3 className="text-base sm:text-xl font-bold text-white mt-0.5">{state?.name} — {discom?.name}</h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">Order Ref: {discom?.tariff_order_ref}</p>
            </div>
            <StatusBadge status={tariff?.verification_status} />
          </div>

          {/* 1. Tariff & Supply Parameters */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--lilac)] border-b border-[var(--line)]/30 pb-1">
              1. Retail Tariff & Demand Charges
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--line)]/30">
                <span className="text-[10px] text-[var(--muted)]">Category</span>
                <div className="font-bold text-white truncate">{tariff?.tariff_category_name}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--line)]/30">
                <span className="text-[10px] text-[var(--muted)]">Energy Charge</span>
                <div className="font-bold text-[var(--lilac)] font-mono">Rs {tariff?.energy_charge}/{tariff?.energy_charge_unit}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--line)]/30">
                <span className="text-[10px] text-[var(--muted)]">Demand Charge</span>
                <div className="font-bold text-white font-mono">Rs {tariff?.demand_charge}/{tariff?.demand_charge_unit}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--line)]/30">
                <span className="text-[10px] text-[var(--muted)]">Electricity Duty</span>
                <div className="font-bold text-[var(--lilac)] font-mono">{tariff?.electricity_duty}%</div>
              </div>
            </div>
          </div>

          {/* 2. Open Access Surcharges & Loss Multipliers */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--lilac)] border-b border-[var(--line)]/30 pb-1">
              2. Open Access Surcharges & Technical Losses ({voltageLevel})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--line)]/30">
                <span className="text-[10px] text-[var(--muted)]">Wheeling Charge</span>
                <div className="font-bold text-white font-mono">Rs {profile.oa_charges_breakdown?.[0]?.wheeling_charge}/kWh</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--line)]/30">
                <span className="text-[10px] text-[var(--muted)]">Cross Subsidy (CSS)</span>
                <div className="font-bold text-[var(--lilac)] font-mono">Rs {profile.oa_charges_breakdown?.[0]?.css}/kWh</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--line)]/30">
                <span className="text-[10px] text-[var(--muted)]">Additional Surcharge (AS)</span>
                <div className="font-bold text-[var(--lilac)] font-mono">Rs {profile.oa_charges_breakdown?.[0]?.additional_surcharge}/kWh</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--line)]/30">
                <span className="text-[10px] text-[var(--muted)]">Total Technical Loss</span>
                <div className="font-bold text-[var(--lilac)] font-mono">{losses?.total_technical_loss_pct}%</div>
              </div>
            </div>
          </div>

          {/* 3. RE Banking & Captive 26/51 Framework */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--lilac)] border-b border-[var(--line)]/30 pb-1">
              3. Renewable Energy Banking & Captive Compliance Framework
            </h4>
            <div className="p-4 rounded-2xl bg-[var(--surface-1)] border border-[var(--line)]/30 space-y-2">
              <p><strong>Banking Horizon:</strong> {banking?.banking_period} with {banking?.banking_charge_pct}% in-kind energy deduction.</p>
              <p><strong>TOD Cross-Netting:</strong> {banking?.tod_restrictions}</p>
              <p><strong>Captive Ownership (26/51):</strong> {captive?.ownership_requirement}</p>
              <p><strong>CSS Exemption Proof:</strong> {captive?.css_treatment}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
