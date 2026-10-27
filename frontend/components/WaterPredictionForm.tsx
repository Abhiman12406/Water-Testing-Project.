'use client';

import React, { useRef, useEffect } from 'react';
import {
  RefreshCw,
  ArrowRight,
  Zap
} from 'lucide-react';
import { WaterFeatures, ModelType, PresetSample } from '../lib/types';
import gsap from 'gsap';

interface WaterPredictionFormProps {
  features: WaterFeatures;
  setFeatures: React.Dispatch<React.SetStateAction<WaterFeatures>>;
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
  presetSamples: PresetSample[];
  onSubmit: (e?: React.FormEvent) => void;
  loading: boolean;
  onSelectPreset: (preset: PresetSample) => void;
}

export const WaterPredictionForm: React.FC<WaterPredictionFormProps> = ({
  features,
  setFeatures,
  selectedModel,
  setSelectedModel,
  presetSamples,
  onSubmit,
  loading,
  onSelectPreset,
}) => {
  const containerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.animate-bento'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }, []);

  const handleChange = (key: keyof WaterFeatures, value: string) => {
    const num = parseFloat(value);
    setFeatures((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : num,
    }));
  };

  const handleRandomize = () => {
    setFeatures({
      Specific_conductance_Max: Number((Math.random() * 0.06 + 0.001).toFixed(4)),
      pH_Max: Number((Math.random() * 0.06 + 0.87).toFixed(4)),
      pH_Min: Number((Math.random() * 0.01 + 0.001).toFixed(4)),
      Specific_conductance_Min: Number((Math.random() * 0.03 + 0.001).toFixed(4)),
      Specific_conductance_Mean: Number((Math.random() * 0.15 + 0.50).toFixed(4)),
      Dissolved_oxygen_Max: Number((Math.random() * 0.08 + 0.82).toFixed(4)),
      Dissolved_oxygen_Mean: Number((Math.random() * 0.15 + 0.55).toFixed(4)),
      Dissolved_oxygen_Min: Number((Math.random() * 0.20 + 0.50).toFixed(4)),
      Temperature_Mean: Number((Math.random() * 0.20 + 0.50).toFixed(4)),
      Temperature_Min: Number((Math.random() * 0.20 + 0.48).toFixed(4)),
      Temperature_Max: Number((Math.random() * 0.20 + 0.52).toFixed(4)),
      pH_Median: Number((Math.random() * 0.04 + 0.64).toFixed(4)),
    });
  };

  const modelsList: Array<{ id: ModelType; name: string; acc: string; tag: string }> = [
    { id: 'random_forest', name: 'Random Forest', acc: '99.1%', tag: '100 TREES' },
    { id: 'xgboost', name: 'XGBoost', acc: '99.0%', tag: 'BOOSTED' },
    { id: 'logistic_regression', name: 'Logistic Reg', acc: '95.1%', tag: 'LINEAR' },
    { id: 'ensemble', name: 'Ensemble', acc: 'Consensus', tag: 'VOTING' },
  ];

  return (
    <form
      ref={containerRef}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      className="space-y-6"
    >
      {/* 1. Presets Header & Cards */}
      <div className="animate-bento neo-box p-5 bg-[var(--neo-surface)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b-2 border-[var(--neo-border)] gap-2">
          <div className="flex items-center space-x-2.5">
            <span className="neo-badge bg-[var(--neo-yellow)] text-black">
              USGS PRESETS
            </span>
            <h3 className="font-extrabold text-base tracking-tight uppercase">
              Field Telemetry Profiles
            </h3>
          </div>
          <button
            type="button"
            onClick={handleRandomize}
            className="neo-btn bg-[var(--neo-cyan)] text-black px-3 py-1.5 text-xs font-bold space-x-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>RANDOMIZE DATA</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {presetSamples.map((preset) => {
            const isNormal = preset.expected.includes('Normal');
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className="text-left p-4 neo-box-sm neo-interactive bg-[var(--neo-surface-alt)] flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--neo-text-dim)]">
                      {preset.id}
                    </span>
                    <span
                      className={`neo-badge ${
                        isNormal
                          ? 'bg-[var(--neo-green)] text-black'
                          : 'bg-[var(--neo-red)] text-white'
                      }`}
                    >
                      {isNormal ? 'SAFE' : 'ANOMALY'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-[var(--neo-text)] group-hover:underline underline-offset-2">
                    {preset.name}
                  </h4>
                  <p className="text-[11px] text-[var(--neo-text-muted)] mt-1.5 leading-relaxed line-clamp-2">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t-2 border-[var(--neo-border)] flex items-center justify-between text-[11px] font-mono font-bold">
                  <span className="text-[var(--neo-text)]">LOAD PROFILE</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Inference Model Switcher */}
      <div className="animate-bento neo-box p-5 bg-[var(--neo-surface)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3.5 border-b-2 border-[var(--neo-border)] gap-2">
          <div className="flex items-center space-x-2">
            <span className="neo-badge bg-[var(--neo-purple)] text-black">
              MODEL SELECTION
            </span>
            <h3 className="font-extrabold text-sm uppercase tracking-tight">
              Inference Algorithm
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[var(--neo-text-dim)]">
            TRAINED ON 26,085 SAMPLES
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {modelsList.map((m) => {
            const isSelected = selectedModel === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedModel(m.id)}
                className={`p-3 rounded-sm border-2 border-[var(--neo-border)] text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[var(--neo-yellow)] text-black shadow-[4px_4px_0px_0px_var(--neo-shadow)] translate-x-[-1px] translate-y-[-1px] font-black'
                    : 'bg-[var(--neo-surface-alt)] text-[var(--neo-text)] hover:bg-[var(--neo-surface)] shadow-[2px_2px_0px_0px_var(--neo-shadow)]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="font-bold opacity-80">{m.tag}</span>
                  <span className="font-extrabold">{m.acc}</span>
                </div>
                <div className="font-extrabold text-xs tracking-tight">{m.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Parameter Inputs: Bento 4 Quadrants */}
      <div className="animate-bento neo-box p-5 bg-[var(--neo-surface)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b-2 border-[var(--neo-border)] gap-2">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="neo-badge bg-[var(--neo-cyan)] text-black">
                12 SENSOR CHANNELS
              </span>
              <span className="font-mono text-[11px] text-[var(--neo-text-dim)]">
                STANDARDSCALER (μ=0, σ=1)
              </span>
            </div>
            <h3 className="text-base font-extrabold uppercase tracking-tight">
              USGS Hydrological Parameters
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quadrant 1: Specific Conductance */}
          <div className="neo-box-sm p-4 bg-[var(--neo-surface-alt)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[var(--neo-border)]">
              <span className="neo-badge bg-[var(--neo-cyan)] text-black">
                SPECIFIC CONDUCTANCE
              </span>
              <span className="font-mono text-[10px] font-bold text-[var(--neo-text-dim)]">
                μS/cm (norm)
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span>MAXIMUM</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded-xs">
                    {features.Specific_conductance_Max}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.001"
                  value={features.Specific_conductance_Max}
                  onChange={(e) => handleChange('Specific_conductance_Max', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span>MINIMUM</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded-xs">
                    {features.Specific_conductance_Min}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.001"
                  value={features.Specific_conductance_Min}
                  onChange={(e) => handleChange('Specific_conductance_Min', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span>MEAN VALUE</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded-xs">
                    {features.Specific_conductance_Mean}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.001"
                  value={features.Specific_conductance_Mean}
                  onChange={(e) => handleChange('Specific_conductance_Mean', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Quadrant 2: pH Measurements */}
          <div className="neo-box-sm p-4 bg-[var(--neo-surface-alt)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[var(--neo-border)]">
              <span className="neo-badge bg-[var(--neo-yellow)] text-black">
                PH ACIDITY & ALKALINITY
              </span>
              <span className="font-mono text-[10px] font-bold text-[var(--neo-text-dim)]">
                pH (norm)
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span>MAXIMUM</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded-xs">
                    {features.pH_Max}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.0"
                  step="0.001"
                  value={features.pH_Max}
                  onChange={(e) => handleChange('pH_Max', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span>MINIMUM</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded-xs">
                    {features.pH_Min}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.001"
                  value={features.pH_Min}
                  onChange={(e) => handleChange('pH_Min', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span>MEDIAN REFERENCE</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded-xs">
                    {features.pH_Median}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.001"
                  value={features.pH_Median}
                  onChange={(e) => handleChange('pH_Median', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Quadrant 3: Dissolved Oxygen */}
          <div className="neo-box-sm p-4 bg-[var(--neo-surface-alt)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[var(--neo-border)]">
              <span className="neo-badge bg-[var(--neo-green)] text-black">
                DISSOLVED OXYGEN
              </span>
              <span className="font-mono text-[10px] font-bold text-[var(--neo-text-dim)]">
                mg/L (norm)
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span>PEAK (MAX)</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded-xs">
                    {features.Dissolved_oxygen_Max}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.0"
                  step="0.001"
                  value={features.Dissolved_oxygen_Max}
                  onChange={(e) => handleChange('Dissolved_oxygen_Max', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span>MEAN VALUE</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded-xs">
                    {features.Dissolved_oxygen_Mean}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.001"
                  value={features.Dissolved_oxygen_Mean}
                  onChange={(e) => handleChange('Dissolved_oxygen_Mean', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span>CRITICAL FLOOR (MIN)</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded-xs">
                    {features.Dissolved_oxygen_Min}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.03"
                  max="1.0"
                  step="0.001"
                  value={features.Dissolved_oxygen_Min}
                  onChange={(e) => handleChange('Dissolved_oxygen_Min', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Quadrant 4: Water Temperature */}
          <div className="neo-box-sm p-4 bg-[var(--neo-surface-alt)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[var(--neo-border)]">
              <span className="neo-badge bg-[var(--neo-orange)] text-black">
                WATER TEMPERATURE
              </span>
              <span className="font-mono text-[10px] font-bold text-[var(--neo-text-dim)]">
                °C (norm)
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span>MEAN TEMPERATURE</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded-xs">
                    {features.Temperature_Mean}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.001"
                  value={features.Temperature_Mean}
                  onChange={(e) => handleChange('Temperature_Mean', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span>MINIMUM TEMPERATURE</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded-xs">
                    {features.Temperature_Min}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="1.0"
                  step="0.001"
                  value={features.Temperature_Min}
                  onChange={(e) => handleChange('Temperature_Min', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span>MAXIMUM TEMPERATURE</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded-xs">
                    {features.Temperature_Max}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.09"
                  max="1.0"
                  step="0.001"
                  value={features.Temperature_Max}
                  onChange={(e) => handleChange('Temperature_Max', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Callout */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-[var(--neo-border)]">
          <p className="text-xs font-mono text-[var(--neo-text-dim)] text-center sm:text-left">
            [SYS READY] 12-DIMENSIONAL VECTOR MAPPED TO USGS GEORGIA SPATIAL NETWORK
          </p>

          <button
            type="submit"
            disabled={loading}
            className="neo-btn neo-btn-primary w-full sm:w-auto px-8 py-3 text-sm font-black uppercase tracking-wider space-x-2 shadow-[5px_5px_0px_0px_var(--neo-shadow)]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin stroke-[2.5]" />
                <span>COMPUTING INFERENCE...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current stroke-[2]" />
                <span>RUN QUALITY ANALYSIS</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
