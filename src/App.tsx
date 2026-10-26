import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  RotateCcw,
  Truck,
  Ship,
  Eye,
  Clock,
  Trash2,
  Calendar,
  Layers,
  History,
  Sparkles,
  UserCheck,
  Save,
  CheckCircle2,
  PlusCircle,
  FolderArchive,
  BarChart3,
} from 'lucide-react';

import {
  ReportData,
  ReportHeader,
  TallyRow,
  ShiftKey,
  ModificationLog,
  AgentProfile,
  DayReport24h,
} from './types/tally';
import {
  SHIFTS_DEFINITIONS,
  DEFAULT_AGENTS,
  INITIAL_MODIFICATION_LOGS,
  create25Rows,
  INITIAL_24H_DAYS,
  createFresh24hPeriod,
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
import { LiveModificationsFeed } from './components/LiveModificationsFeed';
import { Consolidated24hView } from './components/Consolidated24hView';
import { DailyPeriodsManagerModal } from './components/DailyPeriodsManagerModal';

const DAYS_STORAGE_KEY = 'breakbulk_tally_24h_days_archive_v8';
const ACTIVE_DAY_ID_KEY = 'breakbulk_tally_active_day_id_v8';
const LOGS_STORAGE_KEY = 'breakbulk_tally_modifications_logs_v8';
const AGENT_STORAGE_KEY = 'breakbulk_tally_active_agent_v8';

export default function App() {
  // Store all 24-hour periods in state
  const [days, setDays] = useState<DayReport24h[]>(() => {
    try {
      const saved = localStorage.getItem(DAYS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_24H_DAYS;
  });

  // Active 24h day period ID
  const [activeDayId, setActiveDayId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_DAY_ID_KEY);
      if (savedId) {
        return savedId;
      }
    } catch {
      // ignore
    }
    return days[0]?.id || 'day-2026-10-26-current';
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

  // Active view tab:
  // 'sheet' = Fiche du Shift
  // 'consolidated24h' = Bilan Consolidé 24h (3 Shifts)
  // 'stowage' = Plan des Cales & Équilibre
  // 'history' = Modifications des Agents
  // 'stoppages' = Arrêts du Shift
  const [activeTab, setActiveTab] = useState<
    'sheet' | 'consolidated24h' | 'stowage' | 'history' | 'stoppages'
  >('sheet');

  // Notification toast message for saving
  const [saveToast, setSaveToast] = useState<{
    visible: boolean;
    message: string;
    details?: string;
  }>({
    visible: false,
    message: '',
  });

  // Modals
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [isBatchFillOpen, setIsBatchFillOpen] = useState(false);
  const [isOriginalImageOpen, setIsOriginalImageOpen] = useState(false);
  const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState(false);
  const [isPeriodsManagerOpen, setIsPeriodsManagerOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // Active day object
  const activeDay = useMemo(() => {
    return days.find((d) => d.id === activeDayId) || days[0] || INITIAL_24H_DAYS[0];
  }, [days, activeDayId]);

  // Active report being viewed/edited (one shift of the active day)
  const currentReport = useMemo(() => {
    return activeDay.shifts[currentShiftKey] || activeDay.shifts.shift1;
  }, [activeDay, currentShiftKey]);

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
      localStorage.setItem(DAYS_STORAGE_KEY, JSON.stringify(days));
    } catch {
      // ignore
    }
  }, [days]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_DAY_ID_KEY, activeDayId);
    } catch {
      // ignore
    }
  }, [activeDayId]);

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

  // Auto-dismiss save toast
  useEffect(() => {
    if (saveToast.visible) {
      const timer = setTimeout(() => {
        setSaveToast({ visible: false, message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saveToast]);

  // Compute 24h grand totals for the active day
  const activeDayTotals = useMemo(() => {
    let totalBags = 0;
    let totalTrucks = 0;
    let h1 = 0;
    let h2 = 0;
    let h3 = 0;

    Object.values(activeDay.shifts).forEach((sh) => {
      sh.rows.forEach((r) => {
        const bag1 = Number(r.hold1) || 0;
        const bag2 = Number(r.hold2) || 0;
        const bag3 = Number(r.hold3) || 0;
        const sum = bag1 + bag2 + bag3;
        if (sum > 0) {
          totalTrucks++;
          totalBags += sum;
          h1 += bag1;
          h2 += bag2;
          h3 += bag3;
        }
      });
    });

    return {
      totalBags,
      totalTonnage: totalBags * 1.2,
      totalTrucks,
      h1,
      h2,
      h3,
    };
  }, [activeDay]);

  // Helper to mutate active day shifts
  const updateActiveDayShifts = useCallback(
    (updater: (prevShifts: Record<ShiftKey, ReportData>) => Record<ShiftKey, ReportData>) => {
      setDays((prevDays) =>
        prevDays.map((d) => {
          if (d.id !== activeDay.id) return d;
          return {
            ...d,
            savedAt: new Date().toISOString(),
            shifts: updater(d.shifts),
          };
        })
      );
    },
    [activeDay.id]
  );

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
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      logModification(
        'modification',
        `Modification ligne N° ${rowNumber} : ${changes.join(', ')}`,
        rowNumber,
        `Agent : ${currentAgent.name} (${currentAgent.role}) à ${timeStr}`
      );
    }

    updateActiveDayShifts((prevShifts) => {
      const activeReport = prevShifts[currentShiftKey];
      const newRows = [...activeReport.rows];
      newRows[index] = {
        ...newRows[index],
        ...updated,
        lastModifiedBy: currentAgent.name,
        lastModifiedAt: new Date().toLocaleTimeString(),
      };

      return {
        ...prevShifts,
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

    updateActiveDayShifts((prevShifts) => {
      const activeReport = prevShifts[currentShiftKey];
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
        ...prevShifts,
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

    updateActiveDayShifts((prevShifts) => {
      const activeReport = prevShifts[currentShiftKey];
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
        ...prevShifts,
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
      `Mise à jour des paramètres d'en-tête (Inspecteur: ${newHeader.inspector}, Camions: ${
        newHeader.truckCountManual || 'auto'
      })`
    );
    updateActiveDayShifts((prevShifts) => ({
      ...prevShifts,
      [currentShiftKey]: {
        ...prevShifts[currentShiftKey],
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

    updateActiveDayShifts((prevShifts) => {
      const active = prevShifts[currentShiftKey];
      return {
        ...prevShifts,
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

  // Vider le rapport des breakbulk (Tous les 3 shifts de la journée active)
  const handleClearAllShifts = () => {
    logModification(
      'suppression',
      `Vidage global des 3 shifts de chargement de la journée du ${activeDay.date} (24h)`
    );

    updateActiveDayShifts((prevShifts) => {
      const cleared: Record<ShiftKey, ReportData> = {
        shift1: {
          ...prevShifts.shift1,
          header: { ...prevShifts.shift1.header, truckCountManual: '' },
          rows: create25Rows(prevShifts.shift1.header.date),
          stoppages: [],
          updatedAt: new Date().toISOString(),
        },
        shift2: {
          ...prevShifts.shift2,
          header: { ...prevShifts.shift2.header, truckCountManual: '' },
          rows: create25Rows(prevShifts.shift2.header.date),
          stoppages: [],
          updatedAt: new Date().toISOString(),
        },
        shift3: {
          ...prevShifts.shift3,
          header: { ...prevShifts.shift3.header, truckCountManual: '' },
          rows: create25Rows(prevShifts.shift3.header.date),
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
      updateActiveDayShifts((prevShifts) => {
        const active = prevShifts[currentShiftKey];
        return {
          ...prevShifts,
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
      // All 3 shifts for the 24h day
      updateActiveDayShifts((prevShifts) => {
        return {
          shift1: {
            ...prevShifts.shift1,
            header: {
              ...prevShifts.shift1.header,
              date: params.date,
              truckCountManual: String(params.rowsCount),
            },
            rows: generateFilledRows('07:15', 4401),
            updatedAt: new Date().toISOString(),
          },
          shift2: {
            ...prevShifts.shift2,
            header: {
              ...prevShifts.shift2.header,
              date: params.date,
              truckCountManual: String(params.rowsCount),
            },
            rows: generateFilledRows('15:15', 4426),
            updatedAt: new Date().toISOString(),
          },
          shift3: {
            ...prevShifts.shift3,
            header: {
              ...prevShifts.shift3.header,
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
        `Remplissage automatique groupé des 3 shifts (Période 24h complète du ${params.date})`,
        undefined,
        `${params.rowsCount} camions par shift · Navette ${params.trucks.join(', ')}`
      );
    }
  };

  // ENREGISTRER LA PERIODE 24H (1er, 2ème et 3ème shift)
  const handleSaveCurrentDay = (notes?: string) => {
    const timestamp = new Date().toISOString();
    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    setDays((prevDays) =>
      prevDays.map((d) => {
        if (d.id !== activeDay.id) return d;
        return {
          ...d,
          savedAt: timestamp,
          savedBy: currentAgent.name,
          status: 'cloturee',
          notes24h: notes !== undefined ? notes : d.notes24h,
        };
      })
    );

    const logDesc = `Enregistrement et sauvegarde officielle de la période 24h du ${activeDay.date} (Jour N° ${activeDay.dayNumber})`;
    const logDetails = `1er, 2ème et 3ème shifts enregistrés avec succès · Total 24h : ${activeDayTotals.totalTrucks} camions, ${activeDayTotals.totalBags.toLocaleString()} sacs (${activeDayTotals.totalTonnage.toFixed(
      3
    )} T) · Agent enregistreur : ${currentAgent.name}`;

    logModification('saisie', logDesc, undefined, logDetails);

    setSaveToast({
      visible: true,
      message: `Période 24h du ${activeDay.date} enregistrée avec succès !`,
      details: `Les données des 3 shifts (07:00-15:00, 15:00-23:00, 23:00-07:00) ont été sauvegardées par ${currentAgent.name} à ${timeFormatted}.`,
    });
  };

  // Create new 24h period
  const handleCreateNewDay = (date: string, dayNumber: number) => {
    const freshDay = createFresh24hPeriod(date, dayNumber, currentAgent.name);
    setDays((prev) => [freshDay, ...prev]);
    setActiveDayId(freshDay.id);
    setCurrentShiftKey('shift1');
    setActiveTab('sheet');

    logModification(
      'saisie',
      `Création et ouverture d'une nouvelle période 24h : Date ${date} (Jour N° ${dayNumber})`,
      undefined,
      `Créée par ${currentAgent.name} (${currentAgent.role}). Initialisation des 3 shifts de 8h.`
    );

    setSaveToast({
      visible: true,
      message: `Nouvelle journée 24h du ${date} (Jour N° ${dayNumber}) initialisée.`,
      details: `Vous pouvez désormais renseigner les fiches du 1er, 2ème et 3ème shift.`,
    });
  };

  // Delete a 24h day period
  const handleDeleteDay = (dayId: string) => {
    const target = days.find((d) => d.id === dayId);
    if (!target) return;

    if (days.length <= 1) {
      alert('Impossible de supprimer la seule période 24h existante.');
      return;
    }

    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement la période 24h du ${target.date} (Jour N° ${target.dayNumber}) ?`
      )
    ) {
      setDays((prev) => prev.filter((d) => d.id !== dayId));
      if (activeDayId === dayId) {
        const remaining = days.filter((d) => d.id !== dayId);
        setActiveDayId(remaining[0].id);
      }
      logModification(
        'suppression',
        `Suppression de l'archive 24h du ${target.date} (Jour N° ${target.dayNumber})`
      );
    }
  };

  // Switch active 24h day
  const handleSelectDay = (dayId: string) => {
    setActiveDayId(dayId);
    const selected = days.find((d) => d.id === dayId);
    if (selected) {
      logModification(
        'saisie',
        `Consultation de la période 24h du ${selected.date} (Jour N° ${selected.dayNumber})`
      );
    }
  };

  // Reset to sample
  const handleResetSample = () => {
    if (
      window.confirm(
        'Rétablir les périodes 24h de démonstration (Jour 1 en cours + Journée précédente archivée) ?'
      )
    ) {
      setDays(INITIAL_24H_DAYS);
      setActiveDayId(INITIAL_24H_DAYS[0].id);
      localStorage.setItem(DAYS_STORAGE_KEY, JSON.stringify(INITIAL_24H_DAYS));
      logModification(
        'remplissage_global',
        "Réinitialisation vers le modèle de démonstration 24h navire MV KAREWOOD"
      );
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Export CSV for current shift
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

  // Export CSV for the entire 24h period (3 shifts)
  const handleExport24hCSV = () => {
    const lines: string[] = [];
    lines.push(`"BILAN CONSOLIDE 24 HEURES - CHARGEMENT BREAKBULK"`);
    lines.push(`"NAVIRE: MV KAREWOOD - PRODUCTEUR: COSUMAR"`);
    lines.push(`"PERIODE DU: ${activeDay.date} - JOUR N°: ${activeDay.dayNumber}"`);
    lines.push(`"POIDS REFERENCE: 1 BIG BAG = 1,200 T"`);
    lines.push('');

    SHIFTS_DEFINITIONS.forEach((def) => {
      const sh = activeDay.shifts[def.key];
      lines.push(`"=== ${def.fullTitle} - INSPECTEUR: ${sh?.header.inspector || def.defaultInspector} ==="`);
      lines.push(
        '"N°","HEURE","CAMION","PLATEFORME","BON","CALE 1","CALE 2","CALE 3","TOTAL SACS"'
      );
      sh?.rows.forEach((r, idx) => {
        const h1 = Number(r.hold1) || 0;
        const h2 = Number(r.hold2) || 0;
        const h3 = Number(r.hold3) || 0;
        const total = h1 + h2 + h3;
        if (total > 0 || r.truckNo) {
          lines.push(
            `"${idx + 1}","${r.hour || ''}","${r.truckNo || ''}","${r.platform || ''}","${
              r.voucher || ''
            }","${h1 || ''}","${h2 || ''}","${h3 || ''}","${total}"`
          );
        }
      });
      lines.push('');
    });

    lines.push(`"GRAND TOTAL 24H: ${activeDayTotals.totalBags} SACS - ${activeDayTotals.totalTonnage.toFixed(3)} TONNES"`);

    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BILAN_24H_BREAKBULK_${activeDay.date.replace(/\//g, '-')}_JOUR_${activeDay.dayNumber}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 pb-16">
      {/* SAVE CONFIRMATION TOAST BANNER */}
      {saveToast.visible && (
        <div className="no-print fixed top-4 right-4 z-50 max-w-md bg-emerald-900 text-white p-4 rounded-xl shadow-2xl border-2 border-emerald-400 flex items-start gap-3 transition-all animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-extrabold text-sm text-emerald-200">{saveToast.message}</h4>
            {saveToast.details && <p className="text-emerald-100 mt-1">{saveToast.details}</p>}
          </div>
          <button
            onClick={() => setSaveToast({ visible: false, message: '' })}
            className="text-emerald-300 hover:text-white cursor-pointer font-bold text-base"
          >
            ✕
          </button>
        </div>
      )}

      {/* TOP NAVIGATION & CONTROLS (HIDDEN ON PRINT) */}
      <header className="no-print bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Document Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white uppercase">
                  Pointage Portuaire Breakbulk
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-950 rounded uppercase">
                  {currentReport.header.producer}
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded">
                  3 CALES
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[200px] sm:max-w-md">
                Navire : <strong className="text-amber-400">{currentReport.header.unloadingPlace}</strong> · 1 Big Bag = 1,200 T
              </p>
            </div>
          </div>

          {/* Action buttons, 24h Saver & Agent Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
            {/* 24H PERIOD SELECTOR & STATUS */}
            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-lg p-1 text-xs">
              <button
                onClick={() => setIsPeriodsManagerOpen(true)}
                className="flex items-center gap-1.5 px-2 py-1 rounded font-bold text-amber-300 hover:text-amber-200 hover:bg-slate-700/80 transition-colors cursor-pointer text-[11px]"
                title="Gérer les périodes de 24h et les archives"
              >
                <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline">Période 24h :</span>
                <strong className="text-white font-mono">{activeDay.date}</strong>
                <span className="bg-slate-900 px-1.5 py-0.2 rounded text-[10px] text-slate-300 font-semibold">
                  J-{activeDay.dayNumber}
                </span>
                {activeDay.status === 'cloturee' ? (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1 py-0.2 rounded text-[9px] uppercase font-bold">
                    Enregistrée
                  </span>
                ) : (
                  <span className="bg-amber-950 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded text-[9px] uppercase font-bold">
                    En cours
                  </span>
                )}
              </button>
            </div>

            {/* BUTTON 1: ENREGISTRER LA PERIODE 24H (PRIMARY USER REQUEST) */}
            <button
              onClick={() => handleSaveCurrentDay()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm ring-2 ring-emerald-400/30 transition-all transform active:scale-95 cursor-pointer shrink-0"
              title="Enregistrer et sauvegarder les données pour cette période de 24 heures (1re, 2e et 3e shift)"
            >
              <Save className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">Enregistrer Période 24h</span>
              <span className="sm:hidden">Enregistrer 24h</span>
            </button>

            {/* Active Agent Selector with 1-click pills */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-amber-400 ml-1 hidden sm:inline" />
              <span className="text-[11px] font-semibold text-slate-400 pl-1 pr-0.5 hidden xl:inline">
                Agent :
              </span>
              {[
                { id: 'agent-mehdi', name: 'A. EL MEHDI' },
                { id: 'agent-faical', name: 'A. FAICAL' },
                { id: 'agent-abderahim', name: 'A. ABDERAHIM' },
              ].map((ag) => {
                const isSelected = currentAgent.id === ag.id || currentAgent.name === ag.name;
                return (
                  <button
                    key={ag.id}
                    type="button"
                    onClick={() => {
                      const found = DEFAULT_AGENTS.find((a) => a.id === ag.id);
                      if (found) {
                        setCurrentAgent(found);
                        logModification('saisie', `Prise de poste : ${found.name} (${found.role})`);
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {ag.name}
                  </button>
                );
              })}
              {/* Dropdown for other agents */}
              <select
                value={currentAgent.id}
                onChange={(e) => {
                  const ag = DEFAULT_AGENTS.find((a) => a.id === e.target.value);
                  if (ag) {
                    setCurrentAgent(ag);
                    logModification('saisie', `Prise de poste : ${ag.name} (${ag.role})`);
                  }
                }}
                className="bg-slate-900/60 text-slate-300 hover:text-white text-[11px] font-bold focus:outline-none cursor-pointer px-1 py-0.5 rounded"
                title="Choisir un autre agent"
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">
                  Autres...
                </option>
                {DEFAULT_AGENTS.map((ag) => (
                  <option key={ag.id} value={ag.id} className="bg-slate-900 text-white">
                    {ag.name} · {ag.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Entry Modal Trigger */}
            <button
              onClick={() => setIsQuickEntryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg shadow-sm transition-all transform active:scale-95 cursor-pointer shrink-0"
            >
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Saisie Rapide</span>
            </button>

            {/* View Original Scanned Image Button */}
            <button
              onClick={() => setIsOriginalImageOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Voir les photos originales"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden 2xl:inline">Photo</span>
            </button>

            {/* Print / PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Imprimer ou enregistrer en PDF la fiche officielle"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            {/* Reset to sample */}
            <button
              onClick={handleResetSample}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Rétablir les données d'exemple"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SHIFT SELECTION BAR (1er shift 07:00-15:00, 2ème shift 15:00-23:00, 3ème shift 23:00-07:00) */}
        <div className="bg-slate-950/70 border-t border-slate-800 px-3 sm:px-6 py-2">
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2.5">
            {/* The 3 shifts tabs for the 24h day */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mr-1 hidden sm:inline">
                Shift actif :
              </span>
              {SHIFTS_DEFINITIONS.map((shift) => {
                const isActive = currentShiftKey === shift.key && activeTab === 'sheet';
                const shiftReport = activeDay.shifts[shift.key];
                const shiftBags = (shiftReport?.rows || []).reduce(
                  (s, r) => s + (Number(r.hold1) || 0) + (Number(r.hold2) || 0) + (Number(r.hold3) || 0),
                  0
                );

                return (
                  <button
                    key={shift.key}
                    onClick={() => {
                      setCurrentShiftKey(shift.key);
                      setActiveTab('sheet');
                    }}
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

            {/* Quick 24h Summary & Period Archives Shortcut */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('consolidated24h')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'consolidated24h'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Bilan Consolidé 24h ({activeDayTotals.totalBags} sacs · {activeDayTotals.totalTonnage.toFixed(3)} T)</span>
              </button>

              <button
                onClick={() => setIsPeriodsManagerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Archives 24h ({days.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* View mode tabs (Fiche vs Bilan 24h vs Cales vs Modifications agents vs Arrêts) */}
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 flex items-center justify-between border-t border-slate-800/80 text-xs py-1">
          <div className="flex gap-1 overflow-x-auto py-0.5">
            <button
              onClick={() => setActiveTab('sheet')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'sheet'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
              <span>Fiche du Shift ({activeShiftDef.label})</span>
            </button>

            {/* TAB: BILAN CONSOLIDE 24H (3 SHIFTS) */}
            <button
              onClick={() => setActiveTab('consolidated24h')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'consolidated24h'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Bilan Consolidé 24h (3 Shifts)</span>
            </button>

            <button
              onClick={() => setActiveTab('stowage')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'stowage'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Ship className="w-3.5 h-3.5 text-amber-500" />
              <span>Plan des Cales</span>
            </button>

            {/* Tab: Voir toutes les modifications par les agents */}
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
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
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'stoppages'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Arrêts du Shift ({currentReport.stoppages?.length || 0})</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
            <span>
              Connecté : <strong className="text-white">{currentAgent.name}</strong> ({currentAgent.role})
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-5">
        {/* KPI / Statistics Bar for current shift */}
        <div className="no-print mb-5">
          <StatisticsBar
            rows={currentReport.rows}
            header={currentReport.header}
            onUpdateHeader={(updated) => handleSaveHeader({ ...currentReport.header, ...updated })}
          />
        </div>

        {/* LIVE MODIFICATIONS STREAM (VISIBLE PAR TOUS LES AGENTS) */}
        <div className="no-print mb-4">
          <LiveModificationsFeed
            logs={modificationLogs}
            onViewAll={() => setActiveTab('history')}
            activeAgentName={currentAgent.name}
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
                  Inspecteur : <strong>{currentReport.header.inspector}</strong> · Date :{' '}
                  <strong>{currentReport.header.date}</strong>
                </span>
                <span className="bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded text-[11px] border border-slate-300">
                  Jour N° {activeDay.dayNumber}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBatchFillOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Remplir automatiquement les informations de la fiche"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Remplir les informations</span>
                </button>

                <button
                  onClick={() => setIsClearModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Vider le rapport des breakbulk"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Vider le rapport des breakbulk</span>
                </button>

                <button
                  onClick={() => handleSaveCurrentDay()}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  title="Enregistrer la période de 24h avec ses 3 shifts"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Enregistrer 24h</span>
                </button>

                <button
                  onClick={() => setIsEditHeaderOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>Modifier En-tête</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* THE OFFICIAL PRINTABLE TALLY SHEET (MATCHING THE SCANNED SCAN) */}
            <div className="print-sheet bg-white border border-slate-300 shadow-lg rounded-sm p-5 sm:p-8 max-w-[1180px] mx-auto text-black">
              {/* Header section identical to physical sheet */}
              <HeaderInfo
                header={currentReport.header}
                onEdit={() => setIsEditHeaderOpen(true)}
              />

              {/* The 25-row Table */}
              <div className="mt-4">
                <TallyTable
                  rows={currentReport.rows}
                  onUpdateRow={handleUpdateRow}
                  onAddRow={handleAddRow}
                  onDeleteRow={handleDeleteRow}
                  selectedRowIndex={selectedRowIndex}
                  onSelectRow={(idx: number) => {
                    setSelectedRowIndex(idx);
                    setIsQuickEntryOpen(true);
                  }}
                />
              </div>

              {/* Official Signatures & Shift Transfer Footer */}
              <div className="mt-8 pt-6 border-t-2 border-black grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                <div>
                  <p className="font-bold text-slate-900 uppercase">1er Shift (07:00 - 15:00)</p>
                  <p className="text-slate-600 font-semibold mt-1">
                    Inspecteur : <strong className="text-black">A. EL MEHDI</strong>
                  </p>
                  <div className="mt-4 h-12 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                    <span className="text-[11px] text-slate-400 italic">Visé au quai</span>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 uppercase">2ème Shift (15:00 - 23:00)</p>
                  <p className="text-slate-600 font-semibold mt-1">
                    Inspecteur : <strong className="text-black">A. FAICAL</strong>
                  </p>
                  <div className="mt-4 h-12 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                    <span className="text-[11px] text-slate-400 italic">Visé au quai</span>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 uppercase">3ème Shift (23:00 - 07:00)</p>
                  <p className="text-slate-600 font-semibold mt-1">
                    Inspecteur : <strong className="text-black">A. ABDERAHIM</strong>
                  </p>
                  <div className="mt-4 h-12 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                    <span className="text-[11px] text-slate-400 italic">Visé au quai</span>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 uppercase">Visa Capitainerie / Bord</p>
                  <p className="text-slate-600 font-semibold mt-1">
                    Navire : <strong className="text-black">MV KAREWOOD</strong>
                  </p>
                  <div className="mt-4 h-12 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                    <span className="text-[11px] text-slate-400 italic">Signature & Cachet</span>
                  </div>
                </div>
              </div>

              {/* Timestamp & Legal Disclaimer */}
              <div className="mt-4 text-[10px] text-slate-500 flex justify-between items-center print:text-black">
                <span>Document officiel de pointage Breakbulk · COSUMAR S.A.</span>
                <span>
                  Généré le {new Date().toLocaleDateString('fr-FR')} à{' '}
                  {new Date().toLocaleTimeString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BILAN CONSOLIDE 24 HEURES (3 SHIFTS) */}
        {activeTab === 'consolidated24h' && (
          <Consolidated24hView
            day={activeDay}
            onPrint={handlePrint}
            onExportCSV={handleExport24hCSV}
          />
        )}

        {/* TAB 3: STOWAGE PLAN & 3 HOLDS BALANCE */}
        {activeTab === 'stowage' && (
          <div className="space-y-6">
            <HoldVisualizer
              header={currentReport.header}
              rows={currentReport.rows}
            />

            {/* Hold Details summary table */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 uppercase mb-3 flex items-center gap-2">
                <Ship className="w-4 h-4 text-amber-500" />
                <span>Répartition du Sucre en Sacs par Cale (1 Big Bag = 1,200 T)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((h) => {
                  const bags = currentReport.rows.reduce(
                    (sum, r) =>
                      sum + (Number(h === 1 ? r.hold1 : h === 2 ? r.hold2 : r.hold3) || 0),
                    0
                  );
                  const mt = bags * 1.2;
                  const trucksForHold = currentReport.rows.filter(
                    (r) => (Number(h === 1 ? r.hold1 : h === 2 ? r.hold2 : r.hold3) || 0) > 0
                  ).length;

                  return (
                    <div
                      key={h}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex justify-between items-center font-bold border-b border-slate-200 pb-2 mb-2">
                        <span className="text-sm text-slate-900">CALE N° {h}</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {h === 1 ? 'Proue (Avant)' : h === 2 ? 'Centre' : 'Poupe (Arrière)'}
                        </span>
                      </div>
                      <div className="space-y-2 text-slate-700">
                        <div className="flex justify-between items-center">
                          <span>Sacs chargés :</span>
                          <strong className="font-mono text-base text-slate-950">
                            {bags.toLocaleString()}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Tonnage réel :</span>
                          <strong className="font-mono text-base text-emerald-800">
                            {mt.toFixed(3)} T
                          </strong>
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

        {/* TAB 4: AUDIT TRAIL / MODIFICATIONS DES AGENTS */}
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

        {/* TAB 5: STOPPAGE LOG / REMARKS */}
        {activeTab === 'stoppages' && (
          <div className="space-y-4">
            <StoppageLog
              stoppages={currentReport.stoppages || []}
              onChange={(stoppages) => {
                logModification(
                  'arret',
                  `Mise à jour du registre des arrêts (${stoppages.length} arrêts au total)`
                );
                updateActiveDayShifts((prevShifts) => ({
                  ...prevShifts,
                  [currentShiftKey]: {
                    ...prevShifts[currentShiftKey],
                    stoppages,
                  },
                }));
              }}
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      {/* 1. 24h Daily Periods Archive Manager Modal */}
      <DailyPeriodsManagerModal
        isOpen={isPeriodsManagerOpen}
        onClose={() => setIsPeriodsManagerOpen(false)}
        days={days}
        activeDayId={activeDay.id}
        onSelectDay={handleSelectDay}
        onCreateNewDay={handleCreateNewDay}
        onSaveCurrentDay={handleSaveCurrentDay}
        onDeleteDay={handleDeleteDay}
        activeAgentName={currentAgent.name}
      />

      {/* 2. Batch Fill Modal ("Remplir les informations par tous") */}
      <BatchFillModal
        isOpen={isBatchFillOpen}
        onClose={() => setIsBatchFillOpen(false)}
        activeShift={activeShiftDef}
        onApplyBatchFill={handleApplyBatchFill}
      />

      {/* 3. Clear Report Modal */}
      <ClearReportModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        activeShift={activeShiftDef}
        onConfirmClearCurrent={handleClearCurrentShift}
        onConfirmClearAllShifts={handleClearAllShifts}
      />

      {/* 4. Daily Summary Modal (Cumul 24h des 3 shifts) */}
      <DailySummaryModal
        isOpen={isDailySummaryOpen}
        onClose={() => setIsDailySummaryOpen(false)}
        shiftsData={activeDay.shifts}
        onSelectShift={(key) => {
          setCurrentShiftKey(key);
          setActiveTab('sheet');
        }}
      />

      {/* 5. Quick Entry Modal */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        rows={currentReport.rows}
        onSaveRow={(index, rowData) => handleUpdateRow(index, rowData)}
        defaultDate={currentReport.header.date}
      />

      {/* 6. Original Scanned Images Preview Modal */}
      <OriginalImageModal
        isOpen={isOriginalImageOpen}
        onClose={() => setIsOriginalImageOpen(false)}
      />

      {/* 7. Edit Header Modal */}
      <EditHeaderModal
        isOpen={isEditHeaderOpen}
        onClose={() => setIsEditHeaderOpen(false)}
        header={currentReport.header}
        onSave={handleSaveHeader}
      />
    </div>
  );
}
