import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { ShiftDefinition } from '../types/tally';

interface ClearReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeShift: ShiftDefinition;
  onConfirmClearCurrent: () => void;
  onConfirmClearAllShifts: () => void;
}

export const ClearReportModal: React.FC<ClearReportModalProps> = ({
  isOpen,
  onClose,
  activeShift,
  onConfirmClearCurrent,
  onConfirmClearAllShifts,
}) => {
  const [clearScope, setClearScope] = useState<'current' | 'all'>('current');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (clearScope === 'current') {
      onConfirmClearCurrent();
    } else {
      onConfirmClearAllShifts();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-rose-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-rose-600 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Vider le rapport des breakbulk
              </h3>
              <p className="text-[11px] text-rose-100">
                Réinitialisation des données de pointage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-[12px] leading-relaxed">
              <strong>Attention :</strong> Cette action va effacer les heures, bons de pesée et quantités de sacs chargées sur la fiche. Les numéros de matricules des camions seront conservés prêts pour une nouvelle saisie.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2">
              Périmètre de réinitialisation :
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="clearScope"
                  checked={clearScope === 'current'}
                  onChange={() => setClearScope('current')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <div className="font-bold text-slate-900">
                    Vider uniquement le {activeShift.label} ({activeShift.timeRange})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Réinitialise uniquement la fiche du poste en cours.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="clearScope"
                  checked={clearScope === 'all'}
                  onChange={() => setClearScope('all')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <div className="font-bold text-slate-900">
                    Vider les 3 shifts (Journée complète 24h)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Remet à zéro le 1er shift, le 2ème shift et le 3ème shift.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vider le rapport des breakbulk</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
