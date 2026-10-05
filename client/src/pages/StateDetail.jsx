import React, { useState, useEffect } from 'react';
import { MapPin, Building2, ExternalLink, ArrowLeft, FileText, CheckCircle2, ShieldAlert, Sparkles, Layers, Printer } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function StateDetail({ stateId, onBack, onSelectDiscom, onQueryState }) {
  const [state, setState] = useState(null);
  const [discoms, setDiscoms] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPDF = async () => {
    if (!state) return;
    setIsExportingPdf(true);
    try {
      await exportElementToPDF({
        elementId: 'state-detail-report-area',
        fileName: `NewRa_State_Brief_${state.state_code || state.name}.pdf`,
        reportTitle: `${state.name} State Regulatory Commission Profile`,
        entityName: `${state.regulator_name} (${state.regulator_code}) | STU: ${state.stu_code}`
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  useEffect(() => {
    async function loadDetail() {
      if (!stateId) return;
      try {
        setLoading(true);
        const [stRes, discRes, docRes] = await Promise.all([
          api.getStateById(stateId),
          api.getDiscoms({ state_id: stateId }),
          api.getDocuments({ state_id: stateId })
        ]);
        setState(stRes);
        setDiscoms(discRes.discoms || []);
        setDocuments(docRes.documents || []);
      } catch (err) {
        console.error('Failed to load state details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [stateId]);

  if (loading || !state) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-300">Loading State Regulatory Commission Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Back button and title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to State Directory</span>
        </button>
      </div>

      {/* Report Area Wrapper */}
      <div id="state-detail-report-area" className="space-y-6">
        {/* State Hero Profile */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-2xl text-cyan-400">
                {state.state_code}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white">{state.name}</h1>
                  <StatusBadge status={state.status} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Electricity Regulator: <span className="text-cyan-300 font-semibold">{state.regulator_name} ({state.regulator_code})</span> | Region: <span className="text-slate-300">{state.region}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                disabled={isExportingPdf}
                className="px-3.5 py-2 rounded-lg bg-[#2D50A1]/30 hover:bg-[#2D50A1]/50 border border-[#2D50A1] text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                title="Export State Profile as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-[#28B8B4]" />
                <span>{isExportingPdf ? 'Exporting...' : 'Export State Brief (PDF)'}</span>
              </button>
              <a
                href={state.regulator_website}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <span>Regulator Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => onQueryState(state.id)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Query Tariffs for {state.name}</span>
              </button>
            </div>
          </div>

        {/* State Transmission & System Operator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">State Transmission Utility (STU)</span>
            <h4 className="text-sm font-bold text-white">{state.stu_code}</h4>
            <p className="text-xs text-slate-400">{state.stu_name}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">State Load Despatch Centre (SLDC)</span>
            <h4 className="text-sm font-bold text-cyan-400">{state.sldc_code}</h4>
            <p className="text-xs text-slate-400">{state.sldc_name}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Open Access Framework</span>
            <h4 className="text-sm font-bold text-emerald-400">{state.oa_framework}</h4>
            <p className="text-xs text-slate-400">Green OA: 100 kW | Conventional: 1 MW</p>
          </div>
        </div>
      </div>

      {/* DISCOMs in this State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Distribution Companies ({discoms.length} Active DISCOMs)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {discoms.map((disc) => (
            <div
              key={disc.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                      {disc.ownership}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{disc.name}</h3>
                    <p className="text-xs text-slate-400">{disc.service_territory}</p>
                  </div>
                  <StatusBadge status={disc.status} />
                </div>

                <div className="text-xs text-slate-400 space-y-1 pt-1">
                  <div>HQ: <span className="text-slate-300 font-medium">{disc.headquarters}</span></div>
                  <div>Consumers: <span className="text-slate-300 font-medium">{disc.consumer_count}</span></div>
                  <div>Latest Tariff Order: <span className="text-cyan-400 font-medium">{disc.tariff_order_ref}</span></div>
                </div>
              </div>

              <button
                onClick={() => onSelectDiscom(disc.id)}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>View DISCOM Tariffs</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Official Regulatory Orders & Source Citations for State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Official Regulatory Orders ({documents.length} Published Orders)</span>
          </h2>
        </div>

        <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-900/40 transition">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-400">
                    {doc.document_category}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">{doc.title}</h4>
                </div>
                <p className="text-xs text-slate-400">{doc.summary}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>Doc No: {doc.document_number}</span>
                  <span>Effective: {doc.effective_date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={doc.verification_badge} />
                <a
                  href={doc.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Open Official Citation Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

