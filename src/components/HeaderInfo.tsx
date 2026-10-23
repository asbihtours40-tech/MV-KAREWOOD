import React from 'react';
import { ReportHeader } from '../types/tally';
import { Edit3 } from 'lucide-react';

interface HeaderInfoProps {
  header: ReportHeader;
  onEdit: () => void;
  isReadOnly?: boolean;
}

export const HeaderInfo: React.FC<HeaderInfoProps> = ({ header, onEdit, isReadOnly = false }) => {
  return (
    <div className="relative border-b-2 border-black pb-4 mb-3">
      {/* Edit button in non-print mode */}
      {!isReadOnly && (
        <button
          onClick={onEdit}
          type="button"
          className="no-print absolute top-0 right-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded shadow-xs transition-colors cursor-pointer"
          title="Modifier les informations d'en-tête"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Modifier l'en-tête</span>
        </button>
      )}

      {/* Main Title - exactly as in the original image */}
      <div className="text-center mb-6 pt-1">
        <h1 className="text-xl sm:text-2xl font-black text-red-600 tracking-wider underline underline-offset-4 uppercase font-sans">
          {header.title || 'RAPPORT DES BREAKBULK AU CHARGEMENT'}
        </h1>
      </div>

      {/* Two columns metadata layout matching the exact scanned form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 gap-x-6 text-[13px] leading-tight text-black font-sans">
        {/* Left Column (5 fields) */}
        <div className="md:col-span-7 space-y-1.5">
          <div className="grid grid-cols-[145px_1fr] items-baseline">
            <span className="font-normal text-slate-800 uppercase tracking-tight">THE PRODUCER</span>
            <span className="font-extrabold uppercase text-black font-mono-numbers">{header.producer}</span>
          </div>

          <div className="grid grid-cols-[145px_1fr] items-baseline">
            <span className="font-normal text-slate-800 uppercase tracking-tight">UNLOADING PLACE</span>
            <span className="font-extrabold uppercase text-black font-mono-numbers">{header.unloadingPlace}</span>
          </div>

          <div className="grid grid-cols-[145px_1fr] items-baseline">
            <span className="font-normal text-slate-800 uppercase tracking-tight">COMMODITY</span>
            <span className="font-extrabold uppercase text-black">{header.commodity}</span>
          </div>

          <div className="grid grid-cols-[145px_1fr] items-baseline">
            <span className="font-normal text-slate-800 uppercase tracking-tight">DESTINATION</span>
            <span className="font-extrabold text-black">{header.destination}</span>
          </div>

          <div className="grid grid-cols-[145px_1fr] items-baseline">
            <span className="font-normal text-slate-800 uppercase tracking-tight">CLIENT</span>
            <span className="font-extrabold text-black">{header.client}</span>
          </div>
        </div>

        {/* Right Column (Shift, Inspector, Date) */}
        <div className="md:col-span-5 space-y-2 md:pl-6 border-t md:border-t-0 md:border-l border-slate-200 md:border-black/20 pt-2 md:pt-0">
          <div className="grid grid-cols-[115px_1fr] items-baseline">
            <span className="font-bold text-black uppercase tracking-tight">N° SHIFT :</span>
            <span className="font-black text-black font-mono-numbers text-base">{header.shiftNo}</span>
          </div>

          <div className="grid grid-cols-[115px_1fr] items-baseline">
            <span className="font-bold text-black uppercase tracking-tight">INSPECTEUR :</span>
            <span className="font-black uppercase text-black">{header.inspector}</span>
          </div>

          <div className="grid grid-cols-[115px_1fr] items-baseline">
            <span className="font-bold text-black uppercase tracking-tight">DATE :</span>
            <span className="font-extrabold text-black font-mono-numbers">{header.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
