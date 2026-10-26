import React, { useState, useEffect } from 'react';
import { Clock, Layers, Sparkles, Filter, Info, TrendingUp, TrendingDown, Printer } from 'lucide-react';
import { api } from '../services/api';
import TodTimeline from '../components/TodTimeline';
import { exportElementToPDF } from '../utils/pdfExportUtils';

export default function TodVisualizer() {
  const [states, setStates] = useState([]);
  const [discoms, setDiscoms] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [selectedDiscom, setSelectedDiscom] = useState('msedcl');
  const [todProfile, setTodProfile] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPDF = async () => {
    if (!todProfile) return;
    setIsExportingPdf(true);
    try {
      await exportElementToPDF({
        elementId: 'tod-visualizer-report-area',
        fileName: `NewRa_TOD_Curve_${selectedState}_${selectedDiscom}.pdf`,
        reportTitle: 'Time-of-Day (TOD) Tariff Curve & Slot Schedule',
        entityName: `${selectedState.toUpperCase()} - ${selectedDiscom.toUpperCase()} (${todProfile.season || 'Standard Season'})`
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  useEffect(() => {
    async function loadInitial() {
      try {
        const [sRes, todRes] = await Promise.all([
          api.getStates(),
          api.getTodProfiles()
        ]);
        setStates(sRes.states || []);
        setAllProfiles(todRes.profiles || []);
      } catch (err) {
        console.error('Failed to load TOD metadata:', err);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    async function loadDiscoms() {
      if (!selectedState) return;
      try {
        const dRes = await api.getDiscoms({ state_id: selectedState });
        const list = dRes.discoms || [];
        setDiscoms(list);
        if (list.length > 0) {
          if (!list.some(d => d.id === selectedDiscom)) {
            setSelectedDiscom(list[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load DISCOMs:', err);
      }
    }
    loadDiscoms();
  }, [selectedState]);

  useEffect(() => {
    async function fetchTod() {
      if (!selectedDiscom) return;
      try {
        setLoading(true);
        const res = await api.getTodProfiles({ discom_id: selectedDiscom });
        setTodProfile(res.profiles?.[0] || null);
      } catch (err) {
        console.error('Failed to fetch TOD profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTod();
  }, [selectedDiscom]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Time-of-Day Dynamics</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            24-Hour TOD Tariff Curve Visualizer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Interactive visualization and timeline mapping of peak surcharges, off-peak night rebates, and normal operating windows across Indian DISCOMs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf || !todProfile}
            className="px-3.5 py-2 bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)]/50 border border-[var(--line)] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-md"
            title="Export TOD Curve as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--lilac)]" />
            <span>{isExportingPdf ? 'Exporting...' : 'Export TOD Curve (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-semibold"
          >
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">DISCOM:</span>
          <select
            value={selectedDiscom}
            onChange={(e) => setSelectedDiscom(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-semibold"
          >
            {discoms.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive TOD Component */}
      {loading || !todProfile ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading TOD profile...</div>
      ) : (
        <div id="tod-visualizer-report-area" className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
          <TodTimeline todProfile={todProfile} baseEnergyRate={7.50} />
        </div>
      )}

      {/* Multi-State Comparison Overview */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Cross-State TOD Structure Overview</span>
          </h2>
          <span className="text-xs text-slate-500">Representative industrial profiles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allProfiles.slice(0, 6).map((prof, pIdx) => (
            <div
              key={pIdx}
              onClick={() => {
                setSelectedState(prof.state_id);
                setSelectedDiscom(prof.discom_id);
              }}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                prof.discom_id === selectedDiscom
                  ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase">{prof.discom_id}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{prof.slots?.length} Slots</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 capitalize">{prof.state_id}</div>
              </div>

              {/* Mini Segment Bar */}
              <div className="h-4 w-full rounded-md overflow-hidden flex bg-slate-950 border border-slate-800">
                {prof.slots?.map((s, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      width: `${(1 / prof.slots.length) * 100}%`,
                      backgroundColor: s.color || '#3b82f6'
                    }}
                    className="h-full"
                    title={`${s.slot_name}: ${s.start_time}-${s.end_time} (${s.rate_delta >= 0 ? '+' : ''}₹${s.rate_delta}/kWh)`}
                  />
                ))}
              </div>

              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Click to inspect timeline</span>
                <span className="font-mono text-cyan-400">TOD</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

