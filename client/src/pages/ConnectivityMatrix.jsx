import React, { useState, useEffect } from 'react';
import {
  Network,
  Building2,
  Zap,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function ConnectivityMatrix() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(false);

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
    async function loadMatrix() {
      setLoading(true);
      try {
        const res = await api.getConnectivityMatrix({ state_id: selectedState });
        setMatrixData(res);
      } catch (err) {
        console.error('Failed to load connectivity matrix:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatrix();
  }, [selectedState]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#09193C] via-[#0B1B3D] to-[#07122A] border border-[#2D50A1]/40 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#28B8B4]/20 border border-[#28B8B4]/40 text-[#28B8B4]">
            <Network className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#28B8B4]/20 text-[#28B8B4] border border-[#28B8B4]/30 rounded">
                Atlas Engine 3
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Connectivity Matrix & Technical Losses</h1>
            </div>
            <p className="text-xs text-[#C6CBD9]/80 mt-1">
              STU, CTU, and DISCOM interconnection voltage routes, substation capacity rules, and voltage-tiered technical losses.
            </p>
          </div>
        </div>

        {/* State Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#C6CBD9]/70 font-medium">State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-[#07122A] border border-[#2D50A1]/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#28B8B4]"
          >
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.regulator_code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Substation Evacuation Voltage Ladder */}
      {matrixData && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#28B8B4] flex items-center gap-2">
            <Layers className="w-4 h-4" /> 1. Substation Evacuation Voltage Ladder
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {matrixData.substation_guidelines.map(tier => (
              <div key={tier.voltage} className="p-4 rounded-xl bg-[#09193C] border border-[#2D50A1]/40 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#28B8B4]/15 text-[#28B8B4] border border-[#28B8B4]/30 inline-block">
                  {tier.voltage}
                </span>
                <div className="text-xs font-bold text-white">
                  Capacity: {tier.min_mw} – {tier.max_mw} MW
                </div>
                <p className="text-[11px] text-[#C6CBD9]/70 leading-tight">
                  {tier.typical_substation}
                </p>
              </div>
            ))}
          </div>

          {/* Technical Grid Loss Table & Gross-up Multipliers */}
          <div className="p-5 rounded-2xl bg-[#09193C] border border-[#2D50A1]/40 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Voltage-Tiered Technical Loss Multipliers</h3>
                <p className="text-[11px] text-[#C6CBD9]/70 mt-0.5">
                  Used by GridFlex to calculate delivered PPA cost: <code className="text-[#28B8B4]">Delivered = PPA × [1 / (1 - Loss%)]</code>
                </p>
              </div>
              <span className="text-[11px] text-[#C6CBD9]/60 font-mono">SERC Tariff Orders</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2D50A1]/40 text-[#C6CBD9]/70 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Interconnection Voltage</th>
                    <th className="py-2.5 px-3">STU Transmission Loss</th>
                    <th className="py-2.5 px-3">DISCOM Wheeling Loss</th>
                    <th className="py-2.5 px-3 font-bold text-white">Total Grid Loss</th>
                    <th className="py-2.5 px-3 font-bold text-[#28B8B4]">Loss Gross-Up Multiplier</th>
                    <th className="py-2.5 px-3">Order Citation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D50A1]/20 font-mono">
                  {matrixData.loss_matrix.map(l => {
                    const totalLoss = l.total_technical_loss_pct || (l.transmission_loss_pct + l.wheeling_loss_pct);
                    const mult = (1 / (1 - totalLoss / 100)).toFixed(4);
                    return (
                      <tr key={l.id} className="hover:bg-[#0B1B3D]/60 transition">
                        <td className="py-2.5 px-3 font-bold text-white">{l.voltage_code}</td>
                        <td className="py-2.5 px-3 text-[#C6CBD9]">{l.transmission_loss_pct}%</td>
                        <td className="py-2.5 px-3 text-[#C6CBD9]">{l.wheeling_loss_pct}%</td>
                        <td className="py-2.5 px-3 font-bold text-[#F79050]">{totalLoss}%</td>
                        <td className="py-2.5 px-3 font-bold text-[#28B8B4]">× {mult}</td>
                        <td className="py-2.5 px-3 text-[10px] text-[#C6CBD9]/60 font-sans">{l.order_reference}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
