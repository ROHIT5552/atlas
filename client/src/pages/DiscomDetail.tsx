import React, { useState, useEffect } from 'react';
import { Building2, ArrowLeft, Receipt, Clock, ExternalLink, Sparkles, Layers, ShieldCheck, MapPin, Printer } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import TodTimeline from '../components/TodTimeline';
import { exportElementToPDF } from '../utils/pdfExportUtils';
import { cleanUnit } from '../utils/formatUtils';

export default function DiscomDetail({ discomId, onBack, onQueryProfile }) {
  const [discom, setDiscom] = useState(null);
  const [tariffs, setTariffs] = useState([]);
  const [todProfile, setTodProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPDF = async () => {
    if (!discom) return;
    setIsExportingPdf(true);
    try {
      await exportElementToPDF({
        elementId: 'discom-detail-report-area',
        fileName: `NewRa_DISCOM_Brief_${discom.code || discom.name}.pdf`,
        reportTitle: `${discom.name} Utility Tariff & TOD Profile`,
        entityName: `${discom.code} | State: ${discom.state?.name || discom.state_id} | Order: ${discom.tariff_order_ref}`
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  useEffect(() => {
    async function loadDiscom() {
      if (!discomId) return;
      try {
        setLoading(true);
        const [dRes, tRes, todRes] = await Promise.all([
          api.getDiscomById(discomId),
          api.getTariffs({ discom_id: discomId, financial_year: 'FY 2025-26' }),
          api.getTodProfiles({ discom_id: discomId })
        ]);
        setDiscom(dRes);
        setTariffs(tRes.tariffs || []);
        setTodProfile(todRes.profiles?.[0] || null);
      } catch (err) {
        console.error('Failed to load DISCOM details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDiscom();
  }, [discomId]);

  if (loading || !discom) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-300">Loading DISCOM Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to DISCOM Directory</span>
        </button>
      </div>

      {/* Report Area Wrapper */}
      <div id="discom-detail-report-area" className="space-y-6">
        {/* DISCOM Hero Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center font-extrabold text-lg text-cyan-400">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white">{discom.name}</h1>
                  <StatusBadge status={discom.status} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  State: <span className="text-slate-200 font-semibold">{discom.state?.name || discom.state_name || discom.state_id}</span> | Type: <span className="text-cyan-300 font-semibold">{discom.ownership_type || discom.ownership}</span> | Code: <span className="text-slate-300 font-mono">{discom.code}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                disabled={isExportingPdf}
                className="px-3.5 py-2 rounded-lg bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)]/50 border border-[var(--line)] text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                title="Export DISCOM Profile as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-[var(--lilac)]" />
                <span>{isExportingPdf ? 'Exporting...' : 'Export DISCOM Brief (PDF)'}</span>
              </button>
              <button
                onClick={() => onQueryProfile(discom.state_id, discom.id)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Regulatory Query</span>
              </button>
            </div>
          </div>

        {/* Operational Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Service Coverage</span>
            <p className="text-xs text-slate-300">{discom.service_territory}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Total Consumer Accounts</span>
            <h4 className="text-base font-bold text-cyan-400">{discom.consumer_base || discom.consumer_count || 'Statewide Consumers'}</h4>
            <p className="text-[11px] text-slate-500">Industrial, Commercial, LT & Agriculture</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Active Tariff Order</span>
            <h4 className="text-xs font-mono font-bold text-emerald-400 truncate">{discom.tariff_order_ref}</h4>
            <p className="text-[11px] text-slate-500">Effective: {discom.tariff_effective_date}</p>
          </div>
        </div>
      </div>

      {/* TOD 24-Hour Timeline */}
      {todProfile && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>DISCOM Time-of-Day (TOD) Time Schedule</span>
          </h2>
          <TodTimeline todProfile={todProfile} baseEnergyRate={7.50} />
        </div>
      )}

      {/* Structured Tariff Categories for FY 2025-26 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>Tariff Schedules ({tariffs.length} Configured Schedules)</span>
          </h2>
        </div>

        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3">Voltage</th>
                <th className="px-4 py-3">Energy Charge</th>
                <th className="px-4 py-3">Demand Charge</th>
                <th className="px-4 py-3">Duty / Taxes</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
              {tariffs.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-semibold text-white">{t.tariff_category_name}</td>
                  <td className="px-4 py-3 font-mono text-cyan-400">{t.voltage_level}</td>
                  <td className="px-4 py-3 font-mono font-bold text-white">₹ {t.energy_charge} / {cleanUnit(t.energy_charge_unit, 'kVAh')}</td>
                  <td className="px-4 py-3 font-mono">₹ {t.demand_charge} / {cleanUnit(t.demand_charge_unit, 'kVA/mo')}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{t.electricity_duty}% + ₹ {t.fac_fppas}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.verification_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}

