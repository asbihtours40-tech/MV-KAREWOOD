import React, { useState, useEffect, useCallback } from 'react';
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
  History,
  Sparkles,
  UserCheck,
  User,
} from 'lucide-react';

import {
  ReportData,
  ReportHeader,
  TallyRow,
  ShiftKey,
  ModificationLog,
  AgentProfile,
} from './types/tally';
import {
  initialShiftsState,
  SHIFTS_DEFINITIONS,
  DEFAULT_AGENTS,
  INITIAL_MODIFICATION_LOGS,
  create25Rows,
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
import { AgentModificationsHistory } from './components/AgentModificationsHistory';
import { BatchFillModal } from './components/BatchFillModal';

const SHIFTS_STORAGE_KEY = 'breakbulk_tally_3shifts_storage_v5';
const LOGS_STORAGE_KEY = 'breakbulk_tally_modifications_logs_v5';
const AGENT_STORAGE_KEY = 'breakbulk_tally_active_agent_v5';

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

  // Active agent profile
  const [currentAgent, setCurrentAgent] = useState<AgentProfile>(() => {
    try {
      const saved = localStorage.getItem(AGENT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_AGENTS[0];
  });

  // Audit trail / modifications logs
  const [modificationLogs, setModificationLogs] = useState<ModificationLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_MODIFICATION_LOGS;
  });

  // Active shift selection: shift1 (07:00-15:00), shift2 (15:00-23:00), shift3 (23:00-07:00)
  const [currentShiftKey, setCurrentShiftKey] = useState<ShiftKey>('shift1');

  // Active view tab (Fiche, Plan des cales, Modifications agents, Arrêts)
  const [activeTab, setActiveTab] = useState<'sheet' | 'stowage' | 'history' | 'stoppages'>('sheet');

  // Modals
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [isBatchFillOpen, setIsBatchFillOpen] = useState(false);
  const [isOriginalImageOpen, setIsOriginalImageOpen] = useState(false);
  const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // Active report being viewed/edited
  const currentReport = shiftsData[currentShiftKey] || initialShiftsState[currentShiftKey];
  const activeShiftDef =
    SHIFTS_DEFINITIONS.find((s) => s.key === currentShiftKey) || SHIFTS_DEFINITIONS[0];

  // Helper to add audit trail log
  const logModification = useCallback(
    (
      actionType: 'saisie' | 'modification' | 'suppression' | 'remplissage_global' | 'arret',
      description: string,
      rowNumber?: number,
      details?: string,
      targetShiftKey?: ShiftKey
    ) => {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const sec = String(now.getSeconds()).padStart(2, '0');

      const shiftK = targetShiftKey || currentShiftKey;
      const shiftDef = SHIFTS_DEFINITIONS.find((s) => s.key === shiftK) || activeShiftDef;

      const newLog: ModificationLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: `${dd}/${mm}/${yyyy} à ${hh}:${min}:${sec}`,
        agentName: currentAgent.name,
        agentRole: currentAgent.role,
        shiftKey: shiftK,
        shiftLabel: shiftDef.fullTitle,
        rowNumber,
        actionType,
        description,
        details,
      };

      setModificationLogs((prev) => [newLog, ...prev]);
    },
    [currentAgent, currentShiftKey, activeShiftDef]
  );

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(shiftsData));
    } catch {
      // ignore
    }
  }, [shiftsData]);

  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(modificationLogs));
    } catch {
      // ignore
    }
  }, [modificationLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(currentAgent));
    } catch {
      // ignore
    }
  }, [currentAgent]);

  // Update a single row in the active shift
  const handleUpdateRow = (index: number, updated: Partial<TallyRow>) => {
    const rowNumber = index + 1;
    const existing = currentReport.rows[index];

    // Log the change
    const changes: string[] = [];
    if (updated.truckNo !== undefined && updated.truckNo !== existing?.truckNo) {
      changes.push(`Matricule : "${updated.truckNo || '(vide)'}"`);
    }
    if (updated.hour !== undefined && updated.hour !== existing?.hour) {
      changes.push(`Heure : ${updated.hour}`);
    }
    if (updated.voucher !== undefined && updated.voucher !== existing?.voucher) {
      changes.push(`Bon : ${updated.voucher}`);
    }
    if (updated.platform !== undefined && updated.platform !== existing?.platform) {
      changes.push(`Plateforme : ${updated.platform}`);
    }
    if (updated.hold1 !== undefined && updated.hold1 !== existing?.hold1) {
      changes.push(`Cale 1 : ${updated.hold1 || 0} sacs`);
    }
    if (updated.hold2 !== undefined && updated.hold2 !== existing?.hold2) {
      changes.push(`Cale 2 : ${updated.hold2 || 0} sacs`);
    }
    if (updated.hold3 !== undefined && updated.hold3 !== existing?.hold3) {
      changes.push(`Cale 3 : ${updated.hold3 || 0} sacs`);
    }

    if (changes.length > 0) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      logModification(
        'modification',
        `Modification ligne N° ${rowNumber} : ${changes.join(', ')}`,
        rowNumber,
        `Agent : ${currentAgent.name} (${currentAgent.role}) à ${timeStr}`
      );
    }

    setShiftsData((prev) => {
      const activeReport = prev[currentShiftKey];
      const newRows = [...activeReport.rows];
      newRows[index] = {
        ...newRows[index],
        ...updated,
        lastModifiedBy: currentAgent.name,
        lastModifiedAt: new Date().toLocaleTimeString(),
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

  // Add row to active shift
  const handleAddRow = () => {
    const newRowNum = currentReport.rows.length + 1;
    logModification('saisie', `Ajout de la ligne N° ${newRowNum} sur la fiche`, newRowNum);

    setShiftsData((prev) => {
      const activeReport = prev[currentShiftKey];
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
        lastModifiedBy: currentAgent.name,
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
    const rowNumber = index + 1;
    logModification('suppression', `Effacement des données de la ligne N° ${rowNumber}`, rowNumber);

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
        lastModifiedBy: currentAgent.name,
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
    logModification(
      'modification',
      `Mise à jour des paramètres d'en-tête (Inspecteur: ${newHeader.inspector}, Camions: ${newHeader.truckCountManual || 'auto'})`
    );
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
    logModification(
      'suppression',
      `Vidage complet de la fiche de chargement pour le ${activeShiftDef.label} (${activeShiftDef.timeRange})`
    );

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
    logModification('suppression', 'Vidage global des 3 shifts de chargement de la journée (24h)');

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

  // Apply batch fill ("Remplir les informations par tous")
  const handleApplyBatchFill = (params: {
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
  }) => {
    // Generate rows helper
    const generateFilledRows = (baseStartHour: string, baseStartVoucher: number) => {
      const [startH, startM] = baseStartHour.split(':').map((n) => parseInt(n, 10) || 0);
      let currentMinutes = startH * 60 + startM;

      return Array.from({ length: 25 }, (_, i) => {
        if (i < params.rowsCount) {
          const hh = Math.floor((currentMinutes / 60) % 24);
          const mm = currentMinutes % 60;
          const hourStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
          currentMinutes += params.intervalMinutes;

          const truckNo = params.trucks[i % params.trucks.length] || '';
          const voucher = `${params.voucherPrefix}${baseStartVoucher + i}`;
          const platform = params.platformAlternating ? (i % 2 === 0 ? 'P-01' : 'P-02') : 'P-01';

          let h1: number | null = null;
          let h2: number | null = null;
          let h3: number | null = null;

          if (params.distribution === 'equitable') {
            const holdSlot = i % 3;
            if (holdSlot === 0) h1 = params.bagsPerTruck;
            else if (holdSlot === 1) h2 = params.bagsPerTruck;
            else h3 = params.bagsPerTruck;
          } else if (params.distribution === 'hold1') {
            h1 = params.bagsPerTruck;
          } else if (params.distribution === 'hold2') {
            h2 = params.bagsPerTruck;
          } else if (params.distribution === 'hold3') {
            h3 = params.bagsPerTruck;
          }

          return {
            id: `row-batch-${i + 1}-${Date.now()}`,
            rowNumber: i + 1,
            date: params.date,
            hour: hourStr,
            truckNo,
            platform,
            voucher,
            hold1: h1,
            hold2: h2,
            hold3: h3,
            notes: '',
            lastModifiedBy: currentAgent.name,
            lastModifiedAt: new Date().toLocaleTimeString(),
          };
        } else {
          return {
            id: `row-empty-${i + 1}-${Date.now()}`,
            rowNumber: i + 1,
            date: params.date,
            hour: '',
            truckNo: '',
            platform: '',
            voucher: '',
            hold1: null,
            hold2: null,
            hold3: null,
            notes: '',
          };
        }
      });
    };

    if (params.scope === 'current') {
      const newRows = generateFilledRows(params.startHour, params.startVoucherNum);
      setShiftsData((prev) => {
        const active = prev[currentShiftKey];
        return {
          ...prev,
          [currentShiftKey]: {
            ...active,
            header: {
              ...active.header,
              date: params.date,
              truckCountManual: String(params.rowsCount),
            },
            rows: newRows,
            updatedAt: new Date().toISOString(),
          },
        };
      });

      logModification(
        'remplissage_global',
        `Remplissage automatique de ${params.rowsCount} lignes sur le ${activeShiftDef.label}`,
        undefined,
        `Navette ${params.trucks.join(', ')} · ${params.bagsPerTruck} sacs/camion · Total ${(
          params.rowsCount *
          params.bagsPerTruck *
          1.2
        ).toFixed(3)} Tonnes`
      );
    } else {
      // All 3 shifts
      setShiftsData((prev) => {
        return {
          shift1: {
            ...prev.shift1,
            header: {
              ...prev.shift1.header,
              date: params.date,
              truckCountManual: String(params.rowsCount),
            },
            rows: generateFilledRows('07:15', 4401),
            updatedAt: new Date().toISOString(),
          },
          shift2: {
            ...prev.shift2,
            header: {
              ...prev.shift2.header,
              date: params.date,
              truckCountManual: String(params.rowsCount),
            },
            rows: generateFilledRows('15:15', 4426),
            updatedAt: new Date().toISOString(),
          },
          shift3: {
            ...prev.shift3,
            header: {
              ...prev.shift3.header,
              date: params.date,
              truckCountManual: String(params.rowsCount),
            },
            rows: generateFilledRows('23:15', 4451),
            updatedAt: new Date().toISOString(),
          },
        };
      });

      logModification(
        'remplissage_global',
        `Remplissage automatique groupé des 3 shifts (Journée complète 24h)`,
        undefined,
        `${params.rowsCount} camions par shift · Navette ${params.trucks.join(', ')}`
      );
    }
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
      logModification('remplissage_global', "Réinitialisation vers le modèle d'exemple navire MV KAREWOOD");
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
                Navire : <strong className="text-amber-400">{currentReport.header.unloadingPlace}</strong> · 1 Big Bag = 1,200 T
              </p>
            </div>
          </div>

          {/* Action buttons & Agent Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Active Agent Selector */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 font-medium">Agent :</span>
              <select
                value={currentAgent.id}
                onChange={(e) => {
                  const ag = DEFAULT_AGENTS.find((a) => a.id === e.target.value);
                  if (ag) {
                    setCurrentAgent(ag);
                    logModification('saisie', `Connexion / Prise de poste de ${ag.name} (${ag.role})`);
                  }
                }}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {DEFAULT_AGENTS.map((ag) => (
                  <option key={ag.id} value={ag.id} className="bg-slate-900 text-white">
                    {ag.name} · {ag.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Remplir toutes les informations Button (USER REQUESTED: "remplir les information par tous") */}
            <button
              onClick={() => setIsBatchFillOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Remplir automatiquement toutes les lignes de la fiche"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Remplir les informations</span>
              <span className="sm:hidden">Remplir</span>
            </button>

            {/* Vider le rapport des breakbulk Button */}
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Vider le rapport des breakbulk"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Vider le rapport</span>
              <span className="xl:hidden">Vider</span>
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
              <span className="hidden 2xl:inline">Photos Originales</span>
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
              title="Rétablir les données d'exemple"
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

        {/* View mode tabs (Fiche vs Cales vs Modifications agents vs Arrêts) */}
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

            {/* Tab: Voir toutes les modifications par les agents */}
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5 text-amber-500" />
              <span>Modifications par les Agents</span>
              <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {modificationLogs.length}
              </span>
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
              Connecté : <strong className="text-white">{currentAgent.name}</strong> ({currentAgent.role})
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

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBatchFillOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Remplir automatiquement les informations de la fiche"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Remplir les informations</span>
                </button>

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

              {/* Tally Table with 3 holds and editable truck cells */}
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

        {/* TAB 3: AUDIT TRAIL / MODIFICATIONS DES AGENTS */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <AgentModificationsHistory
              logs={modificationLogs}
              onClearLogs={() => setModificationLogs([])}
              onSelectShift={(key) => {
                setCurrentShiftKey(key);
                setActiveTab('sheet');
              }}
            />
          </div>
        )}

        {/* TAB 4: STOPPAGE LOG / REMARKS */}
        {activeTab === 'stoppages' && (
          <div className="space-y-4">
            <StoppageLog
              stoppages={currentReport.stoppages || []}
              onChange={(stoppages) => {
                logModification(
                  'arret',
                  `Mise à jour du registre des arrêts (${stoppages.length} arrêts au total)`
                );
                setShiftsData((prev) => ({
                  ...prev,
                  [currentShiftKey]: {
                    ...prev[currentShiftKey],
                    stoppages,
                  },
                }));
              }}
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      {/* 1. Batch Fill Modal ("Remplir les informations par tous") */}
      <BatchFillModal
        isOpen={isBatchFillOpen}
        onClose={() => setIsBatchFillOpen(false)}
        activeShift={activeShiftDef}
        onApplyBatchFill={handleApplyBatchFill}
      />

      {/* 2. Clear Report Modal */}
      <ClearReportModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        activeShift={activeShiftDef}
        onConfirmClearCurrent={handleClearCurrentShift}
        onConfirmClearAllShifts={handleClearAllShifts}
      />

      {/* 3. Daily Summary Modal (Cumul 24h des 3 shifts) */}
      <DailySummaryModal
        isOpen={isDailySummaryOpen}
        onClose={() => setIsDailySummaryOpen(false)}
        shiftsData={shiftsData}
        onSelectShift={(key) => setCurrentShiftKey(key)}
      />

      {/* 4. Quick Entry Modal */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        rows={currentReport.rows}
        onSaveRow={(index, rowData) => handleUpdateRow(index, rowData)}
        defaultDate={currentReport.header.date}
      />

      {/* 5. Original Scanned Images Preview Modal */}
      <OriginalImageModal
        isOpen={isOriginalImageOpen}
        onClose={() => setIsOriginalImageOpen(false)}
      />

      {/* 6. Edit Header Modal */}
      <EditHeaderModal
        isOpen={isEditHeaderOpen}
        onClose={() => setIsEditHeaderOpen(false)}
        header={currentReport.header}
        onSave={handleSaveHeader}
      />
    </div>
  );
}
