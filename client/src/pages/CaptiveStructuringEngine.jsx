import React, { useState, useEffect } from 'react';
import {
  Scale,
  Users,
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Download,
  Printer,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { downloadCSV } from '../utils/exportUtils';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function CaptiveStructuringEngine() {
  const [plantCapacityMw, setPlantCapacityMw] = useState(10);
  const [annualGenMu, setAnnualGenMu] = useState(17.5);
  const [captiveUsers, setCaptiveUsers] = useState([
    { id: 1, name: 'Lead Anchor (Steel Plant)', equity_share_pct: 18.0, annual_consumption_mu: 12.0 },
    { id: 2, name: 'Co-Captive User 2 (Textiles)', equity_share_pct: 8.0, annual_consumption_mu: 5.3 }
  ]);

  const [structuringResult, setStructuringResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Recalculate default generation when MW changes
  const handleMwChange = (val) => {
    const mw = Math.max(0.1, Number(val) || 10);
    setPlantCapacityMw(mw);
    setAnnualGenMu(Number((mw * 1.75).toFixed(2)));
  };

  const handleAddUser = () => {
    const newId = captiveUsers.length + 1;
    setCaptiveUsers([
      ...captiveUsers,
      { id: newId, name: `Captive User ${newId}`, equity_share_pct: 3.0, annual_consumption_mu: 2.0 }
    ]);
  };

  const handleRemoveUser = (id) => {
    if (captiveUsers.length <= 1) return;
    setCaptiveUsers(captiveUsers.filter(u => u.id !== id));
  };

  const handleUserChange = (id, field, value) => {
    setCaptiveUsers(captiveUsers.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  // Run structuring calculation
  useEffect(() => {
    async function runStructuring() {
      setLoading(true);
      try {
        const res = await api.structureCaptiveEquity({
          plant_capacity_mw: plantCapacityMw,
          annual_generation_mu: annualGenMu,
          captive_users: captiveUsers.map(u => ({
            name: u.name,
            equity_share_pct: Number(u.equity_share_pct) || 0,
            annual_consumption_mu: Number(u.annual_consumption_mu) || 0
          }))
        });
        setStructuringResult(res);
      } catch (err) {
        console.error('Failed to structure captive equity:', err);
      } finally {
        setLoading(false);
      }
    }
    runStructuring();
  }, [plantCapacityMw, annualGenMu, captiveUsers]);

  const handleExportCSV = () => {
    if (!structuringResult) return;
    const rows = [
      ['NEWRA ATLAS - CAPTIVE 26/51 & RULE 3(1) PROPORTIONALITY AUDIT SCHEDULE'],
      ['Plant Capacity (MW)', structuringResult.plant_parameters.plant_capacity_mw],
      ['Total Annual Generation (MU)', structuringResult.plant_parameters.annual_generation_mu],
      ['Total Captive Equity Holding (%)', `${structuringResult.spv_equity_structure.total_captive_equity_holding_pct}%`],
      ['Developer Holding (%)', `${structuringResult.spv_equity_structure.developer_holding_pct}%`],
      ['Total Captive Consumption Scheduled (MU)', structuringResult.plant_parameters.total_captive_consumption_scheduled_mu],
      ['Captive Consumption Ratio (%)', `${structuringResult.plant_parameters.consumption_compliance_ratio_pct}%`],
      ['Statutory Verdict', structuringResult.compliance_verdict.status],
      ['Governing Statute', `"${structuringResult.governing_statute}"`],
      [],
      ['SHAREHOLDER PROPORTIONALITY AUDIT (RULE 3(1)(a)(i) PROVISO - MAX +/- 10% VARIATION)'],
      [
        'Captive Shareholder',
        'SPV Equity (%)',
        'Equity Share of Captive Pool (%)',
        'Scheduled Draw (MU/yr)',
        'Share of Captive Offtake (%)',
        'Deviation from Proportionality (%)',
        'Legal Status'
      ]
    ];

    structuringResult.spv_equity_structure.user_equity_breakdown.forEach(u => {
      rows.push([
        u.name,
        `${u.equity_share_spv_pct}%`,
        `${u.equity_share_of_captive_pool_pct}%`,
        u.annual_consumption_mu,
        `${u.consumption_share_of_captive_pct}%`,
        `${u.proportionality_deviation_pct}%`,
        u.compliance_status
      ]);
    });

    const csvContent = rows.map(r => r.join(',')).join('\n');
    downloadCSV(csvContent, `Captive_Proportionality_Audit_${plantCapacityMw}MW_${Date.now()}.csv`);
  };

  const handleExportPDF = async () => {
    if (!structuringResult) return;
    setIsExportingPdf(true);
    await exportElementToPDF({
      elementId: 'captive-structuring-report-area',
      fileName: `NewRa_Captive_Proportionality_${plantCapacityMw}MW`,
      reportTitle: `Captive Rule 3 Proportionality Compliance Audit - ${plantCapacityMw} MW SPV`,
      entityName: 'SPV Structuring'
    });
    setIsExportingPdf(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#09193C] via-[#0B1B3D] to-[#07122A] border border-[#2D50A1]/40 shadow-xl print:hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#F79050]/20 border border-[#F79050]/40 text-[#F79050]">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F79050]/20 text-[#F79050] border border-[#F79050]/30 rounded">
                Stage 2: Contracted Engine
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Captive 26/51 & Rule 3(1) Proportionality Engine</h1>
            </div>
            <p className="text-xs text-[#C6CBD9]/80 mt-1">
              Validates 26% voting equity, 51% generation consumption, and Supreme Court mandated ±10% individual shareholder proportionality under Rule 3 of Electricity Rules 2005.
            </p>
          </div>
        </div>

        {structuringResult && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#07122A] border border-[#2D50A1]/60 text-[#C6CBD9] hover:text-white hover:border-[#28B8B4] transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#28B8B4]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F79050] text-[#09193C] hover:bg-[#FBBF24] transition flex items-center gap-1.5 shadow-md shadow-[#F79050]/20 disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Exporting PDF...' : 'Export Legal Audit PDF'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid: Plant & Users Form vs Legal Structuring Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#09193C] border border-[#2D50A1]/40 space-y-4 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F79050] flex items-center gap-2 border-b border-[#2D50A1]/30 pb-2">
              <Building2 className="w-4 h-4" /> 1. Power Plant & Generation
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#C6CBD9] block mb-1">Plant Capacity (MW)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={plantCapacityMw}
                  onChange={(e) => handleMwChange(e.target.value)}
                  className="w-full bg-[#07122A] border border-[#2D50A1]/50 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#F79050]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#C6CBD9] block mb-1">Annual Generation (MU)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={annualGenMu}
                  onChange={(e) => setAnnualGenMu(Math.max(0.1, Number(e.target.value)))}
                  className="w-full bg-[#07122A] border border-[#2D50A1]/50 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#28B8B4] focus:outline-none focus:border-[#F79050]"
                />
              </div>
            </div>

            {/* Captive Users Allocation List */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#28B8B4]" /> Captive Shareholders ({captiveUsers.length})
                </span>
                <button
                  onClick={handleAddUser}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#28B8B4]/20 text-[#28B8B4] hover:bg-[#28B8B4]/30 border border-[#28B8B4]/30 flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" /> Add Shareholder
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {captiveUsers.map((user) => (
                  <div key={user.id} className="p-3 rounded-xl bg-[#07122A] border border-[#2D50A1]/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={user.name}
                        onChange={(e) => handleUserChange(user.id, 'name', e.target.value)}
                        className="flex-1 bg-transparent border-none text-white font-medium focus:outline-none text-xs"
                      />
                      {captiveUsers.length > 1 && (
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="p-1 rounded text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#2D50A1]/20">
                      <div>
                        <label className="text-[10px] text-[#C6CBD9]/70 block mb-0.5">Voting Equity (%)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={user.equity_share_pct}
                            onChange={(e) => handleUserChange(user.id, 'equity_share_pct', Number(e.target.value))}
                            className="w-full bg-[#09193C] border border-[#2D50A1]/50 rounded-lg px-2 py-1 text-xs font-mono font-bold text-[#28B8B4]"
                          />
                          <span className="text-[10px] text-[#C6CBD9]/50 font-mono">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#C6CBD9]/70 block mb-0.5">Draw (MU/yr)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={user.annual_consumption_mu}
                            onChange={(e) => handleUserChange(user.id, 'annual_consumption_mu', Number(e.target.value))}
                            className="w-full bg-[#09193C] border border-[#2D50A1]/50 rounded-lg px-2 py-1 text-xs font-mono font-bold text-[#F79050]"
                          />
                          <span className="text-[10px] text-[#C6CBD9]/50 font-mono">MU</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Notice Box */}
            <div className="p-3 rounded-xl bg-[#07122A]/80 border border-[#2D50A1]/30 text-[11px] text-[#C6CBD9]/80 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#28B8B4] shrink-0 mt-0.5" />
              <span>
                <strong>Rule 3 Proviso Mandate:</strong> In group captive SPVs, each captive user's consumption must be proportional to their equity holding within a strict <strong>±10% tolerance</strong>. Deviation beyond 10% can trigger retroactive third-party Open Access surcharges.
              </span>
            </div>
          </div>
        </div>

        {/* Right Output: Legal Structuring Allocation Matrix (7 Cols) */}
        <div id="captive-structuring-report-area" className="lg:col-span-7 space-y-4">
          {structuringResult && (
            <>
              {/* Compliance Status Card */}
              <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 shadow-xl ${
                structuringResult.compliance_verdict.status === 'FULLY_COMPLIANT'
                  ? 'bg-green-500/10 border-green-500/40'
                  : 'bg-red-500/10 border-red-500/40'
              }`}>
                <div className="flex items-center gap-3">
                  {structuringResult.compliance_verdict.status === 'FULLY_COMPLIANT' ? (
                    <ShieldCheck className="w-8 h-8 text-green-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {structuringResult.compliance_verdict.status === 'FULLY_COMPLIANT'
                        ? 'Captive Rule 3 Legally Compliant (100% CSS & AS Exempt)'
                        : 'Captive Compliance Deficit Detected'}
                    </h3>
                    <p className="text-xs text-[#C6CBD9]/80 mt-0.5">
                      {structuringResult.compliance_verdict.action_note}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-[#C6CBD9]/60 block uppercase">Verdict</span>
                  <span className={`text-sm font-mono font-bold ${
                    structuringResult.compliance_verdict.status === 'FULLY_COMPLIANT' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {structuringResult.compliance_verdict.status === 'FULLY_COMPLIANT' ? '✓ CERTIFIED' : '✗ DEFICIT'}
                  </span>
                </div>
              </div>

              {/* KPI Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#09193C] border border-[#2D50A1]/40">
                  <span className="text-[10px] font-mono text-[#C6CBD9]/60 uppercase block">Captive Equity (≥26%)</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className={`text-lg font-mono font-bold ${
                      structuringResult.spv_equity_structure.is_equity_compliant ? 'text-[#28B8B4]' : 'text-rose-400'
                    }`}>
                      {structuringResult.spv_equity_structure.total_captive_equity_holding_pct}%
                    </span>
                    <span className="text-[10px] font-mono text-[#C6CBD9]/50">Developer: {structuringResult.spv_equity_structure.developer_holding_pct}%</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#09193C] border border-[#2D50A1]/40">
                  <span className="text-[10px] font-mono text-[#C6CBD9]/60 uppercase block">Consumption (≥51%)</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className={`text-lg font-mono font-bold ${
                      structuringResult.plant_parameters.is_consumption_compliant ? 'text-[#F79050]' : 'text-rose-400'
                    }`}>
                      {structuringResult.plant_parameters.consumption_compliance_ratio_pct}%
                    </span>
                    <span className="text-[10px] font-mono text-[#C6CBD9]/50">Min: {structuringResult.plant_parameters.min_captive_consumption_required_mu} MU</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#09193C] border border-[#2D50A1]/40">
                  <span className="text-[10px] font-mono text-[#C6CBD9]/60 uppercase block">Proportionality (±10%)</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className={`text-lg font-mono font-bold ${
                      structuringResult.compliance_verdict.is_proportionality_compliant ? 'text-green-400' : 'text-rose-400'
                    }`}>
                      {structuringResult.compliance_verdict.is_proportionality_compliant ? 'PASS' : 'VIOLATION'}
                    </span>
                    <span className="text-[10px] font-mono text-[#C6CBD9]/50">Rule 3(1)(a)(i)</span>
                  </div>
                </div>
              </div>

              {/* Shareholder Proportionality Matrix Table */}
              <div className="p-5 rounded-2xl bg-[#09193C] border border-[#2D50A1]/40 space-y-4 shadow-lg overflow-hidden">
                <div className="flex justify-between items-center pb-2 border-b border-[#2D50A1]/30">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#28B8B4]">
                    Captive Shareholder Proportionality Matrix (Rule 3(1)(a)(i))
                  </h3>
                  <span className="text-[11px] font-mono text-[#C6CBD9]/60">
                    Permissible Variation: ±10% Max
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono min-w-[620px]">
                    <thead>
                      <tr className="border-b border-[#2D50A1]/40 text-[#C6CBD9]/60 uppercase text-[10px]">
                        <th className="py-2.5 px-3">Shareholder</th>
                        <th className="py-2.5 px-3">SPV Equity</th>
                        <th className="py-2.5 px-3">Equity Pool %</th>
                        <th className="py-2.5 px-3">Draw (MU/yr)</th>
                        <th className="py-2.5 px-3">Offtake Pool %</th>
                        <th className="py-2.5 px-3">Deviation</th>
                        <th className="py-2.5 px-3 text-right">Legal Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D50A1]/20">
                      {structuringResult.spv_equity_structure.user_equity_breakdown.map((u, idx) => (
                        <tr key={idx} className="hover:bg-[#0B1B3D]/50 transition">
                          <td className="py-2.5 px-3 font-bold text-white font-sans">{u.name}</td>
                          <td className="py-2.5 px-3 text-[#28B8B4] font-bold">{u.equity_share_spv_pct}%</td>
                          <td className="py-2.5 px-3 text-[#C6CBD9]">{u.equity_share_of_captive_pool_pct}%</td>
                          <td className="py-2.5 px-3 text-[#F79050] font-bold">{u.annual_consumption_mu} MU</td>
                          <td className="py-2.5 px-3 text-[#C6CBD9]">{u.consumption_share_of_captive_pct}%</td>
                          <td className="py-2.5 px-3 font-bold text-amber-300">
                            {u.proportionality_deviation_pct}%
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.is_proportional_compliant ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              {u.is_proportional_compliant ? 'Compliant (≤10%)' : 'Violation (>10%)'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-[#07122A] font-bold border-t border-[#2D50A1]/40">
                        <td className="py-3 px-3 text-white font-sans">Total Captive Block</td>
                        <td className="py-3 px-3 text-[#28B8B4]">{structuringResult.spv_equity_structure.total_captive_equity_holding_pct}%</td>
                        <td className="py-3 px-3 text-white">100.0%</td>
                        <td className="py-3 px-3 text-[#F79050]">{structuringResult.plant_parameters.total_captive_consumption_scheduled_mu} MU</td>
                        <td className="py-3 px-3 text-white">100.0%</td>
                        <td className="py-3 px-3 text-[#C6CBD9]/50">-</td>
                        <td className="py-3 px-3 text-right text-green-400">
                          {structuringResult.compliance_verdict.is_proportionality_compliant ? 'All Users Pass' : 'Tolerance Exceeded'}
                        </td>
                      </tr>
                      <tr className="bg-[#07122A]/50">
                        <td className="py-2.5 px-3 text-[#C6CBD9]/70 font-sans" colSpan={4}>Developer Equity (Exempt from consumption test)</td>
                        <td className="py-2.5 px-3 text-[#C6CBD9]/50">-</td>
                        <td className="py-2.5 px-3 text-[#C6CBD9]/50">-</td>
                        <td className="py-2.5 px-3 text-right text-[#C6CBD9] font-bold">{structuringResult.spv_equity_structure.developer_holding_pct}%</td>
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