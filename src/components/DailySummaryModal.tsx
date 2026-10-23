import React from 'react';
import { X, Calendar } from 'lucide-react';
import { ReportData, ShiftKey } from '../types/tally';
import { SHIFTS_DEFINITIONS } from '../data/initialData';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftsData: Record<ShiftKey, ReportData>;
  onSelectShift: (key: ShiftKey) => void;
}

export const DailySummaryModal: React.FC<DailySummaryModalProps> = ({
  isOpen,
  onClose,
  shiftsData,
  onSelectShift,
}) => {
  if (!isOpen) return null;

  // Calculate totals for each shift
  const shiftsCalculated = SHIFTS_DEFINITIONS.map((def) => {
    const report = shiftsData[def.key];
    const rows = report?.rows || [];

    const h1 = rows.reduce((s, r) => s + (Number(r.hold1) || 0), 0);
    const h2 = rows.reduce((s, r) => s + (Number(r.hold2) || 0), 0);
    const h3 = rows.reduce((s, r) => s + (Number(r.hold3) || 0), 0);
    const totalBags = h1 + h2 + h3;
    const totalMt = totalBags * 1.2;
    const truckCount = rows.filter(
      (r) => (Number(r.hold1) || 0) + (Number(r.hold2) || 0) + (Number(r.hold3) || 0) > 0
    ).length;

    return {
      ...def,
      report,
      h1,
      h2,
      h3,
      totalBags,
      totalMt,
      truckCount,
    };
  });

  const grandBags = shiftsCalculated.reduce((s, sc) => s + sc.totalBags, 0);
  const grandMt = grandBags * 1.2;
  const grandTrucks = shiftsCalculated.reduce((s, sc) => s + sc.truckCount, 0);
  const grandH1 = shiftsCalculated.reduce((s, sc) => s + sc.h1, 0);
  const grandH2 = shiftsCalculated.reduce((s, sc) => s + sc.h2, 0);
  const grandH3 = shiftsCalculated.reduce((s, sc) => s + sc.h3, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Synthèse Journalière 24h · Cumul des 3 Shifts
              </h3>
              <p className="text-[11px] text-slate-400">
                1er Shift (07:00-15:00) · 2ème Shift (15:00-23:00) · 3ème Shift (23:00-07:00)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Global KPI banner */}
          <div className="grid grid-cols-3 gap-3 bg-amber-500/10 border border-amber-300/60 rounded-lg p-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase block">
                Total Sacs Journée (24h)
              </span>
              <div className="text-2xl font-black text-slate-950 font-mono-numbers">
                {grandBags.toLocaleString()} <span className="text-xs font-normal text-slate-600">sacs</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase block">
                Tonnage Total (1,200 T/sac)
              </span>
              <div className="text-2xl font-black text-emerald-900 font-mono-numbers">
                {grandMt.toFixed(3)} <span className="text-xs font-normal text-slate-600">Tonnes</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase block">
                Total Camions Déchargés
              </span>
              <div className="text-2xl font-black text-blue-950 font-mono-numbers">
                {grandTrucks} <span className="text-xs font-normal text-slate-600">rotations</span>
              </div>
            </div>
          </div>

          {/* Table breakdown per shift */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Poste de Travail (Shift)</th>
                  <th className="py-2.5 px-3 text-center">Inspecteur</th>
                  <th className="py-2.5 px-3 text-center">Camions</th>
                  <th className="py-2.5 px-3 text-center text-blue-900">Cale 1</th>
                  <th className="py-2.5 px-3 text-center text-emerald-900">Cale 2</th>
                  <th className="py-2.5 px-3 text-center text-purple-900">Cale 3</th>
                  <th className="py-2.5 px-3 text-center">Total Sacs</th>
                  <th className="py-2.5 px-3 text-right">Tonnage (T)</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {shiftsCalculated.map((item) => (
                  <tr key={item.key} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <div>{item.label}</div>
                      <div className="text-[10px] font-mono text-amber-700">{item.timeRange}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium text-slate-700">
                      {item.report?.header.inspector || item.defaultInspector}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-numbers font-semibold">
                      {item.truckCount}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-numbers font-bold text-blue-900">
                      {item.h1.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-numbers font-bold text-emerald-900">
                      {item.h2.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-numbers font-bold text-purple-900">
                      {item.h3.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-numbers font-black text-slate-950">
                      {item.totalBags.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers font-bold text-emerald-800">
                      {item.totalMt.toFixed(3)} T
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          onSelectShift(item.key);
                          onClose();
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-amber-400 text-slate-900 rounded font-semibold text-[11px] cursor-pointer transition-colors"
                      >
                        Ouvrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#f5b300] font-black text-slate-950 border-t-2 border-slate-900">
                <tr>
                  <td className="py-2.5 px-3 uppercase">CUMUL 24H (3 SHIFTS)</td>
                  <td className="py-2.5 px-3 text-center">-</td>
                  <td className="py-2.5 px-3 text-center font-mono-numbers">{grandTrucks}</td>
                  <td className="py-2.5 px-3 text-center font-mono-numbers">{grandH1.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-center font-mono-numbers">{grandH2.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-center font-mono-numbers">{grandH3.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-center font-mono-numbers text-sm">{grandBags.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono-numbers text-sm">{grandMt.toFixed(3)} T</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Cadence 24h sur navire MV KAREWOOD · Base de pesée 1 Big Bag = 1,200 T
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
