'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { WaterPredictionForm } from '../components/WaterPredictionForm';
import { PredictionResultCard } from '../components/PredictionResultCard';
import { ModelComparisonTable } from '../components/ModelComparisonTable';
import { BatchUploadView } from '../components/BatchUploadView';
import { ModelBenchmarkView } from '../components/ModelBenchmarkView';
import { StationsView } from '../components/StationsView';
import {
  WaterFeatures,
  ModelType,
  PredictResponse,
  CompareAllResponse,
  PresetSample,
  Station
} from '../lib/types';
import {
  checkBackendHealth,
  getPresetSamples,
  getStations,
  predictWaterQuality,
  compareAllModels
} from '../lib/api';
import {
  AlertOctagon,
  RefreshCw,
  Layers,
  Zap,
  Radio
} from 'lucide-react';
import gsap from 'gsap';

const DEFAULT_FEATURES: WaterFeatures = {
  Specific_conductance_Max: 0.0023,
  pH_Max: 0.9103,
  pH_Min: 0.0020,
  Specific_conductance_Min: 0.0021,
  Specific_conductance_Mean: 0.5789,
  Dissolved_oxygen_Max: 0.8659,
  Dissolved_oxygen_Mean: 0.6515,
  Dissolved_oxygen_Min: 0.6614,
  Temperature_Mean: 0.5719,
  Temperature_Min: 0.5737,
  Temperature_Max: 0.5436,
  pH_Median: 0.6667,
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'predict' | 'compare' | 'batch' | 'benchmark' | 'stations'>('predict');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [features, setFeatures] = useState<WaterFeatures>(DEFAULT_FEATURES);
  const [selectedModel, setSelectedModel] = useState<ModelType>('random_forest');

  const [predictionResult, setPredictionResult] = useState<PredictResponse | null>(null);
  const [compareResult, setCompareResult] = useState<CompareAllResponse | null>(null);

  const [presetSamples, setPresetSamples] = useState<PresetSample[]>([]);
  const [stations, setStations] = useState<Station[]>([]);

  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mainContentRef = useRef<HTMLDivElement>(null);

  // Set initial data-theme on HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Tab switch GSAP animation
  useEffect(() => {
    if (mainContentRef.current) {
      gsap.fromTo(
        mainContentRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  // Initial backend health & asset loader
  const fetchInitialData = async () => {
    try {
      const health = await checkBackendHealth();
      setBackendOnline(health.status === 'healthy');

      const [presetsData, stationsData] = await Promise.all([
        getPresetSamples().catch(() => []),
        getStations().catch(() => []),
      ]);

      setPresetSamples(presetsData);
      setStations(stationsData);
      setError(null);
    } catch (err: unknown) {
      console.warn('FastAPI connection issue:', err);
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'compare') {
        const res = await compareAllModels(features);
        setCompareResult(res);
      } else {
        const res = await predictWaterQuality(features, selectedModel);
        setPredictionResult(res);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Inference execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: PresetSample) => {
    setFeatures(preset.values);
    setLoading(true);
    setError(null);

    if (activeTab === 'compare') {
      compareAllModels(preset.values)
        .then((res) => setCompareResult(res))
        .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Comparison failed'))
        .finally(() => setLoading(false));
    } else {
      predictWaterQuality(preset.values, selectedModel)
        .then((res) => setPredictionResult(res))
        .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Prediction failed'))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* Neo-Brutalist Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setError(null);
        }}
        backendOnline={backendOnline}
        onRefreshHealth={fetchInitialData}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Offline Warning Banner */}
        {backendOnline === false && (
          <div className="neo-box p-4 bg-[var(--neo-yellow)] text-black border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5 text-[var(--neo-yellow)] stroke-[2.5]" />
              </div>
              <div className="text-xs">
                <span className="font-black uppercase block">FASTAPI BACKEND DISCONNECTED</span>
                <span className="text-[11px] font-medium text-neutral-800">
                  Ensure the FastAPI telemetry server is active on <strong className="underline">http://localhost:8000</strong>.
                </span>
              </div>
            </div>
            <button
              onClick={fetchInitialData}
              className="neo-btn bg-black text-white px-3.5 py-1.5 text-xs font-bold space-x-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>RECONNECT</span>
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="neo-box p-4 bg-[var(--neo-red)] text-white border-2 border-black flex items-center space-x-3 text-xs font-mono font-bold">
            <AlertOctagon className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span>ERROR ENCOUNTERED: {error}</span>
          </div>
        )}

        {/* Dynamic Tab Stage with GSAP Transition */}
        <div ref={mainContentRef}>
          {/* TAB 1: Single Predictor */}
          {activeTab === 'predict' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <WaterPredictionForm
                  features={features}
                  setFeatures={setFeatures}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  presetSamples={presetSamples}
                  onSubmit={handlePredict}
                  loading={loading}
                  onSelectPreset={handleSelectPreset}
                />
              </div>

              <div className="lg:col-span-5 space-y-5">
                {predictionResult ? (
                  <PredictionResultCard data={predictionResult} />
                ) : (
                  <div className="neo-box p-8 text-center space-y-4 bg-[var(--neo-surface)]">
                    <div className="w-14 h-14 bg-[var(--neo-yellow)] text-black border-2 border-black shadow-[3px_3px_0px_0px_var(--neo-shadow)] mx-auto flex items-center justify-center">
                      <Radio className="w-7 h-7 stroke-[2.5] animate-pulse" />
                    </div>
                    <div>
                      <span className="neo-badge bg-[var(--neo-cyan)] text-black mb-2">
                        TELEMETRY STANDBY
                      </span>
                      <h3 className="font-black text-base uppercase tracking-tight text-[var(--neo-text)]">
                        Ready For Water Analysis
                      </h3>
                      <p className="text-xs text-[var(--neo-text-muted)] max-w-xs mx-auto mt-2 leading-relaxed font-mono">
                        Select a field profile above or calibrate the 12 sensor parameters, then press <strong className="text-[var(--neo-text)] uppercase font-black">Run Quality Analysis</strong>.
                      </p>
                    </div>

                    <div className="pt-2 border-t-2 border-[var(--neo-border)] flex items-center justify-center space-x-3 text-[11px] font-mono text-[var(--neo-text-dim)] font-bold">
                      <span>• RANDOM FOREST</span>
                      <span>• XGBOOST</span>
                      <span>• LOGISTIC REG</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Multi-Model Consensus */}
          {activeTab === 'compare' && (
            <div className="space-y-6">
              <div className="neo-box p-6 bg-[var(--neo-surface)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="neo-badge bg-[var(--neo-purple)] text-black">
                      CONSENSUS PIPELINE
                    </span>
                    <span className="font-mono text-[11px] text-[var(--neo-text-dim)]">
                      PARALLEL VOTING ENGINE
                    </span>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-[var(--neo-text)]">
                    Multi-Model Consensus Pipeline
                  </h3>
                  <p className="text-xs text-[var(--neo-text-muted)] mt-0.5">
                    Evaluates the 12-dimensional telemetry vector across Random Forest, XGBoost, and Logistic Regression concurrently.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePredict()}
                  disabled={loading}
                  className="neo-btn neo-btn-primary px-6 py-2.5 text-xs font-black uppercase tracking-wider space-x-2 shrink-0 disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5 fill-current stroke-[2]" />
                  <span>{loading ? 'EVALUATING MODELS...' : 'RUN CONSENSUS COMPARISON'}</span>
                </button>
              </div>

              {compareResult ? (
                <ModelComparisonTable data={compareResult} />
              ) : (
                <div className="neo-box p-12 text-center text-[var(--neo-text-muted)] space-y-3 bg-[var(--neo-surface)]">
                  <div className="w-12 h-12 bg-[var(--neo-yellow)] text-black border-2 border-black shadow-[3px_3px_0px_0px_var(--neo-shadow)] mx-auto flex items-center justify-center">
                    <Layers className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight text-[var(--neo-text)]">
                    Model Consensus Standing By
                  </h3>
                  <p className="text-xs max-w-sm mx-auto font-mono">
                    Click &ldquo;RUN CONSENSUS COMPARISON&rdquo; to benchmark probabilities, anomaly index, and model agreement rates simultaneously.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Batch CSV Ingestion */}
          {activeTab === 'batch' && <BatchUploadView />}

          {/* TAB 4: Model Benchmarks */}
          {activeTab === 'benchmark' && <ModelBenchmarkView />}

          {/* TAB 5: 37 USGS Stations */}
          {activeTab === 'stations' && <StationsView stations={stations} />}
        </div>
      </main>

      {/* Neo-Brutalist Footer */}
      <footer className="mt-auto border-t-[3px] border-[var(--neo-border)] bg-[var(--neo-surface)] py-6 text-xs text-[var(--neo-text-muted)] font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2 font-bold">
            <span className="neo-badge bg-[var(--neo-yellow)] text-black">AQUAGUARD</span>
            <span>© 2026 USGS Spatio-Temporal Water Quality Detection System</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-[10px] font-extrabold uppercase">
            <span className="neo-badge bg-[var(--neo-surface-alt)] text-[var(--neo-text)]">NEO-BRUTALISM UI</span>
            <span className="neo-badge bg-[var(--neo-surface-alt)] text-[var(--neo-text)]">FASTAPI 8000</span>
            <span className="neo-badge bg-[var(--neo-surface-alt)] text-[var(--neo-text)]">GSAP MOTION</span>
            <span className="neo-badge bg-[var(--neo-surface-alt)] text-[var(--neo-text)]">NEXT.JS 16</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
