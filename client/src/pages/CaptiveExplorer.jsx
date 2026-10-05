import React, { useState, useEffect } from 'react';
import { Factory, ShieldCheck, FileCheck, CheckCircle2, AlertCircle, Download, Printer } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function CaptiveExplorer() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [captive, setCaptive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPDF = async () => {
    if (!captive) return;
    setIsExportingPdf(true);
    try {
      await exportElementToPDF({
        elementId: 'captive-explorer-report-area',
        fileName: `NewRa_Captive_Framework_${selectedState}.pdf`,
        reportTitle: 'Captive & Group Captive Power Framework (Rule 3)',
        entityName: `${selectedState.toUpperCase()} - 26% Equity & 51% Proportional Consumption Guidelines`
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
    async function loadCaptive() {
      if (!selectedState) return;
      try {
        setLoading(true);
        const data = await api.getCaptive(selectedState);
        setCaptive(data);
      } catch (err) {
        console.error('Failed to load captive rules:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCaptive();
  }, [selectedState]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <Factory className="w-4 h-4" />
            <span>Statutory Compliance Matrix</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Captive & Group Captive Power Framework
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Electricity Act 2003 Rule 3 compliance guidelines: 26% equity ownership, 51% annual consumption proportionality, and statutory Cross Subsidy Surcharge (CSS) exemptions.
          </p>
        </div>

        {/* Actions & Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf || loading || !captive}
            className="px-3.5 py-2 bg-[#2D50A1]/30 hover:bg-[#2D50A1]/50 border border-[#2D50A1] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-md"
            title="Download Captive Rule 3 Framework as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#28B8B4]" />
            <span>{isExportingPdf ? 'Exporting...' : 'Export Captive Memo (PDF)'}</span>
          </button>

          {/* State Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Select State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-semibold"
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

      {loading || !captive ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading captive framework...</div>
      ) : (
        <div id="captive-explorer-report-area" className="space-y-6">
          {/* Dual Rule Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 26% Equity */}
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-emerald-900/60 text-emerald-400 text-xs font-bold uppercase">
                  Ownership Test (Rule 3.1.a)
                </span>
                <span className="text-2xl font-extrabold font-mono text-emerald-400">â‰¥ 26%</span>
              </div>
              <h3 className="text-base font-bold text-white">Equity Share Capital & Voting Rights</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {captive.ownership_requirement}
              </p>
            </div>

            {/* 51% Consumption */}
            <div className="p-6 rounded-2xl bg-cyan-950/20 border border-cyan-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-cyan-900/60 text-cyan-400 text-xs font-bold uppercase">
                  Consumption Test (Rule 3.1.b)
                </span>
                <span className="text-2xl font-extrabold font-mono text-cyan-400">â‰¥ 51%</span>
              </div>
              <h3 className="text-base font-bold text-white">Annual Proportional Energy Drawal</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {captive.consumption_requirement}
              </p>
            </div>
          </div>

          {/* Group Captive Proportionality & Verification */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Group Captive Verification & Proportionality Formula</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {captive.group_captive_proportionality}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500">CSS & AS Exemption Status</span>
                <h4 className="text-sm font-bold text-emerald-400">100% Exempted</h4>
                <p className="text-xs text-slate-400">Captive generators and consumers are fully exempt from Cross Subsidy Surcharge and Additional Surcharge.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500">Annual Audit Deadline</span>
                <h4 className="text-sm font-bold text-white">Within 60 Days of FY Close (May 31)</h4>
                <p className="text-xs text-slate-400">Chartered Accountant certificate and DISCOM verification required annually.</p>
              </div>
            </div>
          </div>

          {/* Mandatory Verification Checklist */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-400" />
              <span>Mandatory Documentation Checklist for Annual Audit</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {captive.required_documents?.map((doc, dIdx) => (
                <div key={dIdx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

