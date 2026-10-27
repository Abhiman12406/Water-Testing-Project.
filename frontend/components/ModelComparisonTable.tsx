'use client';

import React, { useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Vote
} from 'lucide-react';
import { CompareAllResponse } from '../lib/types';
import gsap from 'gsap';

interface ModelComparisonTableProps {
  data: CompareAllResponse;
}

export const ModelComparisonTable: React.FC<ModelComparisonTableProps> = ({ data }) => {
  const isConsensusAnomaly = data.consensus_prediction === 1;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.model-bench-card'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }, [data]);

  const modelMetadata: Record<
    string,
    { title: string; metricBadge: string; spec: string; color: string }
  > = {
    random_forest: {
      title: 'Random Forest',
      metricBadge: '99.1% ACC • 0.998 AUC',
      spec: '100 Bootstrap Decision Trees with Gini impurity splitting.',
      color: 'bg-[var(--neo-green)]',
    },
    xgboost: {
      title: 'XGBoost',
      metricBadge: '99.0% ACC • 0.998 AUC',
      spec: 'Gradient Boosted Trees with second-order gradient expansion.',
      color: 'bg-[var(--neo-cyan)]',
    },
    logistic_regression: {
      title: 'Logistic Regression',
      metricBadge: '95.1% ACC • 0.978 AUC',
      spec: 'L2-regularized Generalized Linear Model with sigmoid link.',
      color: 'bg-[var(--neo-purple)]',
    },
    ensemble: {
      title: 'Ensemble Consensus',
      metricBadge: '45/45/10 SOFT VOTING',
      spec: 'Probability-weighted consensus integrating all 3 models.',
      color: 'bg-[var(--neo-yellow)]',
    },
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* 1. Consensus Outcome Hero Banner */}
      <div className="neo-box p-6 bg-[var(--neo-surface)] space-y-4">
        <div
          className={`p-4 rounded-sm border-2 border-[var(--neo-border)] shadow-[3px_3px_0px_0px_var(--neo-shadow)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isConsensusAnomaly
              ? 'bg-[var(--neo-red)] text-white'
              : 'bg-[var(--neo-green)] text-black'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 bg-black text-white rounded-xs border-2 border-[var(--neo-border)] flex items-center justify-center shrink-0">
              {isConsensusAnomaly ? (
                <ShieldAlert className="w-7 h-7 text-[var(--neo-red)] stroke-[2.5]" />
              ) : (
                <ShieldCheck className="w-7 h-7 text-[var(--neo-green)] stroke-[2.5]" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-black text-white rounded-xs">
                  CONSENSUS DECISION
                </span>
                <span className="font-mono text-[10px] font-extrabold uppercase px-1.5 py-0.5 border border-black bg-white text-black rounded-xs">
                  {data.risk_level}
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mt-1">
                {data.consensus_label}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 bg-black text-white px-3.5 py-2 rounded-xs border-2 border-[var(--neo-border)] shrink-0 font-mono">
            <Vote className="w-4 h-4 text-[var(--neo-yellow)] stroke-[2.5]" />
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                MODEL AGREEMENT
              </span>
              <span className="text-xs font-black text-white">
                {(data.anomaly_agreement_ratio * 100).toFixed(0)}% UNANIMOUS
              </span>
            </div>
          </div>
        </div>

        <div className="neo-box-inset p-3.5 text-xs font-medium leading-relaxed text-[var(--neo-text)]">
          <p>{data.summary}</p>
        </div>
      </div>

      {/* 2. 4-Model Comparative Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(data.results).map(([key, res]) => {
          const meta = modelMetadata[key] || {
            title: res.name,
            metricBadge: 'PICKLE CLASSIFIER',
            spec: '',
            color: 'bg-[var(--neo-yellow)]',
          };
          const isAnomaly = res.prediction === 1;

          return (
            <div
              key={key}
              className="model-bench-card neo-box-sm p-5 bg-[var(--neo-surface)] neo-interactive flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2.5">
                  <span className={`neo-badge ${meta.color} text-black`}>
                    {meta.title}
                  </span>
                  <span
                    className={`neo-badge ${
                      isAnomaly
                        ? 'bg-[var(--neo-red)] text-white'
                        : 'bg-[var(--neo-green)] text-black'
                    }`}
                  >
                    {isAnomaly ? 'ANOMALY' : 'SAFE'}
                  </span>
                </div>

                <div className="font-mono text-[11px] font-extrabold text-[var(--neo-text)] mb-1">
                  {meta.metricBadge}
                </div>
                <p className="text-[11px] text-[var(--neo-text-muted)] leading-relaxed mb-4">
                  {meta.spec}
                </p>
              </div>

              <div className="space-y-2.5 pt-3 border-t-2 border-[var(--neo-border)] text-xs">
                <div className="flex justify-between items-center font-mono font-bold">
                  <span className="text-[11px] text-[var(--neo-text-dim)] uppercase">ANOMALY INDEX</span>
                  <span className="px-1.5 py-0.5 bg-black text-white rounded-xs text-[11px]">
                    {(res.probability_anomaly * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="w-full h-2.5 bg-white dark:bg-black border border-[var(--neo-border)] rounded-xs overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isAnomaly ? 'bg-[var(--neo-red)]' : 'bg-[var(--neo-green)]'
                    }`}
                    style={{ width: `${res.probability_anomaly * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono font-bold text-[var(--neo-text-dim)]">
                  <span>CONF: {(res.confidence * 100).toFixed(1)}%</span>
                  <span>{res.risk_level}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
