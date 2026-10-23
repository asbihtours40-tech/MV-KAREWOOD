import React, { useState } from 'react';
import { X, Sparkles, Check, Truck, Clock, Layers, HelpCircle } from 'lucide-react';
import { ShiftKey, ShiftDefinition } from '../types/tally';

interface BatchFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeShift: ShiftDefinition;
  onApplyBatchFill: (params: {
    scope: 'current' | 'all';
    date: string;
    startHour: string;
    intervalMinutes: number;
    trucks: string[];
    startVoucherNum: number;
    voucherPrefix: string;
    platformAlternating: boolean;
    bagsPerTruck: number;
    distribution: 'equitable' | 'hold1' | 'hold2' | 'hold3';
    rowsCount: number;
  }) => void;
}

export const BatchFillModal: React.FC<BatchFillModalProps> = ({
  isOpen,
  onClose,
  activeShift,
  onApplyBatchFill,
}) => {
  const [scope, setScope] = useState<'current' | 'all'>('current');
  const [date, setDate] = useState('22/10/2026');
  const [startHour, setStartHour] = useState(
    activeShift.key === 'shift1' ? '07:15' : activeShift.key === 'shift2' ? '15:15' : '23:15'
  );
  const [intervalMinutes, setIntervalMinutes] = useState(20);
  const [trucksText, setTrucksText] = useState('61516 A 55\n65333 A 55\n56061 A 55');
  const [startVoucherNum, setStartVoucherNum] = useState(
    activeShift.key === 'shift1' ? 4401 : activeShift.key === 'shift2' ? 4426 : 4451
  );
  const [voucherPrefix, setVoucherPrefix] = useState('BON-');
  const [platformAlternating, setPlatformAlternating] = useState(true);
  const [bagsPerTruck, setBagsPerTruck] = useState(25);
  const [distribution, setDistribution] = useState<'equitable' | 'hold1' | 'hold2' | 'hold3'>('equitable');
  const [rowsCount, setRowsCount] = useState(25);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trucks = trucksText
      .split('\n')
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0);

    onApplyBatchFill({
      scope,
      date,
      startHour,
      intervalMinutes,
      trucks: trucks.length > 0 ? trucks : ['61516 A 55', '65333 A 55', '56061 A 55'],
      startVoucherNum,
      voucherPrefix,
      platformAlternating,
      bagsPerTruck,
      distribution,
      rowsCount: Math.min(25, Math.max(1, rowsCount)),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-amber-300 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Remplir les informations pour toutes les lignes
              </h3>
              <p className="text-[11px] text-slate-400">
                Génération automatique du pointage (Navette camions, bons, horaires, cales 1-3)
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          {/* Scope selection */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <span className="font-bold text-slate-900 block mb-1.5">
              Appliquer le remplissage à :
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('current')}
                className={`py-2 px-3 rounded text-xs font-bold border transition-colors cursor-pointer ${
                  scope === 'current'
                    ? 'bg-amber-400 border-amber-500 text-slate-950 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {activeShift.label} uniquement ({activeShift.timeRange})
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`py-2 px-3 rounded text-xs font-bold border transition-colors cursor-pointer ${
                  scope === 'all'
                    ? 'bg-amber-400 border-amber-500 text-slate-950 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Tous les 3 shifts (Journée complète 24h)
              </button>
            </div>
          </div>

          {/* Number of rows and Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombre de lignes à remplir
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={rowsCount}
                  onChange={(e) => setRowsCount(parseInt(e.target.value, 10) || 25)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-slate-500 text-[11px] whitespace-nowrap">sur 25 max</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date du pointage
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="22/10/2026"
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Horaires et intervalle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Heure de premier camion
              </label>
              <input
                type="text"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                placeholder="07:15"
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cadence entre camions
              </label>
              <select
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-amber-500 bg-white"
              >
                <option value={15}>Toutes les 15 minutes (cadence forte)</option>
                <option value={20}>Toutes les 20 minutes (standard)</option>
                <option value={25}>Toutes les 25 minutes</option>
                <option value={30}>Toutes les 30 minutes</option>
              </select>
            </div>
          </div>

          {/* Matricules de la navette */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Matricules des camions en rotation (1 par ligne)
              </label>
              <span className="text-[10px] text-amber-700 font-medium">Navette Cosumar</span>
            </div>
            <textarea
              rows={3}
              value={trucksText}
              onChange={(e) => setTrucksText(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold uppercase focus:ring-1 focus:ring-amber-500 tracking-wide text-xs"
              placeholder="61516 A 55&#10;65333 A 55&#10;56061 A 55"
            />
          </div>

          {/* Bons & plateformes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                N° Bon de départ (Voucher)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={voucherPrefix}
                  onChange={(e) => setVoucherPrefix(e.target.value)}
                  className="w-20 px-2 py-1.5 border border-slate-300 rounded font-mono text-center uppercase"
                />
                <input
                  type="number"
                  value={startVoucherNum}
                  onChange={(e) => setStartVoucherNum(parseInt(e.target.value, 10) || 4401)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Plateformes de pesage
              </label>
              <select
                value={platformAlternating ? 'alt' : 'p1'}
                onChange={(e) => setPlatformAlternating(e.target.value === 'alt')}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-amber-500 bg-white"
              >
                <option value="alt">Alterner P-01 et P-02</option>
                <option value="p1">Fixe sur P-01</option>
              </select>
            </div>
          </div>

          {/* Répartition des cales & Poids */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Affectation des Cales
              </label>
              <select
                value={distribution}
                onChange={(e) =>
                  setDistribution(e.target.value as 'equitable' | 'hold1' | 'hold2' | 'hold3')
                }
                className="w-full px-2 py-1.5 border border-slate-300 rounded font-bold focus:ring-1 focus:ring-amber-500 bg-white text-xs"
              >
                <option value="equitable">Équilibrée (Cale 1, 2, 3)</option>
                <option value="hold1">100% Cale N° 1 (Proue)</option>
                <option value="hold2">100% Cale N° 2 (Centre)</option>
                <option value="hold3">100% Cale N° 3 (Poupe)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Big Bags par camion (1,200 T/sac)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={bagsPerTruck}
                  onChange={(e) => setBagsPerTruck(parseInt(e.target.value, 10) || 25)}
                  className="w-20 px-2 py-1.5 border border-slate-300 rounded font-mono font-bold text-center"
                />
                <span className="text-slate-600 font-mono text-[11px]">
                  = {(bagsPerTruck * 1.2).toFixed(1)} Tonnes
                </span>
              </div>
            </div>
          </div>

          {/* Total calculation preview */}
          <div className="bg-amber-100/60 border border-amber-300 rounded-lg p-2.5 text-slate-800 flex items-center justify-between">
            <span>Volume total à générer :</span>
            <span className="font-mono font-bold text-amber-950">
              {rowsCount} camions · {(rowsCount * bagsPerTruck).toLocaleString()} Big Bags ·{' '}
              {(rowsCount * bagsPerTruck * 1.2).toFixed(3)} Tonnes (T)
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Remplir les informations maintenant</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
