import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  RotateCcw,
  Truck,
  Ship,
  Eye,
  Sliders,
  Clock,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';

import { ReportData, ReportHeader, TallyRow, ShiftKey } from './types/tally';
import {
  initialShiftsState,
  SHIFTS_DEFINITIONS,
  create25Rows,
  TRUCK_NUMBERS_FROM_IMAGE,
} from './data/initialData';
import { HeaderInfo } from './components/HeaderInfo';
import { TallyTable } from './components/TallyTable';
import { HoldVisualizer } from './components/HoldVisualizer';
import { QuickEntryModal } from './components/QuickEntryModal';
import { OriginalImageModal } from './components/OriginalImageModal';
import { EditHeaderModal } from './components/EditHeaderModal';
import { StatisticsBar } from './components/StatisticsBar';
import { StoppageLog } from './components/StoppageLog';
import { ClearReportModal } from './components/ClearReportModal';
import { DailySummaryModal } from './components/DailySummaryModal';

const SHIFTS_STORAGE_KEY = 'breakbulk_tally_3shifts_storage_v4_empty_trucks';

export default function App() {
  // Store all 3 shifts in state
  const [shiftsData, setShiftsData] = useState<Record<ShiftKey, ReportData>>(() => {
    try {
      const saved = localStorage.getItem(SHIFTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.shift1 && parsed.shift2 && parsed.shift3) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return initialShiftsState;
  });

  // Active shift selection: shift1 (07:00-15:00), shift2 (15:00-23:00), shift3 (23:00-07:00)
  const [currentShiftKey, setCurrentShiftKey] = useState<ShiftKey>('shift1');

  // Active view tab (Fiche, Plan des cales, Arrêts)
  const [activeTab, setActiveTab] = useState<'sheet' | 'stowage' | 'stoppages'>('sheet');

  // Modals
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [isOriginalImageOpen, setIsOriginalImageOpen] = useState(false);
  const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // Active report being viewed/edited
  const currentReport = shiftsData[currentShiftKey] || initialShiftsState[currentShiftKey];
  const activeShiftDef =
    SHIFTS_DEFINITIONS.find((s) => s.key === currentShiftKey) || SHIFTS_DEFINITIONS[0];

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(shiftsData));
    } catch {
      // ignore
    }
  }, [shiftsData]);

  // Update a single row in the active shift
  const handleUpdateRow = (index: number, updated: Partial<TallyRow>) => {
    setShiftsData((prev) => {
      const activeReport = prev[currentShiftKey];
      const newRows = [...activeReport.rows];
      newRows[index] = { ...newRows[index], ...updated };

      return {
        ...prev,
        [currentShiftKey]: {
          ...activeReport,
          rows: newRows,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  // Add row to active shift
  const handleAddRow = () => {
    setShiftsData((prev) => {
      const activeReport = prev[currentShiftKey];
      const newRowNum = activeReport.rows.length + 1;
      const newRow: TallyRow = {
        id: `row-${currentShiftKey}-${newRowNum}-${Date.now()}`,
        rowNumber: newRowNum,
        date: activeReport.header.date,
        hour: '',
        truckNo: '',
        platform: '',
        voucher: '',
        hold1: null,
        hold2: null,
        hold3: null,
        notes: '',
      };

      return {
        ...prev,
        [currentShiftKey]: {
          ...activeReport,
          rows: [...activeReport.rows, newRow],
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  // Delete row in active shift
  const handleDeleteRow = (index: number) => {
    setShiftsData((prev) => {
      const activeReport = prev[currentShiftKey];
      const newRows = [...activeReport.rows];
      newRows[index] = {
        ...newRows[index],
        date: activeReport.header.date,
        hour: '',
        truckNo: '',
        platform: '',
        voucher: '',
        hold1: null,
        hold2: null,
        hold3: null,
        notes: '',
      };

      return {
        ...prev,
        [currentShiftKey]: {
          ...activeReport,
          rows: newRows,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  // Update header for active shift
  const handleSaveHeader = (newHeader: ReportHeader) => {
    setShiftsData((prev) => ({
      ...prev,
      [currentShiftKey]: {
        ...prev[currentShiftKey],
        header: newHeader,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  // Vider le rapport des breakbulk (Shift en cours)
  const handleClearCurrentShift = () => {
    setShiftsData((prev) => {
      const active = prev[currentShiftKey];
      return {
        ...prev,
        [currentShiftKey]: {
          ...active,
          header: { ...active.header, truckCountManual: '' },
          rows: create25Rows(active.header.date),
          stoppages: [],
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  // Vider le rapport des breakbulk (Tous les 3 shifts)
  const handleClearAllShifts = () => {
    setShiftsData((prev) => {
      const cleared: Record<ShiftKey, ReportData> = {
        shift1: {
          ...prev.shift1,
          header: { ...prev.shift1.header, truckCountManual: '' },
          rows: create25Rows(prev.shift1.header.date),
          stoppages: [],
          updatedAt: new Date().toISOString(),
        },
        shift2: {
          ...prev.shift2,
          header: { ...prev.shift2.header, truckCountManual: '' },
          rows: create25Rows(prev.shift2.header.date),
          stoppages: [],
          updatedAt: new Date().toISOString(),
        },
        shift3: {
          ...prev.shift3,
          header: { ...prev.shift3.header, truckCountManual: '' },
          rows: create25Rows(prev.shift3.header.date),
          stoppages: [],
          updatedAt: new Date().toISOString(),
        },
      };
      return cleared;
    });
  };

  // Reset to initial realistic sample data
  const handleResetSample = () => {
    if (
      window.confirm(
        'Rétablir les données de démonstration avec les 3 shifts programmés ?'
      )
    ) {
      setShiftsData(initialShiftsState);
      localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(initialShiftsState));
    }
  };

  // Print active shift sheet
  const handlePrint = () => {
    window.print();
  };

  // Export to CSV for active shift
  const handleExportCSV = () => {
    const { header, rows } = currentReport;
    const lines: string[] = [];

    // Header metadata
    lines.push(`"${header.title}"`);
    lines.push(`"THE PRODUCER","${header.producer}","","N° SHIFT","${header.shiftNo}"`);
    lines.push(
      `"UNLOADING PLACE","${header.unloadingPlace}","","INSPECTEUR","${header.inspector}"`
    );
    lines.push(`"COMMODITY","${header.commodity}","","DATE","${header.date}"`);
    lines.push(`"POIDS_SAC","1 Big Bag = ${(header.bagWeightKg / 1000).toFixed(3)} T"`);
    lines.push(`"DESTINATION","${header.destination}"`);
    lines.push(`"CLIENT","${header.client}"`);
    lines.push('');

    // Table columns header (3 holds only)
    lines.push(
      '"N°","ARRIVE_DATE","ARRIVE_HOUR","N° CAMION (TRUCK)","N° PLATFORM","N° BON (VOUCHER)","HOLD N° 1","HOLD N° 2","HOLD N° 3","CUMUL SACS TOTAL BAGS"'
    );

    let runningTotal = 0;
    let tH1 = 0,
      tH2 = 0,
      tH3 = 0;

    rows.forEach((r, idx) => {
      const h1 = Number(r.hold1) || 0;
      const h2 = Number(r.hold2) || 0;
      const h3 = Number(r.hold3) || 0;
      const rowSum = h1 + h2 + h3;
      if (rowSum > 0 || r.truckNo || r.voucher || r.platform) {
        runningTotal += rowSum;
      }
      tH1 += h1;
      tH2 += h2;
      tH3 += h3;

      lines.push(
        `"${idx + 1}","${r.date || ''}","${r.hour || ''}","${r.truckNo || ''}","${
          r.platform || ''
        }","${r.voucher || ''}","${h1 || ''}","${h2 || ''}","${h3 || ''}","${
          runningTotal > 0 ? runningTotal : ''
        }"`
      );
    });

    // Totals line
    lines.push(
      `"TOTAL DE LA JOURNEE","","","","","","${tH1}","${tH2}","${tH3}","${runningTotal}"`
    );
    lines.push(
      `"TONNAGE TOTAL (T)","","","","","","${(tH1 * 1.2).toFixed(3)}","${(
        tH2 * 1.2
      ).toFixed(3)}","${(tH3 * 1.2).toFixed(3)}","${(runningTotal * 1.2).toFixed(3)}"`
    );

    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RAPPORT_BREAKBULK_${header.unloadingPlace}_${currentShiftKey}_${header.date.replace(
      /\//g,
      '-'
    )}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 pb-16">
      {/* TOP NAVIGATION & CONTROLS (HIDDEN ON PRINT) */}
      <header className="no-print bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Document Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white uppercase">
                  Pointage Portuaire Breakbulk
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-950 rounded uppercase">
                  {currentReport.header.producer}
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded">
                  3 CALES
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md">
                Navire : <strong className="text-amber-400">{currentReport.header.unloadingPlace}</strong> · {currentReport.header.commodity}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Vider le rapport des breakbulk Button (USER REQUESTED) */}
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Vider le rapport des breakbulk"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vider le rapport des breakbulk</span>
              <span className="sm:hidden">Vider</span>
            </button>

            {/* Quick Entry Modal Trigger */}
            <button
              onClick={() => setIsQuickEntryOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg shadow-sm transition-all transform active:scale-95 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Saisie Rapide</span>
            </button>

            {/* View Original Scanned Image Button */}
            <button
              onClick={() => setIsOriginalImageOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Voir les photos originales"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Photos Originales</span>
            </button>

            {/* Print / PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Imprimer ou enregistrer en PDF la fiche officielle"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Exporter au format Excel CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">CSV</span>
            </button>

            {/* Reset to sample */}
            <button
              onClick={handleResetSample}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Rétablir les 3 shifts d'exemple"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SHIFT SELECTION BAR (1er shift 07:00-15:00, 2ème shift 15:00-23:00, 3ème shift 23:00-07:00) */}
        <div className="bg-slate-950/70 border-t border-slate-800 px-4 sm:px-6 py-2">
          <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* The 3 shifts tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mr-1 hidden sm:inline">
                Poste actif :
              </span>
              {SHIFTS_DEFINITIONS.map((shift) => {
                const isActive = currentShiftKey === shift.key;
                const shiftReport = shiftsData[shift.key];
                const shiftBags = (shiftReport?.rows || []).reduce(
                  (s, r) => s + (Number(r.hold1) || 0) + (Number(r.hold2) || 0) + (Number(r.hold3) || 0),
                  0
                );

                return (
                  <button
                    key={shift.key}
                    onClick={() => setCurrentShiftKey(shift.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 shadow-sm ring-2 ring-amber-300/40'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <span>{shift.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1 rounded ${
                        isActive ? 'bg-amber-500/40 text-slate-950' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {shift.timeRange}
                    </span>
                    {shiftBags > 0 && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-slate-950 text-amber-300'
                            : 'bg-amber-400/20 text-amber-300'
                        }`}
                      >
                        {shiftBags} s.
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Daily Summary Button */}
            <button
              onClick={() => setIsDailySummaryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Synthèse Journée (3 Shifts)</span>
            </button>
          </div>
        </div>

        {/* View mode tabs (Fiche vs Cales vs Arrêts) */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between border-t border-slate-800/80 text-xs py-1">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('sheet')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'sheet'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
              <span>Fiche du Shift ({activeShiftDef.label})</span>
            </button>

            <button
              onClick={() => setActiveTab('stowage')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'stowage'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Ship className="w-3.5 h-3.5 text-amber-500" />
              <span>Plan des Cales & Équilibre</span>
            </button>

            <button
              onClick={() => setActiveTab('stoppages')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'stoppages'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Arrêts du Shift ({currentReport.stoppages?.length || 0})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
            <span>
              Inspecteur en poste : <strong className="text-white">{currentReport.header.inspector}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-5">
        {/* KPI / Statistics Bar for current shift */}
        <div className="no-print mb-5">
          <StatisticsBar
            rows={currentReport.rows}
            header={currentReport.header}
            onUpdateHeader={(updated) => handleSaveHeader({ ...currentReport.header, ...updated })}
          />
        </div>

        {/* TAB 1: OFFICIAL TALLY SHEET */}
        {activeTab === 'sheet' && (
          <div className="space-y-4">
            {/* Quick Actions Bar above the paper sheet */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <span className="font-bold text-slate-950 bg-amber-400 px-2.5 py-1 rounded uppercase tracking-wide">
                  {activeShiftDef.label} : {activeShiftDef.timeRange}
                </span>
                <span className="text-slate-600">
                  Inspecteur : <strong>{currentReport.header.inspector}</strong> · Date : <strong>{currentReport.header.date}</strong>
                </span>
              </div>

              {/* Action buttons including the requested "Vider le rapport des breakbulk" */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsClearModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Vider le rapport des breakbulk"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Vider le rapport des breakbulk</span>
                </button>

                <button
                  onClick={() => setIsEditHeaderOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  <span>Modifier l'en-tête</span>
                </button>
              </div>
            </div>

            {/* THE PRINTABLE SHEET CANVAS */}
            <div className="print-sheet bg-white border border-slate-300 shadow-lg rounded-sm p-4 sm:p-8 max-w-[1180px] mx-auto">
              {/* Header section identical to the image with active shift */}
              <HeaderInfo
                header={currentReport.header}
                onEdit={() => setIsEditHeaderOpen(true)}
              />

              {/* Tally Table with 3 holds and exact matricules */}
              <TallyTable
                rows={currentReport.rows}
                onUpdateRow={handleUpdateRow}
                onAddRow={handleAddRow}
                onDeleteRow={handleDeleteRow}
                selectedRowIndex={selectedRowIndex}
                onSelectRow={(idx) => setSelectedRowIndex(idx)}
              />

              {/* Official Signatures & Stamp section at bottom of document */}
              <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-800">
                <div className="border border-slate-300 rounded p-3 text-center bg-slate-50/50">
                  <span className="font-bold uppercase tracking-wider block mb-1">
                    L'INSPECTEUR / TALLY CLERK ({activeShiftDef.label})
                  </span>
                  <div className="text-[11px] text-slate-500 font-mono mb-6">
                    {currentReport.header.inspector}
                  </div>
                  <div className="border-t border-dashed border-slate-300 pt-1 text-[10px] text-slate-400">
                    Date & Visa
                  </div>
                </div>

                <div className="border border-slate-300 rounded p-3 text-center bg-slate-50/50">
                  <span className="font-bold uppercase tracking-wider block mb-1">
                    SECOND CAPITAINE / CHIEF OFFICER
                  </span>
                  <div className="text-[11px] text-slate-500 font-mono mb-6">
                    {currentReport.header.unloadingPlace} (3 Cales)
                  </div>
                  <div className="border-t border-dashed border-slate-300 pt-1 text-[10px] text-slate-400">
                    Date & Visa Navire
                  </div>
                </div>

                <div className="border border-slate-300 rounded p-3 text-center bg-slate-50/50">
                  <span className="font-bold uppercase tracking-wider block mb-1">
                    STEVE DORE / RESPONSABLE QUAI
                  </span>
                  <div className="text-[11px] text-slate-500 font-mono mb-6">
                    COSUMAR / AC CHADWELL
                  </div>
                  <div className="border-t border-dashed border-slate-300 pt-1 text-[10px] text-slate-400">
                    Cachet & Visa Quai
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHIP HOLD STOWAGE PLAN (3 HOLDS) */}
        {activeTab === 'stowage' && (
          <div className="space-y-4">
            <HoldVisualizer header={currentReport.header} rows={currentReport.rows} />
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-3">
                Répartition des 3 cales · {activeShiftDef.label} ({activeShiftDef.timeRange})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {[1, 2, 3].map((h) => {
                  const holdKey = `hold${h}` as 'hold1' | 'hold2' | 'hold3';
                  const bags = currentReport.rows.reduce(
                    (acc, r) => acc + (Number(r[holdKey]) || 0),
                    0
                  );
                  const mt = bags * 1.2;
                  const trucksForHold = currentReport.rows.filter(
                    (r) => (Number(r[holdKey]) || 0) > 0
                  ).length;

                  return (
                    <div key={h} className="border border-slate-200 rounded p-4 bg-slate-50">
                      <div className="font-black text-slate-900 mb-2 border-b border-slate-200 pb-1.5 flex justify-between items-center">
                        <span className="text-sm text-slate-900">CALE N° {h}</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {h === 1 ? 'Proue (Avant)' : h === 2 ? 'Centre' : 'Poupe (Arrière)'}
                        </span>
                      </div>
                      <div className="space-y-2 text-slate-700">
                        <div className="flex justify-between items-center">
                          <span>Sacs chargés :</span>
                          <strong className="font-mono text-base text-slate-950">{bags.toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Tonnage réel :</span>
                          <strong className="font-mono text-base text-emerald-800">{mt.toFixed(3)} T</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Rotations camion :</span>
                          <strong className="font-mono text-slate-900">{trucksForHold} voyages</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STOPPAGE LOG / REMARKS */}
        {activeTab === 'stoppages' && (
          <div className="space-y-4">
            <StoppageLog
              stoppages={currentReport.stoppages || []}
              onChange={(stoppages) =>
                setShiftsData((prev) => ({
                  ...prev,
                  [currentShiftKey]: {
                    ...prev[currentShiftKey],
                    stoppages,
                  },
                }))
              }
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      {/* 1. Clear Report Modal (USER REQUESTED: "Vider le rapport des breakbulk") */}
      <ClearReportModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        activeShift={activeShiftDef}
        onConfirmClearCurrent={handleClearCurrentShift}
        onConfirmClearAllShifts={handleClearAllShifts}
      />

      {/* 2. Daily Summary Modal (Cumul 24h des 3 shifts) */}
      <DailySummaryModal
        isOpen={isDailySummaryOpen}
        onClose={() => setIsDailySummaryOpen(false)}
        shiftsData={shiftsData}
        onSelectShift={(key) => setCurrentShiftKey(key)}
      />

      {/* 3. Quick Entry Modal with 3 holds and matricule shortcuts */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        rows={currentReport.rows}
        onSaveRow={(index, rowData) => handleUpdateRow(index, rowData)}
        defaultDate={currentReport.header.date}
      />

      {/* 4. Original Scanned Images Preview Modal */}
      <OriginalImageModal
        isOpen={isOriginalImageOpen}
        onClose={() => setIsOriginalImageOpen(false)}
      />

      {/* 5. Edit Header Modal */}
      <EditHeaderModal
        isOpen={isEditHeaderOpen}
        onClose={() => setIsEditHeaderOpen(false)}
        header={currentReport.header}
        onSave={handleSaveHeader}
      />
    </div>
  );
}
