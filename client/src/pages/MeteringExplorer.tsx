import React, { useState, useEffect } from 'react';
import { Gauge, Radio, Server, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function MeteringExplorer() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [metering, setMetering] = useState(null);
  const [loading, setLoading] = useState(true);

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
    async function loadMetering() {
      if (!selectedState) return;
      try {
        setLoading(true);
        const data = await api.getMetering(selectedState);
        setMetering(data);
      } catch (err) {
        console.error('Failed to load metering rules:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetering();
  }, [selectedState]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <Gauge className="w-4 h-4" />
            <span>Grid Metering Code</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Metering, SEM & Telemetry Infrastructure
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Availability Based Tariff (ABT) compliant Special Energy Meters (SEM), Class 0.2S CT/PT accuracy, AMR protocols, and real-time SLDC SCADA integration standards.
          </p>
        </div>

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

      {loading || !metering ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading metering specifications...</div>
      ) : (
        <div className="space-y-6">
          {/* Top Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Meter Standard</span>
              <div className="text-lg font-bold text-cyan-400">{metering.meter_type}</div>
              <p className="text-xs text-slate-400">15-minute time block ABT recording</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">CT / PT Accuracy</span>
              <div className="text-xl font-extrabold font-mono text-emerald-400">{metering.accuracy_class}</div>
              <p className="text-xs text-slate-400">IS: 14697 / IEC 62053-22</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Telemetry Channel</span>
              <div className="text-lg font-bold text-white">Dual 4G SIM / VPN</div>
              <p className="text-xs text-slate-400">{metering.communication_protocol}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">SLDC SCADA Link</span>
              <div className="text-lg font-bold text-indigo-400">IEC 60870-5-104</div>
              <p className="text-xs text-slate-400">Direct streaming to SLDC RTU</p>
            </div>
          </div>

          {/* Tri-Meter Configuration Architecture */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Main, Check & Standby Metering Configuration</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/40 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 uppercase">
                  Main Meter
                </span>
                <h4 className="text-xs font-bold text-white">Primary Commercial Settlement</h4>
                <p className="text-xs text-slate-400">{metering.main_meter_spec}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-800/40 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 uppercase">
                  Check Meter
                </span>
                <h4 className="text-xs font-bold text-white">Verification & Redundancy</h4>
                <p className="text-xs text-slate-400">{metering.check_meter_spec}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 uppercase">
                  Standby Meter
                </span>
                <h4 className="text-xs font-bold text-white">Substation Interconnection</h4>
                <p className="text-xs text-slate-400">Installed at STU grid substation end on high-voltage feeder bay.</p>
              </div>
            </div>
          </div>

          {/* SLDC Integration Requirements */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>SLDC Real-Time Telemetry & Data Logging Rules</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {metering.sldc_integration_req}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

