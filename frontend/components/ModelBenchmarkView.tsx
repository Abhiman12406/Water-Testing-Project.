'use client';

import React, { useEffect, useRef } from 'react';
import {
  FileCode,
  Database
} from 'lucide-react';
import gsap from 'gsap';

export const ModelBenchmarkView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.benchmark-card'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, []);

  const models = [
    {
      id: 'rf',
      name: 'Random Forest Classifier',
      file: 'random_forest_model.pkl',
      size: '1.88 MB',
      trainAcc: '99.97%',
      testAcc: '99.12%',
      rocAuc: '0.9984',
      badge: 'TOP GENERALIZATION',
      badgeColor: 'bg-[var(--neo-green)]',
      barColor: 'bg-[var(--neo-green)]',
      desc: '100 Bootstrap Decision Trees with Gini Impurity partitioning and maximum depth unconstrained.',
    },
    {
      id: 'xgb',
      name: 'XGBoost Classifier',
      file: 'xgboost_model.pkl',
      size: '183 KB',
      trainAcc: '99.95%',
      testAcc: '99.04%',
      rocAuc: '0.9980',
      badge: 'SPEED & LATENCY',
      badgeColor: 'bg-[var(--neo-cyan)]',
      barColor: 'bg-[var(--neo-cyan)]',
      desc: 'Gradient boosted trees optimized for rapid sub-millisecond inference and L2 regularization.',
    },
    {
      id: 'lr',
      name: 'Logistic Regression',
      file: 'logistic_regression_model.pkl',
      size: '813 Bytes',
      trainAcc: '95.42%',
      testAcc: '95.10%',
      rocAuc: '0.9782',
      badge: 'LINEAR BASELINE',
      badgeColor: 'bg-[var(--neo-purple)]',
      barColor: 'bg-[var(--neo-purple)]',
      desc: 'L2-regularized probabilistic generalized linear model with standard Newton-CG solver.',
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Intro Header */}
      <div className="neo-box p-6 bg-[var(--neo-surface)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-[var(--neo-border)]">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="neo-badge bg-[var(--neo-yellow)] text-black">
                BENCHMARK METRICS
              </span>
              <span className="font-mono text-[11px] text-[var(--neo-text-dim)]">
                80/20 STRATIFIED SPLIT
              </span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">
              Supervised Classifier Intelligence
            </h2>
            <p className="text-xs text-[var(--neo-text-muted)] mt-1 max-w-2xl leading-relaxed">
              Evaluation metrics across 3 machine learning models trained on 26,085 spatio-temporal hydrological readings from 37 USGS monitoring stations.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-[var(--neo-surface-alt)] p-3 rounded-sm border-2 border-[var(--neo-border)] shadow-[2px_2px_0px_0px_var(--neo-shadow)] shrink-0 font-mono">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--neo-text-dim)] block">
                TOTAL SAMPLES
              </span>
              <span className="font-black text-sm text-[var(--neo-text)]">
                26,085
              </span>
            </div>
            <div className="h-6 w-0.5 bg-[var(--neo-border)]" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--neo-text-dim)] block">
                CHANNELS
              </span>
              <span className="font-black text-sm text-[var(--neo-text)]">
                12 VECTORS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Models Comparative Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {models.map((m) => (
          <div
            key={m.id}
            className="benchmark-card neo-box p-5 bg-[var(--neo-surface)] neo-interactive flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`neo-badge ${m.badgeColor} text-black`}>
                  {m.badge}
                </span>
                <span className="neo-badge bg-black text-white text-[10px]">
                  <FileCode className="w-3 h-3 mr-1" />
                  {m.size}
                </span>
              </div>

              <h3 className="text-base font-black uppercase tracking-tight">{m.name}</h3>
              <p className="text-[11px] font-mono text-[var(--neo-text-dim)] mt-0.5 mb-2">{m.file}</p>
              <p className="text-xs text-[var(--neo-text-muted)] leading-relaxed mb-4">{m.desc}</p>
            </div>

            <div className="space-y-3 pt-3 border-t-2 border-[var(--neo-border)] text-xs font-mono">
              <div>
                <div className="flex justify-between items-center mb-1 font-bold">
                  <span className="text-[var(--neo-text-dim)]">TEST ACCURACY</span>
                  <span className="font-black text-sm text-[var(--neo-text)]">{m.testAcc}</span>
                </div>
                <div className="w-full h-3 bg-white dark:bg-black border border-[var(--neo-border)] rounded-xs overflow-hidden">
                  <div
                    className={`h-full ${m.barColor}`}
                    style={{ width: m.testAcc }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 font-bold">
                  <span className="text-[var(--neo-text-dim)]">ROC-AUC SCORE</span>
                  <span className="font-black text-sm text-[var(--neo-text)]">{m.rocAuc}</span>
                </div>
                <div className="w-full h-3 bg-white dark:bg-black border border-[var(--neo-border)] rounded-xs overflow-hidden">
                  <div
                    className={`h-full ${m.barColor}`}
                    style={{ width: `${parseFloat(m.rocAuc) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 text-[11px] font-bold text-[var(--neo-text-dim)] border-t border-[var(--neo-border)]/20">
                <span>TRAINING ACCURACY:</span>
                <span className="text-[var(--neo-text)]">{m.trainAcc}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dataset Architecture Specs */}
      <div className="neo-box p-6 bg-[var(--neo-surface)] space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b-2 border-[var(--neo-border)]">
          <Database className="w-4 h-4 text-black dark:text-white stroke-[2.5]" />
          <h3 className="text-sm font-black uppercase tracking-tight">
            Spatio-Temporal Pipeline Architectural Blueprint
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-sm neo-box-sm bg-[var(--neo-surface-alt)] font-mono">
            <span className="text-[10px] uppercase font-bold text-[var(--neo-text-dim)] block">
              [01] TEMPORAL HORIZON
            </span>
            <span className="font-black text-sm text-[var(--neo-text)] block mt-1">
              705 Contiguous Days
            </span>
            <span className="text-[11px] text-[var(--neo-text-dim)] mt-1 block">Jan 2016 – Jan 2018</span>
          </div>

          <div className="p-4 rounded-sm neo-box-sm bg-[var(--neo-surface-alt)] font-mono">
            <span className="text-[10px] uppercase font-bold text-[var(--neo-text-dim)] block">
              [02] MONITORING NETWORK
            </span>
            <span className="font-black text-sm text-[var(--neo-text)] block mt-1">
              37 Stream Sites
            </span>
            <span className="text-[11px] text-[var(--neo-text-dim)] mt-1 block">Georgia Watershed</span>
          </div>

          <div className="p-4 rounded-sm neo-box-sm bg-[var(--neo-surface-alt)] font-mono">
            <span className="text-[10px] uppercase font-bold text-[var(--neo-text-dim)] block">
              [03] PARTITION SPLIT
            </span>
            <span className="font-black text-sm text-[var(--neo-text)] block mt-1">
              423 / 282 Days
            </span>
            <span className="text-[11px] text-[var(--neo-text-dim)] mt-1 block">60% Train / 40% Test</span>
          </div>

          <div className="p-4 rounded-sm neo-box-sm bg-[var(--neo-surface-alt)] font-mono">
            <span className="text-[10px] uppercase font-bold text-[var(--neo-text-dim)] block">
              [04] NORMALIZATION
            </span>
            <span className="font-black text-sm text-[var(--neo-text)] block mt-1">
              StandardScaler
            </span>
            <span className="text-[11px] text-[var(--neo-text-dim)] mt-1 block">Zero-mean, unit-variance</span>
          </div>
        </div>
      </div>
    </div>
  );
};
