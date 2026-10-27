'use client';

import React, { useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle
} from 'lucide-react';
import { PredictResponse } from '../lib/types';
import gsap from 'gsap';

interface PredictionResultCardProps {
  data: PredictResponse;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({ data }) => {
  const isAnomaly = data.result.prediction === 1;
  const cardRef = useRef<HTMLDivElement>(null);
  const probValRef = useRef<HTMLSpanElement>(null);
  const meterBarRef = useRef<HTMLDivElement>(null);
  const barsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      // 1. Entrance animation
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );

      // 2. Animated odometer for anomaly probability
      const targetAnomalyProb = data.result.probability_anomaly * 100;
      const counter = { val: 0 };
      if (probValRef.current) {
        gsap.to(counter, {
          val: targetAnomalyProb,
          duration: 0.7,
          ease: 'power3.out',
          onUpdate: () => {
            if (probValRef.current) {
              probValRef.current.innerText = counter.val.toFixed(1);
            }
          },
        });
      }

      // 3. Probability split bar animation
      if (meterBarRef.current) {
        gsap.fromTo(
          meterBarRef.current,
          { width: '0%' },
          { width: `${targetAnomalyProb}%`, duration: 0.7, ease: 'power3.out' }
        );
      }

      // 4. Staggered reveal for feature deviation bars
      if (barsContainerRef.current) {
        gsap.fromTo(
          barsContainerRef.current.querySelectorAll('.deviation-bar-fill'),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.5, stagger: 0.03, ease: 'power2.out', transformOrigin: 'left' }
        );
      }
    }
  }, [data]);


  return (
    <div
      ref={cardRef}
      className="neo-box p-6 bg-[var(--neo-surface)] space-y-5"
    >
      {/* 1. Verdict Banner */}
      <div
        className={`p-4 rounded-sm border-2 border-[var(--neo-border)] shadow-[3px_3px_0px_0px_var(--neo-shadow)] flex items-start justify-between ${
          isAnomaly
            ? 'bg-[var(--neo-red)] text-white'
            : 'bg-[var(--neo-green)] text-black'
        }`}
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-black text-white rounded-xs border-2 border-[var(--neo-border)] flex items-center justify-center shrink-0">
            {isAnomaly ? (
              <AlertOctagon className="w-7 h-7 text-[var(--neo-red)] stroke-[2.5]" />
            ) : (
              <CheckCircle2 className="w-7 h-7 text-[var(--neo-green)] stroke-[2.5]" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-black text-white rounded-xs">
                {data.model_used}
              </span>
              <span className="font-mono text-[10px] font-extrabold uppercase px-1.5 py-0.5 border border-black bg-white text-black rounded-xs">
                {data.result.risk_level}
              </span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight mt-1">
              {data.result.label}
            </h2>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="font-mono text-[10px] font-extrabold uppercase block opacity-90">
            CONFIDENCE
          </span>
          <span className="text-base font-black font-mono">
            {(data.result.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 2. Narrative Summary */}
      <div className="neo-box-inset p-3.5 text-xs font-medium leading-relaxed text-[var(--neo-text)]">
        <div className="flex items-center space-x-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
          <span className="font-mono font-bold uppercase text-[10px] tracking-wider text-[var(--neo-text-dim)]">
            DECISION ENGINE SUMMARY
          </span>
        </div>
        <p>{data.summary_message}</p>
      </div>

      {/* 3. Anomaly Probability Meter */}
      <div className="space-y-2 p-3.5 neo-box-sm bg-[var(--neo-surface-alt)]">
        <div className="flex justify-between items-center text-xs font-bold font-mono">
          <span className="uppercase text-[var(--neo-text-dim)]">ANOMALY PROBABILITY INDEX</span>
          <span className="px-2 py-0.5 bg-black text-white rounded-xs">
            <span ref={probValRef}>0.0</span>%
          </span>
        </div>

        <div className="w-full h-4 bg-white dark:bg-black border-2 border-[var(--neo-border)] rounded-xs overflow-hidden">
          <div
            ref={meterBarRef}
            className={`h-full border-r-2 border-[var(--neo-border)] ${
              isAnomaly ? 'bg-[var(--neo-red)]' : 'bg-[var(--neo-green)]'
            }`}
          />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-[var(--neo-text-dim)]">
          <span>0% [NOMINAL]</span>
          <span>THRESHOLD 50%</span>
          <span>100% [SEVERE]</span>
        </div>
      </div>

      {/* 4. Z-Score Baseline Variance */}
      {data.feature_contributions && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[var(--neo-border)]">
            <span className="neo-badge bg-[var(--neo-yellow)] text-black">
              USGS HISTORICAL VARIANCE
            </span>
            <span className="font-mono text-[10px] font-bold text-[var(--neo-text-dim)]">
              CRITICAL: ±1.5σ
            </span>
          </div>

          <div ref={barsContainerRef} className="space-y-2.5">
            {Object.entries(data.feature_contributions).map(([feat, zScore]) => {
              const absVal = Math.min(Math.abs(zScore), 6);
              const barWidth = `${(absVal / 6) * 100}%`;
              const isCritical = Math.abs(zScore) >= 3.0;
              const isSignificant = Math.abs(zScore) >= 1.5;

              return (
                <div key={feat} className="text-xs">
                  <div className="flex justify-between items-center mb-1 font-bold">
                    <span className="text-[11px] font-mono truncate max-w-[200px]" title={feat}>
                      {feat.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`font-mono text-[11px] px-1.5 py-0.2 rounded-xs border border-[var(--neo-border)] ${
                        isCritical
                          ? 'bg-[var(--neo-red)] text-white'
                          : isSignificant
                          ? 'bg-[var(--neo-yellow)] text-black'
                          : 'bg-[var(--neo-surface-alt)] text-[var(--neo-text)]'
                      }`}
                    >
                      {zScore > 0 ? `+${zScore}` : zScore}σ
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-white dark:bg-black border border-[var(--neo-border)] rounded-xs overflow-hidden">
                    <div
                      className={`deviation-bar-fill h-full ${
                        isCritical
                          ? 'bg-[var(--neo-red)]'
                          : isSignificant
                          ? 'bg-[var(--neo-yellow)]'
                          : 'bg-[var(--neo-cyan)]'
                      }`}
                      style={{ width: barWidth }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Field Operational Action Protocol */}
      <div className="neo-box-sm p-4 bg-[var(--neo-yellow-light)] text-black border-2 border-black space-y-2">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-black stroke-[2.5]" />
          <span className="font-extrabold text-xs uppercase tracking-wider font-mono">
            FIELD DISPATCH ACTION PROTOCOL
          </span>
        </div>
        {isAnomaly ? (
          <ul className="space-y-1.5 text-xs font-semibold leading-relaxed pl-1">
            <li className="flex items-start space-x-2">
              <span className="font-mono font-black">[!]</span>
              <span>Deploy technician for physical sensor probe recalibration at site.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-mono font-black">[!]</span>
              <span>Cross-reference electrical conductance spike against industrial runoff logs.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-mono font-black">[!]</span>
              <span>Monitor dissolved oxygen depletion curve for eutrophication or hypoxia risk.</span>
            </li>
          </ul>
        ) : (
          <p className="text-xs font-semibold leading-relaxed">
            All 12 telemetry dimensions fall within the seasonal USGS Georgia baseline confidence intervals. Continue regular telemetry recording.
          </p>
        )}
      </div>
    </div>
  );
};
