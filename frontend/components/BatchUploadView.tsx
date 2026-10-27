'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  Layers
} from 'lucide-react';
import { ModelType, BatchUploadResult } from '../lib/types';
import { uploadCSVDataset } from '../lib/api';
import gsap from 'gsap';

export const BatchUploadView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>('random_forest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BatchUploadResult | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      gsap.fromTo(
        resultsRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a valid CSV dataset before initiating batch processing.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await uploadCSVDataset(file, selectedModel);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Batch dataset processing failed.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent =
      'Specific_conductance_Max,pH_Max,pH_Min,Specific_conductance_Min,Specific_conductance_Mean,Dissolved_oxygen_Max,Dissolved_oxygen_Mean,Dissolved_oxygen_Min,Temperature_Mean,Temperature_Min,Temperature_Max,pH_Median\n' +
      '0.0023,0.9103,0.0020,0.0021,0.5789,0.8659,0.6515,0.6614,0.5719,0.5737,0.5436,0.6667\n' +
      '0.7407,0.9231,0.6935,0.7168,0.4737,0.9024,0.4545,0.3543,0.6031,0.5801,0.6395,0.7130\n' +
      '0.0011,0.8846,0.0011,0.0011,0.6776,0.8780,0.6818,0.6220,0.3062,0.3045,0.3110,0.6481\n' +
      '0.0141,0.8590,0.0012,0.0039,0.6974,0.8659,0.5758,0.5512,0.5437,0.5481,0.5407,0.6481\n' +
      '0.0042,0.8974,0.0013,0.0033,0.6579,0.8659,0.5909,0.5748,0.5562,0.5577,0.5494,0.6574\n' +
      '0.3500,0.9500,0.1200,0.2800,0.6200,0.7500,0.3800,0.1800,0.8500,0.7900,0.8900,0.6900\n' +
      '0.0028,0.9231,0.0024,0.0026,0.5658,0.8659,0.6364,0.6378,0.5656,0.5673,0.5407,0.6667\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'usgs_water_telemetry_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Upload Panel */}
      <div className="neo-box p-6 bg-[var(--neo-surface)] space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-[var(--neo-border)] gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="neo-badge bg-[var(--neo-yellow)] text-black">
                BULK INGESTION
              </span>
              <span className="font-mono text-[11px] text-[var(--neo-text-dim)]">
                RFC 4180 COMPLIANT
              </span>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">
              Batch Telemetry Dataset Ingestion
            </h3>
            <p className="text-xs text-[var(--neo-text-muted)] mt-0.5">
              Ingest multi-row USGS water sensor telemetry files for bulk anomaly classification and scoring.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadSampleCSV}
            className="neo-btn bg-[var(--neo-cyan)] text-black px-3.5 py-1.5 text-xs font-bold space-x-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>DOWNLOAD TEMPLATE CSV</span>
          </button>
        </div>

        {/* Form Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-[var(--neo-text-dim)] mb-1.5">
              [1] SELECT CLASSIFIER
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as ModelType)}
              className="w-full neo-input px-3 py-2 text-xs font-bold cursor-pointer bg-[var(--neo-surface)]"
            >
              <option value="random_forest">Random Forest (99.1% Acc)</option>
              <option value="xgboost">XGBoost Classifier (99.0% Acc)</option>
              <option value="logistic_regression">Logistic Regression (95.1% Acc)</option>
              <option value="ensemble">Ensemble Consensus (Soft Voting)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono font-bold uppercase text-[var(--neo-text-dim)] mb-1.5">
              [2] ATTACH TELEMETRY FILE (.CSV)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full text-xs font-mono font-bold neo-input p-1.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-xs file:border-2 file:border-[var(--neo-border)] file:text-xs file:font-black file:bg-[var(--neo-yellow)] file:text-black cursor-pointer"
              />
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || loading}
                className="neo-btn neo-btn-primary px-6 py-2.5 text-xs font-black uppercase tracking-wider space-x-1.5 shrink-0 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
                    <span>PARSING...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>PROCESS DATASET</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-sm bg-[var(--neo-red)] text-white border-2 border-[var(--neo-border)] shadow-[2px_2px_0px_0px_var(--neo-shadow)] text-xs font-bold flex items-center space-x-2.5 font-mono">
            <AlertOctagon className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span>ERROR: {error}</span>
          </div>
        )}
      </div>

      {/* Results View */}
      {result && (
        <div ref={resultsRef} className="neo-box p-6 bg-[var(--neo-surface)] space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-[var(--neo-border)] gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="neo-badge bg-[var(--neo-green)] text-black">
                  BATCH COMPLETE
                </span>
                <span className="font-mono text-xs font-bold text-[var(--neo-text-dim)]">
                  CLASSIFIER: {result.model_used.toUpperCase()}
                </span>
              </div>
              <h3 className="text-base font-black uppercase tracking-tight mt-1">
                {result.filename}
              </h3>
            </div>

            <div className="neo-badge bg-black text-white text-xs px-3 py-1 font-mono">
              {result.total_rows} RECORDS ANALYZED
            </div>
          </div>

          {/* Metric KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-sm neo-box-sm bg-[var(--neo-green-light)] text-black border-2 border-black">
              <div className="flex items-center justify-between font-mono text-xs font-bold uppercase mb-1">
                <span>Safe Nominal Water</span>
                <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <div className="text-3xl font-black font-mono mt-1">
                {result.normal_samples}
              </div>
              <div className="text-[11px] font-bold font-mono opacity-80 mt-1">
                {((result.normal_samples / result.total_rows) * 100).toFixed(1)}% OF DATASET
              </div>
            </div>

            <div className="p-4 rounded-sm neo-box-sm bg-[var(--neo-red-light)] text-black border-2 border-black">
              <div className="flex items-center justify-between font-mono text-xs font-bold uppercase mb-1">
                <span>Flagged Anomalies</span>
                <AlertOctagon className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <div className="text-3xl font-black font-mono mt-1">
                {result.anomaly_samples}
              </div>
              <div className="text-[11px] font-bold font-mono opacity-80 mt-1">
                {result.anomaly_percentage}% CONTAMINATION
              </div>
            </div>

            <div className="p-4 rounded-sm neo-box-sm bg-[var(--neo-yellow-light)] text-black border-2 border-black">
              <div className="flex items-center justify-between font-mono text-xs font-bold uppercase mb-1">
                <span>Contamination Rate</span>
                <Layers className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <div className="text-3xl font-black font-mono mt-1">
                {result.anomaly_percentage}%
              </div>
              <div className="w-full h-2.5 bg-white border border-black rounded-xs overflow-hidden mt-2">
                <div
                  className="h-full bg-[var(--neo-red)]"
                  style={{ width: `${result.anomaly_percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto rounded-sm border-2 border-[var(--neo-border)] shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[var(--neo-yellow)] text-black uppercase text-[11px] font-black border-b-2 border-[var(--neo-border)]">
                <tr>
                  <th className="px-4 py-3"># ROW</th>
                  <th className="px-4 py-3">STATUS</th>
                  <th className="px-4 py-3">ANOMALY INDEX</th>
                  <th className="px-4 py-3">RISK CATEGORY</th>
                  <th className="px-4 py-3">MODEL CONFIDENCE</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--neo-border)] bg-[var(--neo-surface)]">
                {result.sample_results.map((row, idx) => {
                  const isAnomaly = row.prediction === 1;
                  return (
                    <tr key={idx} className="hover:bg-[var(--neo-surface-alt)] transition-colors">
                      <td className="px-4 py-2.5 font-bold">#{idx + 1}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`neo-badge ${
                            isAnomaly
                              ? 'bg-[var(--neo-red)] text-white'
                              : 'bg-[var(--neo-green)] text-black'
                          }`}
                        >
                          {isAnomaly ? 'ANOMALY' : 'SAFE'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-bold">
                        {(row.probability_anomaly * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2.5 font-sans font-bold">{row.risk_level}</td>
                      <td className="px-4 py-2.5 font-black">
                        {(row.confidence * 100).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
