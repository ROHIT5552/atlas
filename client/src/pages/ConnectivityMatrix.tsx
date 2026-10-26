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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[var(--surface-1)] via-[var(--surface-1)] to-[var(--bg)] border border-[var(--line)]/40 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[var(--violet)]/20 border border-[var(--line)]/40 text-[var(--lilac)]">
            <Network className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--violet)]/20 text-[var(--lilac)] border border-[var(--line)]/30 rounded">
                Atlas Engine 3
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Connectivity Matrix & Technical Losses</h1>
            </div>
            <p className="text-xs text-[var(--muted)]/80 mt-1">
              STU, CTU, and DISCOM interconnection voltage routes, substation capacity rules, and voltage-tiered technical losses.
            </p>
          </div>
        </div>

        {/* State Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted)]/70 font-medium">State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-[var(--bg)] border border-[var(--line)]/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--line)]"
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lilac)] flex items-center gap-2">
            <Layers className="w-4 h-4" /> 1. Substation Evacuation Voltage Ladder
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {matrixData.substation_guidelines.map(tier => (
              <div key={tier.voltage} className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--line)]/40 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--violet)]/15 text-[var(--lilac)] border border-[var(--line)]/30 inline-block">
                  {tier.voltage}
                </span>
                <div className="text-xs font-bold text-white">
                  Capacity: {tier.min_mw} – {tier.max_mw} MW
                </div>
                <p className="text-[11px] text-[var(--muted)]/70 leading-tight">
                  {tier.typical_substation}
                </p>
              </div>
            ))}
          </div>

          {/* Technical Grid Loss Table & Gross-up Multipliers */}
          <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--line)]/40 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Voltage-Tiered Technical Loss Multipliers</h3>
                <p className="text-[11px] text-[var(--muted)]/70 mt-0.5">
                  Used by GridFlex to calculate delivered PPA cost: <code className="text-[var(--lilac)]">Delivered = PPA × [1 / (1 - Loss%)]</code>
                </p>
              </div>
              <span className="text-[11px] text-[var(--muted)]/60 font-mono">SERC Tariff Orders</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)]/40 text-[var(--muted)]/70 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Interconnection Voltage</th>
                    <th className="py-2.5 px-3">STU Transmission Loss</th>
                    <th className="py-2.5 px-3">DISCOM Wheeling Loss</th>
                    <th className="py-2.5 px-3 font-bold text-white">Total Grid Loss</th>
                    <th className="py-2.5 px-3 font-bold text-[var(--lilac)]">Loss Gross-Up Multiplier</th>
                    <th className="py-2.5 px-3">Order Citation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D50A1]/20 font-mono">
                  {matrixData.loss_matrix.map(l => {
                    const totalLoss = l.total_technical_loss_pct || (l.transmission_loss_pct + l.wheeling_loss_pct);
                    const mult = (1 / (1 - totalLoss / 100)).toFixed(4);
                    return (
                      <tr key={l.id} className="hover:bg-[var(--surface-1)]/60 transition">
                        <td className="py-2.5 px-3 font-bold text-white">{l.voltage_code}</td>
                        <td className="py-2.5 px-3 text-[var(--muted)]">{l.transmission_loss_pct}%</td>
                        <td className="py-2.5 px-3 text-[var(--muted)]">{l.wheeling_loss_pct}%</td>
                        <td className="py-2.5 px-3 font-bold text-[var(--lilac)]">{totalLoss}%</td>
                        <td className="py-2.5 px-3 font-bold text-[var(--lilac)]">× {mult}</td>
                        <td className="py-2.5 px-3 text-[10px] text-[var(--muted)]/60 font-sans">{l.order_reference}</td>
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
