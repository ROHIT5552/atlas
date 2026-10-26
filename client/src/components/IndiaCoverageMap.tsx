import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { indiaStateMap } from '../data/indiaStateMap';

const coveredStateIds = new Set([
  'andhra-pradesh',
  'chhattisgarh',
  'delhi',
  'gujarat',
  'haryana',
  'jharkhand',
  'karnataka',
  'madhya-pradesh',
  'maharashtra',
  'odisha',
  'punjab',
  'rajasthan',
  'tamil-nadu',
  'telangana',
  'uttar-pradesh',
  'uttarakhand',
  'west-bengal'
]);

export interface IndiaCoverageMapProps {
  onSelectState: (stateId: string) => void;
}

interface HoveredState {
  name: string;
  isCovered: boolean;
  x: number;
  y: number;
}

export default function IndiaCoverageMap({ onSelectState }: IndiaCoverageMapProps) {
  const [hoveredState, setHoveredState] = useState<HoveredState | null>(null);

  const showStateTooltip = (event: React.PointerEvent<SVGPathElement>, state: any, isCovered: boolean) => {
    const svgEl = (event.currentTarget as SVGElement).ownerSVGElement;
    if (!svgEl || !svgEl.parentElement) return;
    const bounds = svgEl.parentElement.getBoundingClientRect();
    setHoveredState({
      name: state.name,
      isCovered,
      x: Math.max(16, Math.min(event.clientX - bounds.left, bounds.width - 16)),
      y: Math.max(54, event.clientY - bounds.top)
    });
  };

  const activateState = (event: React.KeyboardEvent<SVGPathElement>, stateId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectState(stateId);
    }
  };

  return (
    <section className="vesper-coverage-panel w-full overflow-hidden" aria-labelledby="india-coverage-title">
      <div className="vesper-coverage-heading flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="vesper-eyebrow flex items-center gap-1.5 text-xs text-[var(--lilac)]">
            <MapPin className="h-3.5 w-3.5" />
            <span>Regulatory footprint</span>
          </div>
          <h2 id="india-coverage-title" className="text-lg font-bold text-[var(--text)]">India coverage map</h2>
          <p className="text-xs text-[var(--muted)]">Select a highlighted state to open its regulatory profile.</p>
        </div>
        <span className="vesper-coverage-count self-start sm:self-auto text-xs font-mono px-2.5 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[var(--lilac)]">17 / 36 Covered</span>
      </div>

      <div className="vesper-coverage-layout relative w-full flex items-center justify-center p-2 sm:p-4">
        <div className="vesper-map-wrap relative w-full max-w-[520px] aspect-[520/600]" onPointerLeave={() => setHoveredState(null)}>
          <svg
            className="vesper-india-map w-full h-full"
            viewBox="0 0 520 600"
            role="group"
            aria-label="Map of India. Highlighted states are covered by the regulatory library."
          >
            {indiaStateMap.map((state: any) => {
              const isCovered = coveredStateIds.has(state.id);
              const label = isCovered
                ? `${state.name}, covered. Select to open profile.`
                : `${state.name}, not currently covered.`;

              return (
                <path
                  key={state.id}
                  d={state.d}
                  className={`vesper-map-region ${isCovered ? 'is-covered cursor-pointer' : 'is-uncovered'}`}
                  role={isCovered ? 'button' : undefined}
                  tabIndex={isCovered ? 0 : -1}
                  aria-label={label}
                  onClick={isCovered ? () => onSelectState(state.id) : undefined}
                  onPointerEnter={(event) => showStateTooltip(event, state, isCovered)}
                  onPointerMove={(event) => showStateTooltip(event, state, isCovered)}
                  onFocus={(event) => {
                    const svgEl = (event.currentTarget as SVGElement).ownerSVGElement;
                    if (!svgEl || !svgEl.parentElement) return;
                    const bounds = svgEl.parentElement.getBoundingClientRect();
                    setHoveredState({
                      name: state.name,
                      isCovered,
                      x: bounds.width / 2,
                      y: bounds.height / 2
                    });
                  }}
                  onBlur={() => setHoveredState(null)}
                  onKeyDown={isCovered ? (event) => activateState(event, state.id) : undefined}
                />
              );
            })}
          </svg>
          {hoveredState && (
            <div
              className="vesper-map-tooltip pointer-events-none absolute z-20 px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--line)] shadow-xl text-xs"
              style={{
                left: `${hoveredState.x}px`,
                top: `${hoveredState.y}px`,
                transform: 'translate(-50%, -120%)'
              }}
            >
              <div className="font-semibold text-white">{hoveredState.name}</div>
              <div className={`text-[10px] ${hoveredState.isCovered ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                {hoveredState.isCovered ? 'Covered • Click to open' : 'Coming soon'}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
