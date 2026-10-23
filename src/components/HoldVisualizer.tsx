import React from 'react';
import { Ship, Scale, Anchor, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ReportHeader, TallyRow } from '../types/tally';

interface HoldVisualizerProps {
  header: ReportHeader;
  rows: TallyRow[];
}

export const HoldVisualizer: React.FC<HoldVisualizerProps> = ({ header, rows }) => {
  // Aggregate hold totals for 3 holds
  const totals = rows.reduce(
    (acc, row) => {
      acc.h1 += Number(row.hold1) || 0;
      acc.h2 += Number(row.hold2) || 0;
      acc.h3 += Number(row.hold3) || 0;
      return acc;
    },
    { h1: 0, h2: 0, h3: 0 }
  );

  const grandTotalBags = totals.h1 + totals.h2 + totals.h3;
  // 1 big bag = 1,200 T (1200 kg)
  const bagWeightMt = (header.bagWeightKg || 1200) / 1000;
  const grandTotalMt = grandTotalBags * bagWeightMt;

  const caps = header.holdCapacities || {
    hold1: 2200,
    hold2: 3600,
    hold3: 2800,
  };

  const holds = [
    {
      num: 1,
      name: 'HOLD N° 1 (Proue / Fore)',
      bags: totals.h1,
      capacity: caps.hold1,
      color: 'from-blue-500 to-blue-600',
      border: 'border-blue-400',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-900',
    },
    {
      num: 2,
      name: 'HOLD N° 2 (Centre / Midship)',
      bags: totals.h2,
      capacity: caps.hold2,
      color: 'from-emerald-500 to-emerald-600',
      border: 'border-emerald-400',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-900',
    },
    {
      num: 3,
      name: 'HOLD N° 3 (Poupe / Aft)',
      bags: totals.h3,
      capacity: caps.hold3,
      color: 'from-purple-500 to-purple-600',
      border: 'border-purple-400',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-900',
    },
  ];

  // Trim and Fore/Aft balance calculation for 3 holds
  const forwardLoad = totals.h1;
  const aftLoad = totals.h3;
  const balanceDiff = Math.abs(forwardLoad - aftLoad);
  const balanceRatio =
    grandTotalBags > 0
      ? Math.round((Math.min(forwardLoad, aftLoad) / Math.max(forwardLoad, aftLoad || 1)) * 100)
      : 100;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-slate-900 text-amber-400 flex items-center justify-center">
            <Ship className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              Plan d'arrimage des Cales (3 Cales) · {header.unloadingPlace}
            </h3>
            <p className="text-xs text-slate-500">
              Cargaison : {header.commodity} · <strong className="text-amber-700">1 Big Bag = {bagWeightMt.toFixed(3)} T</strong>
            </p>
          </div>
        </div>

        {/* Quick balance badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Équilibre Cale 1 (AV) / Cale 3 (AR) :</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
              balanceRatio >= 70 || grandTotalBags === 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {balanceRatio >= 70 || grandTotalBags === 0 ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            {grandTotalBags === 0
              ? 'À quai'
              : `${balanceRatio}% équilibre (${forwardLoad} sacs AV / ${aftLoad} sacs AR)`}
          </span>
        </div>
      </div>

      {/* Ship Hull Graphic Representation with 3 holds */}
      <div className="relative bg-slate-900 text-white rounded-lg p-4 sm:p-5 overflow-hidden">
        {/* Vessel structure lines */}
        <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1 text-slate-300">
            <Anchor className="w-3.5 h-3.5 text-amber-400" />
            <span>PROUE (FORE / AVANT)</span>
          </div>
          <span className="font-semibold text-amber-400 tracking-wider">
            NAVIRE: {header.unloadingPlace} (3 CALES)
          </span>
          <div className="flex items-center gap-1 text-slate-300">
            <Ship className="w-3.5 h-3.5 text-amber-400" />
            <span>POUPE (AFT / ARRIÈRE)</span>
          </div>
        </div>

        {/* 3 Holds grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {holds.map((hold) => {
            const fillPct = Math.min(100, Math.round((hold.bags / hold.capacity) * 100));
            const holdMt = (hold.bags * bagWeightMt).toFixed(3);

            return (
              <div
                key={hold.num}
                className="bg-slate-800/80 border border-slate-700/80 rounded p-3.5 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Hold Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs uppercase tracking-tight text-amber-300">
                    CALE {hold.num}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Capacité: {hold.capacity} sacs
                  </span>
                </div>

                {/* Hold Quantity Display */}
                <div className="my-2 text-center">
                  <div className="text-3xl font-black font-mono tracking-tight text-white">
                    {hold.bags.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium">
                    sacs chargés
                  </div>
                  <div className="text-xs font-mono text-amber-400 font-bold mt-1">
                    {holdMt} T ({bagWeightMt} T/sac)
                  </div>
                </div>

                {/* Visual Hold Fill Level Bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Remplissage estimé</span>
                    <span className="font-mono text-slate-200">{fillPct}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${hold.color} transition-all duration-300`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                {/* Percentage of loaded cargo */}
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex justify-between items-center text-[11px] text-slate-400">
                  <span>Part cargaison navire :</span>
                  <span className="font-semibold text-slate-200">
                    {grandTotalBags > 0
                      ? `${Math.round((hold.bags / grandTotalBags) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Summary Footer inside ship view */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Total Cales 1, 2, 3 : <strong className="text-white font-mono">{grandTotalBags.toLocaleString()} sacs</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Tonnage Total : <strong className="text-amber-400 font-mono">{grandTotalMt.toFixed(3)} T</strong></span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-sans">
            Port de destination : <strong className="text-white">{header.destination}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
