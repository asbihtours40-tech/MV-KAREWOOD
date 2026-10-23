import React, { useState, useEffect } from 'react';
import { X, Clock, Truck, PlusCircle, Check } from 'lucide-react';
import { TallyRow } from '../types/tally';

const COMMON_TRUCKS = ['61516 A 55', '65333 A 55', '56061 A 55'];

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: TallyRow[];
  onSaveRow: (index: number, rowData: Partial<TallyRow>) => void;
  defaultDate: string;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  rows,
  onSaveRow,
  defaultDate,
}) => {
  // Find first empty row or default to 0
  const findNextEmptyIndex = () => {
    const idx = rows.findIndex(
      (r) =>
        !r.hour &&
        !r.hold1 &&
        !r.hold2 &&
        !r.hold3
    );
    return idx !== -1 ? idx : 0;
  };

  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [date, setDate] = useState<string>(defaultDate);
  const [hour, setHour] = useState<string>('');
  const [truckNo, setTruckNo] = useState<string>('');
  const [platform, setPlatform] = useState<string>('P-01');
  const [voucher, setVoucher] = useState<string>('');
  const [holdNum, setHoldNum] = useState<1 | 2 | 3>(1);
  const [bagCount, setBagCount] = useState<number>(25);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const nextIdx = findNextEmptyIndex();
      setSelectedRowIndex(nextIdx);
      const existing = rows[nextIdx];
      if (existing) {
        setDate(existing.date || defaultDate);
        setHour(existing.hour || getCurrentTime());
        setTruckNo(existing.truckNo || '');
        setPlatform(existing.platform || (nextIdx % 2 === 0 ? 'P-01' : 'P-02'));
        setVoucher(existing.voucher || generateNextVoucher(nextIdx));
        if (existing.hold1) {
          setHoldNum(1);
          setBagCount(existing.hold1);
        } else if (existing.hold2) {
          setHoldNum(2);
          setBagCount(existing.hold2);
        } else if (existing.hold3) {
          setHoldNum(3);
          setBagCount(existing.hold3);
        } else {
          setBagCount(25);
        }
      }
    }
  }, [isOpen]);

  const getCurrentTime = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const generateNextVoucher = (index: number) => {
    for (let i = index - 1; i >= 0; i--) {
      const prevV = rows[i]?.voucher;
      if (prevV) {
        const match = prevV.match(/(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10) + 1;
          return prevV.replace(/\d+/, String(num));
        }
      }
    }
    return `BON-${4400 + index + 1}`;
  };

  const handleRowSelect = (idx: number) => {
    setSelectedRowIndex(idx);
    const existing = rows[idx];
    if (existing) {
      setDate(existing.date || defaultDate);
      setHour(existing.hour || getCurrentTime());
      setTruckNo(existing.truckNo || '');
      setPlatform(existing.platform || (idx % 2 === 0 ? 'P-01' : 'P-02'));
      setVoucher(existing.voucher || generateNextVoucher(idx));
      if (existing.hold1) {
        setHoldNum(1);
        setBagCount(existing.hold1);
      } else if (existing.hold2) {
        setHoldNum(2);
        setBagCount(existing.hold2);
      } else if (existing.hold3) {
        setHoldNum(3);
        setBagCount(existing.hold3);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent, andAdvance = false) => {
    e.preventDefault();

    const updatedData: Partial<TallyRow> = {
      date,
      hour: hour || getCurrentTime(),
      truckNo: truckNo.toUpperCase(),
      platform: platform.toUpperCase(),
      voucher: voucher.toUpperCase(),
      hold1: holdNum === 1 ? bagCount : null,
      hold2: holdNum === 2 ? bagCount : null,
      hold3: holdNum === 3 ? bagCount : null,
      notes,
    };

    onSaveRow(selectedRowIndex, updatedData);

    if (andAdvance && selectedRowIndex < rows.length - 1) {
      const nextIndex = selectedRowIndex + 1;
      setSelectedRowIndex(nextIndex);
      const nextTruck = rows[nextIndex]?.truckNo || '';
      setTruckNo(nextTruck);
      setVoucher(generateNextVoucher(nextIndex));
      setHour(getCurrentTime());
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">
                Saisie Rapide Camion · Pointage Navette (1 Big Bag = 1,200 T)
              </h3>
              <p className="text-[11px] text-slate-400">
                Affectation sur Cales 1, 2 et 3
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-5 space-y-4">
          {/* Row selection */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-950">
              Ligne cible sur la fiche (N°) :
            </span>
            <select
              value={selectedRowIndex}
              onChange={(e) => handleRowSelect(Number(e.target.value))}
              aria-label="Sélection de la ligne cible sur la fiche"
              className="bg-white border border-amber-300 rounded px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono-numbers"
            >
              {rows.map((r, i) => (
                <option key={i} value={i}>
                  Ligne N° {i + 1} · {r.truckNo || 'Vide'} {r.hour ? `(${r.hour})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Matricules Selector from the photo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-900">
                Matricules de la navette (Photo originale) :
              </label>
              <span className="text-[10px] text-amber-700 font-semibold">1 clic pour choisir</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_TRUCKS.map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setTruckNo(mat)}
                  className={`py-1.5 px-2 rounded text-xs font-black font-mono transition-all border cursor-pointer ${
                    truckNo === mat
                      ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          {/* Time & Arrival */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date d'arrivée au port
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="22/10/2026"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-amber-500 font-mono-numbers"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Heure d'arrivée
                </label>
                <button
                  type="button"
                  onClick={() => setHour(getCurrentTime())}
                  className="text-[10px] text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3 h-3" /> Maintenant
                </button>
              </div>
              <input
                type="text"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                placeholder="08:30"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-amber-500 font-mono-numbers"
              />
            </div>
          </div>

          {/* Truck & Platform & Voucher */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                N° Camion (Matricule)
              </label>
              <input
                type="text"
                value={truckNo}
                onChange={(e) => setTruckNo(e.target.value)}
                placeholder="61516 A 55"
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs uppercase font-black focus:ring-2 focus:ring-amber-500 font-mono-numbers"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                N° Platform
              </label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="P-01"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs uppercase focus:ring-2 focus:ring-amber-500 font-mono-numbers"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                N° Bon (Voucher)
              </label>
              <input
                type="text"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                placeholder="BON-4411"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs uppercase focus:ring-2 focus:ring-amber-500 font-mono-numbers"
              />
            </div>
          </div>

          {/* Target Hold Selector (HOLDS 1, 2, 3 ONLY) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cale de destination (Hold destinate for bags - 3 Cales)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[1, 2, 3].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHoldNum(h as 1 | 2 | 3)}
                  className={`py-2 px-3 rounded text-xs font-bold border transition-all cursor-pointer ${
                    holdNum === h
                      ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  CALE N° {h}
                </button>
              ))}
            </div>
          </div>

          {/* Bag quantity & Quick presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nombre de Big Bags (1 big bag = 1,200 T)
              </label>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Presets :</span>
                {[20, 24, 25, 28, 30].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBagCount(preset)}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-mono cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="100"
                value={bagCount}
                onChange={(e) => setBagCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-32 px-3 py-2 border border-slate-300 rounded text-sm font-bold font-mono-numbers text-center focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-600 font-mono">
                = <strong>{(bagCount * 1.2).toFixed(3)} Tonnes</strong> (chargées en Cale {holdNum})
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarque éventuelle (optionnel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Élingage sous grue quai 2, contrôle état des sacs OK"
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-amber-500"
            />
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
              onClick={(e) => handleSubmit(e, true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Enregistrer & Suivant</span>
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
