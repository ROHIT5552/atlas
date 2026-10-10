import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Building2,
  DollarSign,
  Printer,
  Download,
  Sparkles,
  TrendingDown,
  Layers,
  Scale
} from 'lucide-react';
import { api } from '../services/api';
import { downloadCSV } from '../utils/exportUtils';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function BillAuditEngine() {
  const [states, setStates] = useState([]);
  const [discoms, setDiscoms] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [selectedDiscom, setSelectedDiscom] = useState('msedcl');
  const [contractDemandKva, setContractDemandKva] = useState(2000);
  const [recordedMdKva, setRecordedMdKva] = useState(1850);
  const [billedUnitsKwh, setBilledUnitsKwh] = useState(850000);
  const [pf, setPf] = useState(0.92);
  const [billedTotalInr, setBilledTotalInr] = useState(8250000);
  const [facOverride, setFacOverride] = useState('');

  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

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

  useEffect(() => {
    async function runAudit() {
      setLoading(true);
      try {
        const res = await api.auditDiscomBill({
          discom_id: selectedDiscom,
          contract_demand_kva: contractDemandKva,
          recorded_md_kva: recordedMdKva,
          billed_units_kwh: billedUnitsKwh,
          pf,
          fac_rate: facOverride ? Number(facOverride) : undefined,
          billed_amount_inr: billedTotalInr
        });
        setAuditResult(res);
      } catch (err) {
        console.error('Failed to audit bill:', err);
      } finally {
        setLoading(false);
      }
    }
    runAudit();
  }, [selectedDiscom, contractDemandKva, recordedMdKva, billedUnitsKwh, pf, billedTotalInr, facOverride]);

  const handleExportCSV = () => {
    if (!auditResult) return;
    const rows = [
      ['NEWRA ATLAS - STATUTORY DISCOM BILL AUDIT REPORT'],
      ['DISCOM', auditResult.discom],
      ['Consumer Category', auditResult.consumer_category],
      ['Financial Year', auditResult.financial_year],
      ['Tariff Order Citation', `"${auditResult.governing_tariff_order}"`],
      [],
      ['BILL PARAMETERS'],
      ['Contract Demand (kVA)', auditResult.bill_parameters.contract_demand_kva],
      ['Recorded Max Demand (kVA)', auditResult.bill_parameters.recorded_max_demand_kva],
      ['Statutory Billing Demand (kVA)', auditResult.bill_parameters.statutory_billing_demand_kva],
      ['Billing Demand Rule', `"${auditResult.bill_parameters.billing_demand_rule}"`],
      ['Billed Units (kWh)', auditResult.bill_parameters.billed_units_kwh],
      ['Recorded Power Factor', auditResult.bill_parameters.power_factor],
      [],
      ['AUDIT SUMMARY'],
      ['DISCOM Invoiced Total (INR)', auditResult.audit_summary.discom_billed_total_inr],
      ['Statutory Mandated Total (INR)', auditResult.audit_summary.statutory_mandated_total_inr],
      ['Discrepancy (INR)', auditResult.audit_summary.discrepancy_amount_inr],
      ['Discrepancy (%)', `${auditResult.audit_summary.discrepancy_pct}%`],
      ['Audit Verdict', auditResult.audit_summary.verdict],
      ['Potential Annual Claim (INR)', auditResult.audit_summary.potential_annual_claim_inr],
      [],
      ['LINE ITEM BREAKDOWN'],
      ['Line Item', 'Statutory Rate Formula', 'Statutory Mandated Amount (INR)', 'Status']
    ];

    auditResult.line_item_audit.forEach(item => {
      rows.push([item.item, `"${item.statutory_rate}"`, item.statutory_amount_inr, item.status]);
    });

    const csvContent = rows.map(r => r.join(',')).join('\n');
    downloadCSV(csvContent, `Bill_Audit_${auditResult.discom_code}_${Date.now()}.csv`);
  };

  const handleExportPDF = async () => {
    if (!auditResult) return;
    setIsExportingPdf(true);
    await exportElementToPDF({
      elementId: 'bill-audit-report-area',
      fileName: `NewRa_Bill_Audit_${auditResult.discom_code}_${auditResult.financial_year}`,
      reportTitle: `Statutory DISCOM Bill Audit Report - ${auditResult.discom}`,
      entityName: auditResult.discom
    });
    setIsExportingPdf(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[var(--surface-1)] via-[var(--surface-1)] to-[var(--bg)] border border-[var(--line)]/40 shadow-xl print:hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[var(--violet)]/20 border border-[var(--line)]/40 text-[var(--lilac)]">
            <FileCheck2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--violet)]/20 text-[var(--lilac)] border border-[var(--line)]/30 rounded">
                Stage 6: Billed Engine
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Statutory DISCOM Bill Audit & Overbilling Engine</h1>
            </div>
            <p className="text-xs text-[var(--muted)]/80 mt-1">
              Reconciles raw electricity bills against gazetted SERC tariff orders to detect utility overbilling, miscalculated demand charges, and wrong PF penalties.
            </p>
          </div>
        </div>

        {auditResult && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--bg)] border border-[var(--line)]/60 text-[var(--muted)] hover:text-white hover:border-[var(--line)] transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[var(--lilac)]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--violet)] text-[var(--text)] hover:bg-[var(--surface-2)] transition flex items-center gap-1.5 shadow-md shadow-[#28B8B4]/20 disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Exporting PDF...' : 'Export Audit PDF'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid: Inputs vs Audit Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--line)]/40 space-y-4 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lilac)] flex items-center gap-2 border-b border-[var(--line)]/30 pb-2">
              <Building2 className="w-4 h-4" /> Billed Invoice Parameters
            </h2>

            {/* State */}
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

            {/* DISCOM */}
            <div>
              <label className="text-[11px] font-bold text-[var(--muted)] block mb-1">Billing Utility DISCOM</label>
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

            {/* Contract Demand vs Recorded MD */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[var(--muted)] block mb-1">Contract Demand (kVA)</label>
                <input
                  type="number"
                  value={contractDemandKva}
                  onChange={(e) => setContractDemandKva(Number(e.target.value))}
                  className="w-full bg-[var(--bg)] border border-[var(--line)]/50 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[var(--line)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[var(--muted)] block mb-1">Recorded MD (kVA)</label>
                <input
                  type="number"
                  value={recordedMdKva}
                  onChange={(e) => setRecordedMdKva(Number(e.target.value))}
                  className="w-full bg-[var(--bg)] border border-[var(--line)]/50 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[var(--lilac)] focus:outline-none focus:border-[var(--line)]"
                />
              </div>
            </div>

            {/* Billed Units */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-[var(--muted)]">Total Energy Consumed (kWh)</label>
                <span className="text-xs font-mono font-bold text-[var(--lilac)]">{billedUnitsKwh.toLocaleString()} units</span>
              </div>
              <input
                type="number"
                value={billedUnitsKwh}
                onChange={(e) => setBilledUnitsKwh(Number(e.target.value))}
                className="w-full bg-[var(--bg)] border border-[var(--line)]/50 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[var(--line)]"
              />
            </div>

            {/* Power Factor */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-[var(--muted)]">Recorded Power Factor</label>
                <span className={`text-xs font-mono font-bold ${pf >= 0.95 ? 'text-green-400' : pf < 0.90 ? 'text-red-400' : 'text-white'}`}>
                  PF {pf}
                </span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.00"
                step="0.01"
                value={pf}
                onChange={(e) => setPf(Number(e.target.value))}
                className="w-full accent-[#28B8B4] bg-[var(--bg)] h-1.5 rounded-lg"
              />
            </div>

            {/* Invoiced Total Amount */}
            <div>
              <label className="text-[11px] font-bold text-[var(--muted)] block mb-1">DISCOM Billed Total Amount (₹)</label>
              <input
                type="number"
                value={billedTotalInr}
                onChange={(e) => setBilledTotalInr(Number(e.target.value))}
                className="w-full bg-[var(--bg)] border border-[var(--line)]/50 rounded-xl px-3 py-2 text-sm font-mono font-bold text-[var(--lilac)] focus:outline-none focus:border-[var(--line)]"
              />
            </div>
          </div>
        </div>

        {/* Right Audit Comparison & Verification (8 Cols) */}
        <div id="bill-audit-report-area" className="lg:col-span-8 space-y-4">
          {auditResult && (
            <>
              {/* Verdict Card */}
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${
                auditResult.audit_summary.verdict === 'OVERBILLED_BY_DISCOM'
                  ? 'bg-red-500/10 border-red-500/50'
                  : 'bg-green-500/10 border-green-500/50'
              }`}>
                <div className="flex items-center gap-4">
                  {auditResult.audit_summary.verdict === 'OVERBILLED_BY_DISCOM' ? (
                    <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                      Audit Discrepancy Found
                    </span>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {auditResult.audit_summary.verdict === 'OVERBILLED_BY_DISCOM'
                        ? 'DISCOM Overbilling Detected: ₹' + auditResult.audit_summary.discrepancy_amount_inr.toLocaleString() + ' Excess'
                        : 'Bill Verified Statutorily Accurate'}
                    </h2>
                    <p className="text-xs text-[var(--muted)]/80 mt-0.5">
                      Statutory Order: {auditResult.governing_tariff_order}
                    </p>
                  </div>
                </div>

                {auditResult.audit_summary.potential_annual_claim_inr > 0 && (
                  <div className="text-right shrink-0 p-3 rounded-xl bg-[var(--bg)] border border-red-500/40">
                    <span className="text-[10px] uppercase font-mono text-[var(--muted)]/60 block">Annual Refund Claim</span>
                    <span className="text-base font-mono font-bold text-red-400">
                      ₹{(auditResult.audit_summary.potential_annual_claim_inr / 100000).toFixed(2)} Lakhs/yr
                    </span>
                  </div>
                )}
              </div>

              {/* Line-by-Line Statutory Audit Breakdown */}
              <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--line)]/40 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[var(--line)]/30">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--lilac)]">
                    Line-by-Line Statutory Bill Reconciliation
                  </h3>
                  <span className="text-[11px] font-mono text-[var(--muted)]/60">
                    Billing Demand: {auditResult.bill_parameters.statutory_billing_demand_kva} kVA
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[var(--line)]/40 text-[var(--muted)]/60 uppercase text-[10px]">
                        <th className="py-2.5 px-3">Tariff Component</th>
                        <th className="py-2.5 px-3">Statutory Formula / Slab</th>
                        <th className="py-2.5 px-3 text-right">Statutory Amount (₹)</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D50A1]/20">
                      {auditResult.line_item_audit.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[var(--surface-1)]/50 transition">
                          <td className="py-2.5 px-3 font-bold text-white font-sans">{item.item}</td>
                          <td className="py-2.5 px-3 text-[var(--muted)]/80 text-[11px]">{item.statutory_rate}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-white">
                            {item.statutory_amount_inr < 0 ? '-' : ''}₹{Math.abs(item.statutory_amount_inr).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--violet)]/15 text-[var(--lilac)] border border-[var(--line)]/30 font-sans">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-[var(--bg)] font-bold">
                        <td className="py-3 px-3 text-white font-sans" colSpan={2}>Statutory Mandated Total (Payable by Law)</td>
                        <td className="py-3 px-3 text-right text-[var(--lilac)] text-sm">
                          ₹{auditResult.audit_summary.statutory_mandated_total_inr.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center text-[10px] text-green-400 font-sans">CORRECT BASE</td>
                      </tr>
                      <tr className="bg-[var(--bg)]/60">
                        <td className="py-2.5 px-3 text-[var(--muted)]/80 font-sans" colSpan={2}>Actual Invoiced by DISCOM</td>
                        <td className="py-2.5 px-3 text-right text-white">
                          ₹{auditResult.audit_summary.discom_billed_total_inr.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center text-[10px] text-[var(--lilac)] font-sans">INVOICED</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}