import React, { useState } from 'react';
import {
  Calendar,
  X,
  Plus,
  CheckCircle2,
  Clock,
  Download,
  Trash2,
  Eye,
  FileSpreadsheet,
  Layers,
  Scale,
  Truck,
  Save,
  Lock,
} from 'lucide-react';
import { DayReport24h, ShiftKey } from '../types/tally';
import { SHIFTS_DEFINITIONS } from '../data/initialData';

interface DailyPeriodsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: DayReport24h[];
  activeDayId: string;
  onSelectDay: (dayId: string) => void;
  onCreateNewDay: (date: string, dayNumber: number) => void;
  onSaveCurrentDay: (notes?: string) => void;
  onDeleteDay: (dayId: string) => void;
  activeAgentName: string;
}

export const DailyPeriodsManagerModal: React.FC<DailyPeriodsManagerModalProps> = ({
  isOpen,
  onClose,
  days,
  activeDayId,
  onSelectDay,
  onCreateNewDay,
  onSaveCurrentDay,
  onDeleteDay,
  activeAgentName,
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newDate, setNewDate] = useState(() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });
  const [newDayNumber, setNewDayNumber] = useState(days.length + 1);
  const [saveNotes, setSaveNotes] = useState('');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate.trim()) return;
    onCreateNewDay(newDate.trim(), newDayNumber);
    setIsCreatingNew(false);
  };

  // Helper to compute 24h totals for a given DayReport24h
  const computeDayTotals = (day: DayReport24h) => {
    let grandBags = 0;
    let grandTrucks = 0;
    let grandH1 = 0;
    let grandH2 = 0;
    let grandH3 = 0;

    const shiftDetails = SHIFTS_DEFINITIONS.map((def) => {
      const shift = day.shifts[def.key];
      const rows = shift?.rows || [];
      const h1 = rows.reduce((s, r) => s + (Number(r.hold1) || 0), 0);
      const h2 = rows.reduce((s, r) => s + (Number(r.hold2) || 0), 0);
      const h3 = rows.reduce((s, r) => s + (Number(r.hold3) || 0), 0);
      const bags = h1 + h2 + h3;
      const trucks = rows.filter(
        (r) => (Number(r.hold1) || 0) + (Number(r.hold2) || 0) + (Number(r.hold3) || 0) > 0
      ).length;

      grandBags += bags;
      grandTrucks += trucks;
      grandH1 += h1;
      grandH2 += h2;
      grandH3 += h3;

      return {
        key: def.key,
        label: def.label,
        timeRange: def.timeRange,
        inspector: shift?.header.inspector || def.defaultInspector,
        bags,
        tonnage: bags * 1.2,
        trucks,
        h1,
        h2,
        h3,
      };
    });

    const grandTonnage = grandBags * 1.2;

    return {
      grandBags,
      grandTonnage,
      grandTrucks,
      grandH1,
      grandH2,
      grandH3,
      shiftDetails,
    };
  };

  // Export 24h CSV
  const exportDayCSV = (day: DayReport24h) => {
    const totals = computeDayTotals(day);
    const lines: string[] = [];

    lines.push(`"RAPPORT DE CHARGEMENT BREAKBULK - PERIODE 24 HEURES"`);
    lines.push(`"DATE","${day.date}","","JOUR N°","${day.dayNumber}"`);
    lines.push(`"NAVIRE","MV KAREWOOD","","MARCHANDISE","WHITE REFINED SUGAR (1,200 T/sac)"`);
    lines.push(`"STATUT","${day.status === 'cloturee' ? 'Clôturée' : 'En cours'}","","ENREGISTRE PAR","${day.savedBy}"`);
    lines.push('');

    // Summary per shift
    lines.push(`"SYNTHESE DES 3 SHIFTS DE LA JOURNEE (24H)"`);
    lines.push(`"POSTE","HORAIRES","INSPECTEUR","CAMIONS","CALE 1 (SACS)","CALE 2 (SACS)","CALE 3 (SACS)","TOTAL SACS","TONNAGE (T)"`);

    totals.shiftDetails.forEach((sd) => {
      lines.push(
        `"${sd.label}","${sd.timeRange}","${sd.inspector}","${sd.trucks}","${sd.h1}","${sd.h2}","${sd.h3}","${sd.bags}","${sd.tonnage.toFixed(3)}"`
      );
    });

    lines.push(
      `"CUMUL 24H","07:00 - 07:00","3 SHIFTS","${totals.grandTrucks}","${totals.grandH1}","${totals.grandH2}","${totals.grandH3}","${totals.grandBags}","${totals.grandTonnage.toFixed(3)}"`
    );
    lines.push('');

    // Detailed tally rows per shift
    SHIFTS_DEFINITIONS.forEach((def) => {
      const shift = day.shifts[def.key];
      lines.push(`"DETAIL DES POINTAGES : ${def.fullTitle}"`);
      lines.push(
        '"N°","DATE","HEURE","N° CAMION","N° PLATFORM","N° BON","HOLD N° 1","HOLD N° 2","HOLD N° 3","CUMUL SACS"'
      );

      let running = 0;
      (shift?.rows || []).forEach((r, idx) => {
        const sum = (Number(r.hold1) || 0) + (Number(r.hold2) || 0) + (Number(r.hold3) || 0);
        if (sum > 0 || r.truckNo) running += sum;
        lines.push(
          `"${idx + 1}","${r.date || ''}","${r.hour || ''}","${r.truckNo || ''}","${
            r.platform || ''
          }","${r.voucher || ''}","${r.hold1 || ''}","${r.hold2 || ''}","${r.hold3 || ''}","${
            running > 0 ? running : ''
          }"`
        );
      });
      lines.push('');
    });

    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RAPPORT_24H_MV_KAREWOOD_${day.date.replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Gestion & Archives des Périodes de 24 Heures
              </h3>
              <p className="text-[11px] text-slate-400">
                Enregistrement continu des 3 shifts (1er, 2ème et 3ème shift) pour chaque journée
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

        {/* Action toolbar */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">
              {days.length} période(s) de 24h enregistrée(s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Save current 24h period button */}
            <button
              onClick={() => onSaveCurrentDay(saveNotes)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded shadow-xs cursor-pointer transition-colors"
              title="Enregistrer et archiver l'état actuel de la période 24h"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer la Période 24h actuelle</span>
            </button>

            {/* Create new 24h period button */}
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvelle Période 24h</span>
            </button>
          </div>
        </div>

        {/* Create new day inline form */}
        {isCreatingNew && (
          <form
            onSubmit={handleCreateSubmit}
            className="bg-amber-50 border-b border-amber-200 p-4 text-xs flex flex-wrap items-end gap-3 animate-in fade-in duration-100"
          >
            <div>
              <label className="block font-bold text-amber-950 mb-1">
                Date de la nouvelle journée 24h
              </label>
              <input
                type="text"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                placeholder="27/10/2026"
                required
                className="px-3 py-1.5 bg-white border border-amber-300 rounded font-mono font-bold focus:ring-1 focus:ring-amber-500 w-36"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-950 mb-1">
                Numéro de Jour (Navire)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={newDayNumber}
                onChange={(e) => setNewDayNumber(parseInt(e.target.value, 10) || 1)}
                className="px-3 py-1.5 bg-white border border-amber-300 rounded font-mono font-bold focus:ring-1 focus:ring-amber-500 w-24"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded cursor-pointer"
              >
                Créer & Initialiser les 3 Shifts
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* List of 24h periods */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
          {days.map((day) => {
            const totals = computeDayTotals(day);
            const isActive = day.id === activeDayId;

            return (
              <div
                key={day.id}
                className={`bg-white rounded-xl border p-4 shadow-xs transition-all ${
                  isActive
                    ? 'border-amber-400 ring-2 ring-amber-400/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header card of the 24h period */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-black ${
                        isActive
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          Journée du {day.date} (Jour N° {day.dayNumber})
                        </span>
                        {isActive && (
                          <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                            Période active
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            day.status === 'cloturee'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {day.status === 'cloturee' ? 'Clôturée & Archivée' : 'En cours de pointage'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Enregistré par : <strong className="text-slate-700">{day.savedBy}</strong> · Dernière sauvegarde :{' '}
                        {new Date(day.savedAt).toLocaleDateString()} {new Date(day.savedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions for this day */}
                  <div className="flex items-center gap-2">
                    {!isActive ? (
                      <button
                        onClick={() => {
                          onSelectDay(day.id);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Charger cette journée</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>En cours d'édition</span>
                      </span>
                    )}

                    <button
                      onClick={() => exportDayCSV(day)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors cursor-pointer"
                      title="Télécharger le rapport Excel CSV de ces 24h (3 shifts)"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>CSV 24h</span>
                    </button>

                    {days.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Supprimer l'archive de la journée du ${day.date} ?`)) {
                            onDeleteDay(day.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Supprimer cette journée"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* KPI 24h Totals */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 bg-slate-50/70 p-3 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                      Total 24h (3 Shifts)
                    </span>
                    <span className="text-base font-black text-slate-900 font-mono-numbers">
                      {totals.grandBags.toLocaleString()} sacs
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                      Tonnage Total 24h (1,200 T)
                    </span>
                    <span className="text-base font-black text-emerald-700 font-mono-numbers">
                      {totals.grandTonnage.toFixed(3)} T
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                      Camions déchargés
                    </span>
                    <span className="text-base font-black text-blue-900 font-mono-numbers">
                      {totals.grandTrucks} voyages
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                      Répartition Cales (1 / 2 / 3)
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {totals.grandH1} / {totals.grandH2} / {totals.grandH3}
                    </span>
                  </div>
                </div>

                {/* 3 Shifts Breakdown Mini Table */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  {totals.shiftDetails.map((sd) => (
                    <div
                      key={sd.key}
                      className="bg-white border border-slate-200 rounded p-2.5 space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-1">
                        <span>{sd.label}</span>
                        <span className="text-[10px] font-mono text-amber-700">{sd.timeRange}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex justify-between">
                        <span>Inspecteur :</span>
                        <strong className="text-slate-800">{sd.inspector}</strong>
                      </div>
                      <div className="text-[11px] text-slate-600 flex justify-between">
                        <span>Sacs / Tonnage :</span>
                        <strong className="font-mono text-slate-950">
                          {sd.bags.toLocaleString()} s. ({sd.tonnage.toFixed(1)} T)
                        </strong>
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>Camions :</span>
                        <span className="font-mono">{sd.trucks} camions</span>
                      </div>
                    </div>
                  ))}
                </div>

                {day.notes24h && (
                  <div className="mt-2 text-[11px] text-slate-600 bg-amber-50/50 p-2 rounded border border-amber-100">
                    <strong>Note 24h :</strong> {day.notes24h}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Base de calcul navire MV KAREWOOD : 1 Big Bag = 1,200 T · 3 Shifts continus de 8h
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
