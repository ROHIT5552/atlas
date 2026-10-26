import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, HelpCircle, Archive, ShieldAlert } from 'lucide-react';

export interface StatusBadgeProps {
  status?: string;
  showWarningBanner?: boolean;
  className?: string;
}

export default function StatusBadge({ status, showWarningBanner = false, className = '' }: StatusBadgeProps) {
  const normalized = status ? status.toLowerCase() : 'pending';

  let badgeStyle = 'bg-slate-800/80 text-slate-300 border-slate-700';
  let Icon: React.ComponentType<{ className?: string }> = HelpCircle;
  let label = status || 'Data Not Available';

  if (normalized.includes('official verified')) {
    badgeStyle = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
    Icon = CheckCircle2;
  } else if (normalized.includes('internally verified')) {
    badgeStyle = 'bg-cyan-950/60 text-cyan-400 border-cyan-800/60';
    Icon = CheckCircle2;
  } else if (normalized.includes('pending')) {
    badgeStyle = 'bg-amber-950/60 text-amber-400 border-amber-800/60';
    Icon = Clock;
  } else if (normalized.includes('estimated')) {
    badgeStyle = 'bg-purple-950/60 text-purple-400 border-purple-800/60';
    Icon = HelpCircle;
  } else if (normalized.includes('superseded') || normalized.includes('historical')) {
    badgeStyle = 'bg-slate-800/60 text-slate-400 border-slate-700/60';
    Icon = Archive;
  } else if (normalized.includes('unverified')) {
    badgeStyle = 'bg-rose-950/60 text-rose-400 border-rose-800/60';
    Icon = ShieldAlert;
  }

  const isUnverified = normalized.includes('pending') || normalized.includes('unverified') || normalized.includes('estimated');

  return (
    <div className="inline-flex flex-col gap-1.5">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono font-medium uppercase tracking-[.12em] border ${badgeStyle} ${className}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </span>

      {showWarningBanner && isUnverified && (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[11px] text-[var(--muted)] font-medium">
          <AlertTriangle className="w-3 h-3 text-[var(--lilac)] shrink-0" />
          <span>Unverified — Do Not Use for Final Commercial Quotation</span>
        </div>
      )}
    </div>
  );
}
