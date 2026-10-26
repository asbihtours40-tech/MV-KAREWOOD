import React from 'react';
import { Printer, Calendar, Download, Scale, Truck, Layers, CheckCircle2 } from 'lucide-react';
import { DayReport24h } from '../types/tally';
import { SHIFTS_DEFINITIONS } from '../data/initialData';

interface Consolidated24hViewProps {
  day: DayReport24h;
  onPrint: () => void;
  onExportCSV: () => void;
}

export const Consolidated24hView: React.FC<Consolidated24hViewProps> = ({
  day,
  onPrint,
  onExportCSV,
}) => {
  // Aggregate data for each shift
  let grandBags = 0;
  let grandTrucks = 0;
  let grandH1 = 0;
  let grandH2 = 0;
  let grandH3 = 0;

  const shiftSummaries = SHIFTS_DEFINITIONS.map((def) => {
    const shift = day.shifts[def.key];
    const rows = shift?.rows || [];

    const h1 = rows.reduce((s, r) => s + (Number(r.hold1) || 0), 0);
    const h2 = rows.reduce((s, r) => s + (Number(r.hold2) || 0), 0);
    const h3 = rows.reduce((s, r) => s + (Number(r.hold3) || 0), 0);
    const totalBags = h1 + h2 + h3;
    const totalMt = totalBags * 1.2;
    const truckCount = rows.filter(
      (r) => (Number(r.hold1) || 0) + (Number(r.hold2) || 0) + (Number(r.hold3) || 0) > 0
    ).length;

    grandBags += totalBags;
    grandTrucks += truckCount;
    grandH1 += h1;
    grandH2 += h2;
    grandH3 += h3;

    return {
      def,
      shift,
      h1,
      h2,
      h3,
      totalBags,
      totalMt,
      truckCount,
    };
  });

  const grandTonnage = grandBags * 1.2;

  return (
    <div className="space-y-4">
      {/* Action bar (non-print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <span className="font-extrabold text-slate-950 bg-amber-400 px-2.5 py-1 rounded uppercase tracking-wide">
            Bilan Consolidé 24 Heures
          </span>
          <span className="font-semibold text-slate-900">
            Journée du {day.date} (Jour N° {day.dayNumber}) · Navire MV KAREWOOD
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded shadow-xs cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Imprimer le Bilan 24h</span>
          </button>
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV 24h</span>
          </button>
        </div>
      </div>

      {/* THE CONSOLIDATED 24H DOCUMENT CANVAS */}
      <div className="print-sheet bg-white border border-slate-300 shadow-lg rounded-sm p-5 sm:p-8 max-w-[1180px] mx-auto text-black">
        {/* Title */}
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <h2 className="text-xl sm:text-2xl font-black text-red-600 uppercase underline underline-offset-4 tracking-wider mb-2">
            RAPPORT DES BREAKBULK AU CHARGEMENT · SYNTHESE 24 HEURES
          </h2>
          <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-tight text-slate-800">
            <span>PERIODE 24H DU : <strong className="text-black font-mono text-sm">{day.date}</strong></span>
            <span>·</span>
            <span>JOUR N° : <strong className="text-black font-mono text-sm">{day.dayNumber}</strong></span>
            <span>·</span>
            <span>BASE DE CALCUL : <strong className="text-amber-800 font-mono">1 BIG BAG = 1,200 T</strong></span>
          </div>
        </div>

        {/* Header Metadata */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-6 border-b border-black pb-4">
          <div className="space-y-1.5">
            <div className="grid grid-cols-[140px_1fr]">
              <span className="text-slate-700">THE PRODUCER :</span>
              <strong className="uppercase">COSUMAR</strong>
            </div>
            <div className="grid grid-cols-[140px_1fr]">
              <span className="text-slate-700">UNLOADING PLACE :</span>
              <strong className="uppercase">MV KAREWOOD (3 CALES)</strong>
            </div>
            <div className="grid grid-cols-[140px_1fr]">
              <span className="text-slate-700">COMMODITY :</span>
              <strong className="uppercase">WHITE REFINED SUGAR IN BIG BAG</strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="grid grid-cols-[140px_1fr]">
              <span className="text-slate-700">DESTINATION :</span>
              <strong>Gaeta, Italy / Kavala, Greece</strong>
            </div>
            <div className="grid grid-cols-[140px_1fr]">
              <span className="text-slate-700">CLIENT :</span>
              <strong>A/C Chadwell</strong>
            </div>
            <div className="grid grid-cols-[140px_1fr]">
              <span className="text-slate-700">STATUT PERIODE :</span>
              <strong className="uppercase text-emerald-800">
                {day.status === 'cloturee' ? 'Clôturée & Validée' : 'En cours de pointage'}
              </strong>
            </div>
          </div>
        </div>

        {/* Master Table of the 3 Shifts */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse border-2 border-black text-xs">
            <thead>
              <tr className="bg-[#f5b300] text-black font-extrabold text-center uppercase border-b-2 border-black">
                <th className="border-r border-black py-2 px-3 text-left">Poste de Travail (Shift)</th>
                <th className="border-r border-black py-2 px-2 text-left">Inspecteur en Poste</th>
                <th className="border-r border-black py-2 px-2 text-center">Camions</th>
                <th className="border-r border-black py-2 px-2 text-center text-blue-950">HOLD N° 1</th>
                <th className="border-r border-black py-2 px-2 text-center text-emerald-950">HOLD N° 2</th>
                <th className="border-r border-black py-2 px-2 text-center text-purple-950">HOLD N° 3</th>
                <th className="border-r border-black py-2 px-2 text-center font-black">TOTAL SACS</th>
                <th className="py-2 px-2 text-right font-black">TONNAGE TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {shiftSummaries.map((ss) => (
                <tr key={ss.def.key} className="border-b border-black text-xs hover:bg-slate-50">
                  <td className="border-r border-black py-3 px-3">
                    <div className="font-extrabold text-slate-950">{ss.def.label}</div>
                    <div className="text-[11px] font-mono text-amber-800 font-bold">{ss.def.timeRange}</div>
                  </td>
                  <td className="border-r border-black py-3 px-2 font-bold text-slate-800">
                    {ss.shift?.header.inspector || ss.def.defaultInspector}
                  </td>
                  <td className="border-r border-black py-3 px-2 text-center font-mono font-bold">
                    {ss.truckCount} camions
                  </td>
                  <td className="border-r border-black py-3 px-2 text-center font-mono font-bold text-blue-900">
                    {ss.h1 > 0 ? ss.h1.toLocaleString() : '-'}
                  </td>
                  <td className="border-r border-black py-3 px-2 text-center font-mono font-bold text-emerald-900">
                    {ss.h2 > 0 ? ss.h2.toLocaleString() : '-'}
                  </td>
                  <td className="border-r border-black py-3 px-2 text-center font-mono font-bold text-purple-900">
                    {ss.h3 > 0 ? ss.h3.toLocaleString() : '-'}
                  </td>
                  <td className="border-r border-black py-3 px-2 text-center font-mono font-black text-sm bg-amber-50/50">
                    {ss.totalBags > 0 ? ss.totalBags.toLocaleString() : '0'}
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-black text-sm text-emerald-900 bg-emerald-50/30">
                    {ss.totalMt.toFixed(3)} T
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {/* Grand Total Row */}
              <tr className="bg-[#f5b300] text-black font-black text-sm border-t-2 border-black">
                <td colSpan={2} className="border-r border-black py-3 px-3 uppercase tracking-wider">
                  CUMUL TOTAL 24 HEURES (3 SHIFTS)
                </td>
                <td className="border-r border-black py-3 px-2 text-center font-mono">
                  {grandTrucks} camions
                </td>
                <td className="border-r border-black py-3 px-2 text-center font-mono text-blue-950">
                  {grandH1.toLocaleString()}
                </td>
                <td className="border-r border-black py-3 px-2 text-center font-mono text-emerald-950">
                  {grandH2.toLocaleString()}
                </td>
                <td className="border-r border-black py-3 px-2 text-center font-mono text-purple-950">
                  {grandH3.toLocaleString()}
                </td>
                <td className="border-r border-black py-3 px-2 text-center font-mono text-base bg-[#e6a800]">
                  {grandBags.toLocaleString()}
                </td>
                <td className="py-3 px-2 text-right font-mono text-base bg-[#e6a800] text-emerald-950">
                  {grandTonnage.toFixed(3)} T
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 24h Visual Hold Breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-3 bg-slate-50 border border-slate-300 rounded text-xs text-center">
          <div className="border-r border-slate-300 pr-2">
            <span className="font-bold text-slate-700 block">CALE N° 1 (Proue / Fore)</span>
            <div className="text-base font-black font-mono text-blue-950">{grandH1.toLocaleString()} sacs</div>
            <div className="text-[11px] font-mono text-slate-600">{(grandH1 * 1.2).toFixed(3)} Tonnes</div>
          </div>
          <div className="border-r border-slate-300 pr-2">
            <span className="font-bold text-slate-700 block">CALE N° 2 (Centre / Midship)</span>
            <div className="text-base font-black font-mono text-emerald-950">{grandH2.toLocaleString()} sacs</div>
            <div className="text-[11px] font-mono text-slate-600">{(grandH2 * 1.2).toFixed(3)} Tonnes</div>
          </div>
          <div>
            <span className="font-bold text-slate-700 block">CALE N° 3 (Poupe / Aft)</span>
            <div className="text-base font-black font-mono text-purple-950">{grandH3.toLocaleString()} sacs</div>
            <div className="text-[11px] font-mono text-slate-600">{(grandH3 * 1.2).toFixed(3)} Tonnes</div>
          </div>
        </div>

        {/* Signatures of the 3 Shift Inspectors and Ship Officers */}
        <div className="pt-4 border-t-2 border-black grid grid-cols-5 gap-2 text-[11px] text-center">
          <div className="border border-slate-400 p-2 rounded bg-slate-50/30">
            <strong className="block font-bold uppercase text-[10px] text-slate-700">1er Shift (07-15h)</strong>
            <div className="font-bold my-3 text-slate-900">A. EL MEHDI</div>
            <div className="text-[9px] text-slate-400 border-t border-dashed pt-1">Visa Pointeur</div>
          </div>

          <div className="border border-slate-400 p-2 rounded bg-slate-50/30">
            <strong className="block font-bold uppercase text-[10px] text-slate-700">2ème Shift (15-23h)</strong>
            <div className="font-bold my-3 text-slate-900">A. FAICAL</div>
            <div className="text-[9px] text-slate-400 border-t border-dashed pt-1">Visa Pointeur</div>
          </div>

          <div className="border border-slate-400 p-2 rounded bg-slate-50/30">
            <strong className="block font-bold uppercase text-[10px] text-slate-700">3ème Shift (23-07h)</strong>
            <div className="font-bold my-3 text-slate-900">A. ABDERAHIM</div>
            <div className="text-[9px] text-slate-400 border-t border-dashed pt-1">Visa Pointeur</div>
          </div>

          <div className="border border-slate-400 p-2 rounded bg-slate-50/30">
            <strong className="block font-bold uppercase text-[10px] text-slate-700">Chef de Bord / Quai</strong>
            <div className="font-bold my-3 text-slate-900">COSUMAR</div>
            <div className="text-[9px] text-slate-400 border-t border-dashed pt-1">Cachet & Visa</div>
          </div>

          <div className="border border-slate-400 p-2 rounded bg-slate-50/30">
            <strong className="block font-bold uppercase text-[10px] text-slate-700">Second Capitaine</strong>
            <div className="font-bold my-3 text-slate-900">MV KAREWOOD</div>
            <div className="text-[9px] text-slate-400 border-t border-dashed pt-1">Visa & Cachet Navire</div>
          </div>
        </div>
      </div>
    </div>
  );
};
