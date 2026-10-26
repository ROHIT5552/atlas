import React, { useState } from 'react';
import { Clock } from 'lucide-react';

export interface TodSlot {
  slot_index?: number;
  slot_name: string;
  start_time: string;
  end_time: string;
  rate_delta: number;
  color?: string;
  type?: string;
}

export interface TodProfileData {
  season?: string;
  source?: string;
  slots: TodSlot[];
}

export interface TodTimelineProps {
  todProfile?: TodProfileData | null;
  baseEnergyRate?: number;
}

export default function TodTimeline({ todProfile, baseEnergyRate = 7.50 }: TodTimelineProps) {
  const [selectedHour, setSelectedHour] = useState(19); // Default evening peak

  if (!todProfile || !todProfile.slots || todProfile.slots.length === 0) {
    return (
      <div className="p-6 text-center rounded-2xl bg-[var(--surface-1)] border border-[var(--line)] text-slate-400 text-xs">
        No TOD Profile configured for this category. Standard flat tariff applies.
      </div>
    );
  }

  const slots = todProfile.slots;

  // Helper to parse HH:MM to hours float
  const parseHour = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h + (m || 0) / 60;
  };

  // Find slot for a given hour (0-23.99)
  const getSlotForHour = (hour: number): TodSlot => {
    for (const slot of slots) {
      const start = parseHour(slot.start_time);
      const end = parseHour(slot.end_time);
      if (start < end) {
        if (hour >= start && hour < end) return slot;
      } else {
        // Wraps over midnight (e.g. 22:00 to 06:00)
        if (hour >= start || hour < end) return slot;
      }
    }
    return slots[0];
  };

  const activeSlot = getSlotForHour(selectedHour);
  const effectiveRate = baseEnergyRate ? (baseEnergyRate + (activeSlot?.rate_delta || 0)).toFixed(2) : 'N/A';

  return (
    <div className="space-y-6 w-full">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--lilac)]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              24-Hour Time of Day (TOD) Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Season: <span className="text-slate-200 font-medium">{todProfile.season || 'All Year'}</span> | Source: <span className="text-slate-300">{todProfile.source || 'Statutory Tariff Order'}</span>
          </p>
        </div>

        {/* Selected Hour Live Indicator */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[var(--surface-1)] border border-[var(--line)] self-start sm:self-auto">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Scrubber Time</div>
            <div className="text-sm font-mono font-bold text-[var(--lilac)]">
              {String(selectedHour).padStart(2, '0')}:00 hrs
            </div>
          </div>
          <div className="h-7 w-[1px] bg-[var(--line)]" />
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold text-slate-400">Rate Delta</div>
            <div className={`text-sm font-mono font-bold ${activeSlot?.rate_delta > 0 ? 'text-rose-400' : activeSlot?.rate_delta < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
              {activeSlot?.rate_delta > 0 ? `+₹ ${activeSlot.rate_delta.toFixed(2)}/kWh` : activeSlot?.rate_delta < 0 ? `-₹ ${Math.abs(activeSlot.rate_delta).toFixed(2)}/kWh` : 'Flat Rate'}
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Interactive Visual Bar */}
      <div className="space-y-2">
        <div className="relative h-12 w-full rounded-xl bg-slate-950 border border-[var(--line)] p-1 flex overflow-hidden shadow-inner">
          {slots.map((slot, index) => {
            const start = parseHour(slot.start_time);
            const end = parseHour(slot.end_time);
            let durationHours = end >= start ? end - start : (24 - start) + end;
            const widthPct = (durationHours / 24) * 100;
            const isCurrent = activeSlot?.slot_name === slot.slot_name;

            return (
              <div
                key={index}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: slot.color || (slot.rate_delta > 0 ? '#ef4444' : slot.rate_delta < 0 ? '#10b981' : '#475569')
                }}
                className={`h-full relative transition-all cursor-pointer group flex flex-col justify-center items-center px-1 text-center select-none ${
                  isCurrent ? 'ring-2 ring-white z-10 shadow-lg scale-y-105' : 'opacity-85 hover:opacity-100'
                }`}
                onClick={() => setSelectedHour(Math.floor(start))}
                title={`${slot.slot_name}: ${slot.start_time} - ${slot.end_time} (${slot.rate_delta >= 0 ? '+' : ''}₹${slot.rate_delta}/kWh)`}
              >
                <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-950 truncate max-w-full drop-shadow-sm">
                  {slot.slot_name}
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono font-bold text-slate-950/90 truncate">
                  {slot.rate_delta > 0 ? `+${slot.rate_delta}` : slot.rate_delta < 0 ? `${slot.rate_delta}` : 'Base'}
                </span>
              </div>
            );
          })}
        </div>

        {/* 24-Hour Tick Marks */}
        <div className="flex justify-between px-1 text-[9px] sm:text-[10px] font-mono text-slate-500 overflow-x-auto">
          <span>00:00</span>
          <span className="hidden sm:inline">03:00</span>
          <span>06:00</span>
          <span className="hidden sm:inline">09:00</span>
          <span>12:00</span>
          <span className="hidden sm:inline">15:00</span>
          <span>18:00</span>
          <span className="hidden sm:inline">21:00</span>
          <span>24:00</span>
        </div>

        {/* Interactive Slider */}
        <div className="pt-2">
          <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Drag slider to inspect hourly tariff behavior:</span>
            <span className="font-mono text-[var(--lilac)] font-bold">{selectedHour}:00</span>
          </label>
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={selectedHour}
            onChange={(e) => setSelectedHour(Number(e.target.value))}
            className="w-full h-1.5 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--violet)] mt-1"
          />
        </div>
      </div>

      {/* Active Slot Detailed Breakdown Card */}
      {activeSlot && (
        <div className="p-4 rounded-2xl bg-[var(--surface-1)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-3.5 h-10 rounded-full shrink-0"
              style={{ backgroundColor: activeSlot.color || '#6D4AF0' }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{activeSlot.slot_name}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--surface-2)] text-slate-300">
                  {activeSlot.start_time} to {activeSlot.end_time}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeSlot.rate_delta > 0
                  ? `Peak hour surcharge applied to discourage peak grid drawal.`
                  : activeSlot.rate_delta < 0
                  ? `Night off-peak rebate incentivizes shifting industrial load.`
                  : `Standard daytime base energy tariff applies.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500">Tariff Delta</div>
              <div className={`text-sm sm:text-base font-bold font-mono ${activeSlot.rate_delta > 0 ? 'text-rose-400' : activeSlot.rate_delta < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                {activeSlot.rate_delta > 0 ? `+ ₹ ${activeSlot.rate_delta.toFixed(2)} / kWh` : activeSlot.rate_delta < 0 ? `- ₹ ${Math.abs(activeSlot.rate_delta).toFixed(2)} / kWh` : '₹ 0.00 (Base)'}
              </div>
            </div>

            {baseEnergyRate && (
              <div className="text-right pl-4 border-l border-[var(--line)]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Net Energy Rate</div>
                <div className="text-sm sm:text-base font-bold font-mono text-[var(--lilac)]">
                  ₹ {effectiveRate} / kVAh
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOD Slots Structured Table */}
      <div className="overflow-x-auto w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-1)]">
        <table className="w-full min-w-[500px] text-left text-xs">
          <thead className="bg-[var(--surface-2)] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[var(--line)]">
            <tr>
              <th className="px-4 py-3">Slot #</th>
              <th className="px-4 py-3">Slot Name</th>
              <th className="px-4 py-3">Time Window</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Tariff Delta (₹/kWh)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]/50 font-medium">
            {slots.map((slot, sIdx) => {
              const isSelected = activeSlot?.slot_name === slot.slot_name;
              return (
                <tr
                  key={sIdx}
                  onClick={() => setSelectedHour(Math.floor(parseHour(slot.start_time)))}
                  className={`cursor-pointer transition ${
                    isSelected ? 'bg-[var(--violet)]/15 text-white' : 'hover:bg-[var(--surface-2)]/60 text-slate-300'
                  }`}
                >
                  <td className="px-4 py-2.5 font-mono text-slate-500">{slot.slot_index || sIdx + 1}</td>
                  <td className="px-4 py-2.5 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slot.color || '#6D4AF0' }} />
                    <span className="font-semibold text-slate-200">{slot.slot_name}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-400">{slot.start_time} - {slot.end_time}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      slot.rate_delta > 0
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                        : slot.rate_delta < 0
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : 'bg-[var(--surface-2)] text-slate-400'
                    }`}>
                      {slot.type || (slot.rate_delta > 0 ? 'Peak' : slot.rate_delta < 0 ? 'Rebate' : 'Normal')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold">
                    {slot.rate_delta > 0 ? (
                      <span className="text-rose-400">+{slot.rate_delta.toFixed(2)}</span>
                    ) : slot.rate_delta < 0 ? (
                      <span className="text-emerald-400">{slot.rate_delta.toFixed(2)}</span>
                    ) : (
                      <span className="text-slate-400">0.00</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
