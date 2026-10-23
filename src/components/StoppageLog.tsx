import React, { useState } from 'react';
import { Clock, Plus, Trash2, AlertTriangle } from 'lucide-react';

interface Stoppage {
  timeStart: string;
  timeEnd: string;
  reason: string;
}

interface StoppageLogProps {
  stoppages: Stoppage[];
  onChange: (stoppages: Stoppage[]) => void;
  isReadOnly?: boolean;
}

export const StoppageLog: React.FC<StoppageLogProps> = ({
  stoppages = [],
  onChange,
  isReadOnly = false,
}) => {
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [reason, setReason] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    const newStoppages = [...stoppages, { timeStart, timeEnd, reason }];
    onChange(newStoppages);
    setTimeStart('');
    setTimeEnd('');
    setReason('');
  };

  const handleRemove = (index: number) => {
    const newStoppages = stoppages.filter((_, i) => i !== index);
    onChange(newStoppages);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
            Registre des Arrêts & Remarques (Stoppages / Statement of Facts)
          </h4>
        </div>
        <span className="text-[11px] text-slate-500">
          {stoppages.length} arrêt(s) enregistré(s)
        </span>
      </div>

      {/* List */}
      {stoppages.length === 0 ? (
        <div className="py-3 text-center text-xs text-slate-400 italic">
          Aucun arrêt de chargement signalé. Opérations régulières.
        </div>
      ) : (
        <div className="space-y-2 mb-3">
          {stoppages.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono-numbers font-bold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[11px]">
                  {item.timeStart || '--:--'} → {item.timeEnd || '--:--'}
                </span>
                <span className="text-slate-700 font-medium">{item.reason}</span>
              </div>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded cursor-pointer"
                  title="Supprimer l'arrêt"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Form */}
      {!isReadOnly && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <input
            type="text"
            value={timeStart}
            onChange={(e) => setTimeStart(e.target.value)}
            placeholder="Début (10:15)"
            className="w-24 px-2 py-1 text-xs border border-slate-300 rounded font-mono-numbers focus:ring-1 focus:ring-amber-500"
          />
          <input
            type="text"
            value={timeEnd}
            onChange={(e) => setTimeEnd(e.target.value)}
            placeholder="Fin (10:45)"
            className="w-24 px-2 py-1 text-xs border border-slate-300 rounded font-mono-numbers focus:ring-1 focus:ring-amber-500"
          />
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Cause (Pluie, Panne grue, Repas, Manœuvre navire...)"
            className="flex-1 min-w-[200px] px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </form>
      )}
    </div>
  );
};
