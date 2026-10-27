'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Station } from '../lib/types';
import gsap from 'gsap';

interface StationsViewProps {
  stations: Station[];
}

export const StationsView: React.FC<StationsViewProps> = ({ stations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredStations = stations.filter((s) => {
    const matchesSearch =
      s.location_id.toString().includes(searchTerm) ||
      s.location_index.toString().includes(searchTerm);
    const matchesGroup =
      groupFilter === 'all' || s.location_group.toString() === groupFilter;
    return matchesSearch && matchesGroup;
  });

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.station-tile'),
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.015, ease: 'power2.out' }
      );
    }
  }, [groupFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="neo-box p-6 bg-[var(--neo-surface)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-[var(--neo-border)] gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="neo-badge bg-[var(--neo-cyan)] text-black">
                GEORGIA WATERSHED
              </span>
              <span className="font-mono text-[11px] text-[var(--neo-text-dim)]">
                37 TELEMETRY STATIONS
              </span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">
              Spatio-Temporal Water Sensor Grid
            </h2>
            <p className="text-xs text-[var(--neo-text-muted)] mt-0.5">
              Continuous monitoring stations streaming 12-channel telemetry into the predictive inference pipeline.
            </p>
          </div>

          <div className="neo-badge bg-black text-white text-xs px-3.5 py-1.5 font-mono">
            {filteredStations.length} / {stations.length} ACTIVE SITES
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--neo-text-dim)] absolute left-3.5 top-3 stroke-[2.5]" />
            <input
              type="text"
              placeholder="SEARCH STATION ID OR INDEX..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full neo-input pl-10 pr-3.5 py-2 text-xs font-mono font-bold uppercase placeholder:text-[var(--neo-text-dim)]"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {(['all', '0', '1', '2'] as const).map((g) => {
              const isSelected = groupFilter === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroupFilter(g)}
                  className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-sm border-2 border-[var(--neo-border)] cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[var(--neo-yellow)] text-black shadow-[2px_2px_0px_0px_var(--neo-shadow)] translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-[var(--neo-surface-alt)] text-[var(--neo-text)] hover:bg-[var(--neo-surface)]'
                  }`}
                >
                  {g === 'all' ? 'ALL CLUSTERS' : `CLUSTER ${g}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Station Tiles */}
      <div
        ref={containerRef}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {filteredStations.map((st) => (
          <div
            key={st.location_index}
            className="station-tile neo-box-sm p-4 bg-[var(--neo-surface)] neo-interactive flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="neo-badge bg-black text-white text-[10px]">
                  SITE #{st.location_index}
                </span>
                <span className="neo-badge bg-[var(--neo-cyan)] text-black text-[10px]">
                  CLUSTER {st.location_group}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-[var(--neo-text)] font-extrabold text-sm mb-2">
                <div className="w-6 h-6 bg-[var(--neo-yellow)] border border-black flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                </div>
                <span className="font-mono">USGS {st.location_id}</span>
              </div>

              <p className="text-xs text-[var(--neo-text-muted)] leading-relaxed">
                Autonomous hydro-sensor probe capturing continuous pH, dissolved O₂, temperature, and conductance.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[var(--neo-border)]/20 flex items-center justify-between text-[10px] font-mono font-bold text-[var(--neo-text-dim)]">
              <span>STATUS: NOMINAL</span>
              <span className="w-2 h-2 rounded-full bg-[var(--neo-green)] border border-black animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
