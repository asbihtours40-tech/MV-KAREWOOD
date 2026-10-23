import React from 'react';
import { Package, Truck, Scale, Activity } from 'lucide-react';
import { TallyRow, ReportHeader } from '../types/tally';

interface StatisticsBarProps {
  rows: TallyRow[];
  header: ReportHeader;
  onUpdateHeader?: (updated: Partial<ReportHeader>) => void;
}

export const StatisticsBar: React.FC<StatisticsBarProps> = ({
  rows,
  header,
  onUpdateHeader,
}) => {
  const truckCountAuto = rows.filter(
    (r) =>
      Boolean(r.truckNo?.trim()) ||
      Boolean(r.voucher?.trim()) ||
      (Number(r.hold1) || 0) +
        (Number(r.hold2) || 0) +
        (Number(r.hold3) || 0) >
        0
  ).length;

  const totalBags = rows.reduce(
    (sum, r) =>
      sum +
      (Number(r.hold1) || 0) +
      (Number(r.hold2) || 0) +
      (Number(r.hold3) || 0),
    0
  );

  // 1 big bag = 1,200 T
  const bagWeightMt = (header.bagWeightKg || 1200) / 1000;
  const totalMt = totalBags * bagWeightMt;

  const effectiveTruckCount =
    header.truckCountManual !== undefined &&
    header.truckCountManual !== null &&
    header.truckCountManual !== ''
      ? Number(header.truckCountManual) || 0
      : truckCountAuto;

  const avgBagsPerTruck =
    effectiveTruckCount > 0 ? (totalBags / effectiveTruckCount).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total Bags */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block truncate">
            Total Sacs Chargés
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900 font-mono-numbers">
              {totalBags.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Big Bags</span>
          </div>
        </div>
      </div>

      {/* Total Tonnage with 1.200 T / bag */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
          <Scale className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block truncate">
              Poids Total Chargé
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 rounded">
              1,200 T/sac
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-950 font-mono-numbers">
              {totalMt.toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}
            </span>
            <span className="text-[11px] text-emerald-700 font-bold">Tonnes (T)</span>
          </div>
        </div>
      </div>

      {/* Nombre de camions - EDITABLE & VIDE PAR DÉFAUT */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight block truncate">
            Nombre de camions
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <input
              type="text"
              value={header.truckCountManual ?? ''}
              onChange={(e) => onUpdateHeader?.({ truckCountManual: e.target.value })}
              placeholder={truckCountAuto > 0 ? String(truckCountAuto) : 'À remplir'}
              title="Entrez vous-même le nombre de camions"
              className="w-24 px-2 py-0.5 text-lg font-black text-blue-950 font-mono-numbers bg-blue-50/40 hover:bg-blue-50/80 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 placeholder:text-xs placeholder:font-normal"
            />
            <span className="text-[11px] text-slate-500 font-medium">camions</span>
          </div>
        </div>
      </div>

      {/* Moyenne par camion */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-700 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block truncate">
            Charge Moyenne Camion
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900 font-mono-numbers">
              {avgBagsPerTruck}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              sacs ({(Number(avgBagsPerTruck) * bagWeightMt).toFixed(1)} T)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
