import React, { useState } from 'react';
import { Check, MapPin } from 'lucide-react';
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

export default function IndiaCoverageMap({ onSelectState }) {
  const [hoveredState, setHoveredState] = useState(null);

  const showStateTooltip = (event, state, isCovered) => {
    const bounds = event.currentTarget.ownerSVGElement.parentElement.getBoundingClientRect();
    setHoveredState({
      name: state.name,
      isCovered,
      x: Math.max(16, Math.min(event.clientX - bounds.left, bounds.width - 16)),
      y: Math.max(54, event.clientY - bounds.top)
    });
  };

  const activateState = (event, stateId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectState(stateId);
    }
  };

  return (
    <section className="vesper-coverage-panel" aria-labelledby="india-coverage-title">
      <div className="vesper-coverage-heading">
        <div>
          <div className="vesper-eyebrow">
            <MapPin className="h-3.5 w-3.5" />
            <span>Regulatory footprint</span>
          </div>
          <h2 id="india-coverage-title">India coverage map</h2>
          <p>Select a highlighted state to open its regulatory profile.</p>
        </div>
        <span className="vesper-coverage-count">17 / 36</span>
      </div>

      <div className="vesper-coverage-layout">
        <div className="vesper-map-wrap" onPointerLeave={() => setHoveredState(null)}>
          <svg
            className="vesper-india-map"
            viewBox="0 0 520 600"
            role="group"
            aria-label="Map of India. Highlighted states are covered by the regulatory library."
          >
            {indiaStateMap.map((state) => {
              const isCovered = coveredStateIds.has(state.id);
              const label = isCovered
                ? `${state.name}, covered. Select to open profile.`
                : `${state.name}, not currently covered.`;

              return (
                <path
                  key={state.id}
                  d={state.d}
                  className={`vesper-map-region ${isCovered ? 'is-covered' : 'is-uncovered'}`}
                  role={isCovered ? 'button' : undefined}
                  tabIndex={isCovered ? 0 : -1}
                  aria-label={label}
                  onClick={isCovered ? () => onSelectState(state.id) : undefined}
                  onPointerEnter={(event) => showStateTooltip(event, state, isCovered)}
                  onPointerMove={(event) => showStateTooltip(event, state, isCovered)}
                  onFocus={(event) => {
                    const bounds = event.currentTarget.ownerSVGElement.parentElement.getBoundingClientRect();
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
              className="vesper-map-tooltip"
              role="status"
              style={{ left: `${hoveredState.x}px`, top: `${hoveredState.y}px` }}
            >
              <span className={`vesper-map-tooltip-icon ${hoveredState.isCovered ? 'is-covered' : ''}`}>
                {hoveredState.isCovered
                  ? <Check className="h-3.5 w-3.5" />
                  : <MapPin className="h-3.5 w-3.5" />}
              </span>
              <span className="vesper-map-tooltip-copy">
                <strong>{hoveredState.name}</strong>
                <small>
                  {hoveredState.isCovered ? 'Covered · Select to open profile' : 'Not currently covered'}
                </small>
              </span>
            </div>
          )}
        </div>

        <div className="vesper-coverage-aside">
          <div className="vesper-coverage-stat">
            <span className="vesper-coverage-stat-value">17</span>
            <span className="vesper-coverage-stat-label">covered states &amp; territories</span>
          </div>
          <div className="vesper-map-legend" aria-label="Map legend">
            <span><i className="is-covered" /> In Atlas coverage</span>
            <span><i className="is-uncovered" /> Not currently covered</span>
          </div>
          <p className="vesper-map-help">
            Use the map with a mouse, touch, or keyboard. Covered regions open in Regulatory Explorer.
          </p>
          <p className="vesper-map-attribution">
            Boundary data is MIT-licensed. Boundaries are indicative and not for legal use.
          </p>
        </div>
      </div>
    </section>
  );
}
