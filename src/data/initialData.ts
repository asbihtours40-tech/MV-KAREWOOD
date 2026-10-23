import { ReportData, TallyRow, ShiftDefinition, ShiftKey } from '../types/tally';

export const TRUCK_NUMBERS_FROM_IMAGE = [
  '61516 A 55',
  '65333 A 55',
  '56061 A 55',
];

export const SHIFTS_DEFINITIONS: ShiftDefinition[] = [
  {
    key: 'shift1',
    label: '1er Shift',
    timeRange: '07:00 - 15:00',
    fullTitle: '1er SHIFT (07:00 - 15:00)',
    defaultInspector: 'K. EL IDRISSI',
  },
  {
    key: 'shift2',
    label: '2ème Shift',
    timeRange: '15:00 - 23:00',
    fullTitle: '2ème SHIFT (15:00 - 23:00)',
    defaultInspector: 'M. BENNANI',
  },
  {
    key: 'shift3',
    label: '3ème Shift',
    timeRange: '23:00 - 07:00',
    fullTitle: '3ème SHIFT (23:00 - 07:00)',
    defaultInspector: 'A. TAZI',
  },
];

export const createEmptyRow = (
  rowNumber: number,
  defaultDate: string = '22/10/2026',
  truckNo: string = ''
): TallyRow => ({
  id: `row-${rowNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  rowNumber,
  date: defaultDate,
  hour: '',
  truckNo: truckNo, // Vider la case N° Camion pour saisie directe
  platform: '',
  voucher: '',
  hold1: null,
  hold2: null,
  hold3: null,
  notes: '',
});

export const create25Rows = (defaultDate: string = '22/10/2026'): TallyRow[] => {
  return Array.from({ length: 25 }, (_, i) =>
    createEmptyRow(i + 1, defaultDate, '')
  );
};

export const createBlankReportForShift = (
  shiftKey: ShiftKey,
  date: string = '22/10/2026'
): ReportData => {
  const def = SHIFTS_DEFINITIONS.find((s) => s.key === shiftKey) || SHIFTS_DEFINITIONS[0];
  return {
    id: `report-${shiftKey}-${Date.now()}`,
    name: `COSUMAR - MV KAREWOOD - ${def.label}`,
    shiftKey,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    header: {
      title: 'RAPPORT DES BREAKBULK AU CHARGEMENT',
      producer: 'COSUMAR',
      unloadingPlace: 'MV KAREWOOD',
      commodity: 'WHITE REFINED SUGAR IN big bag (1,200 T)',
      destination: 'Gaeta, Italy / Kavala, Greece',
      client: 'A/C Chadwell',
      shiftNo: def.fullTitle,
      inspector: def.defaultInspector,
      date,
      bagWeightKg: 1200,
      truckCountManual: '',
      holdCapacities: {
        hold1: 2200,
        hold2: 3600,
        hold3: 2800,
      },
    },
    rows: create25Rows(date),
    stoppages: [],
  };
};

export const initialShiftsState: Record<ShiftKey, ReportData> = {
  shift1: {
    id: 'report-shift-1',
    name: 'COSUMAR - MV KAREWOOD - 1er Shift',
    shiftKey: 'shift1',
    createdAt: '2026-10-22T07:00:00Z',
    updatedAt: new Date().toISOString(),
    header: {
      title: 'RAPPORT DES BREAKBULK AU CHARGEMENT',
      producer: 'COSUMAR',
      unloadingPlace: 'MV KAREWOOD',
      commodity: 'WHITE REFINED SUGAR IN big bag (1,200 T)',
      destination: 'Gaeta, Italy / Kavala, Greece',
      client: 'A/C Chadwell',
      shiftNo: '1er SHIFT (07:00 - 15:00)',
      inspector: 'K. EL IDRISSI',
      date: '22/10/2026',
      bagWeightKg: 1200,
      truckCountManual: '',
      holdCapacities: {
        hold1: 2200,
        hold2: 3600,
        hold3: 2800,
      },
    },
    // All 25 rows start with empty truckNo for user entry
    rows: create25Rows('22/10/2026'),
    stoppages: [],
  },
  shift2: {
    id: 'report-shift-2',
    name: 'COSUMAR - MV KAREWOOD - 2ème Shift',
    shiftKey: 'shift2',
    createdAt: '2026-10-22T15:00:00Z',
    updatedAt: new Date().toISOString(),
    header: {
      title: 'RAPPORT DES BREAKBULK AU CHARGEMENT',
      producer: 'COSUMAR',
      unloadingPlace: 'MV KAREWOOD',
      commodity: 'WHITE REFINED SUGAR IN big bag (1,200 T)',
      destination: 'Gaeta, Italy / Kavala, Greece',
      client: 'A/C Chadwell',
      shiftNo: '2ème SHIFT (15:00 - 23:00)',
      inspector: 'M. BENNANI',
      date: '22/10/2026',
      bagWeightKg: 1200,
      truckCountManual: '',
      holdCapacities: {
        hold1: 2200,
        hold2: 3600,
        hold3: 2800,
      },
    },
    rows: create25Rows('22/10/2026'),
    stoppages: [],
  },
  shift3: {
    id: 'report-shift-3',
    name: 'COSUMAR - MV KAREWOOD - 3ème Shift',
    shiftKey: 'shift3',
    createdAt: '2026-10-22T23:00:00Z',
    updatedAt: new Date().toISOString(),
    header: {
      title: 'RAPPORT DES BREAKBULK AU CHARGEMENT',
      producer: 'COSUMAR',
      unloadingPlace: 'MV KAREWOOD',
      commodity: 'WHITE REFINED SUGAR IN big bag (1,200 T)',
      destination: 'Gaeta, Italy / Kavala, Greece',
      client: 'A/C Chadwell',
      shiftNo: '3ème SHIFT (23:00 - 07:00)',
      inspector: 'A. TAZI',
      date: '22/10/2026',
      bagWeightKg: 1200,
      truckCountManual: '',
      holdCapacities: {
        hold1: 2200,
        hold2: 3600,
        hold3: 2800,
      },
    },
    rows: create25Rows('22/10/2026'),
    stoppages: [],
  },
};

export const DEFAULT_AGENTS = [
  {
    id: 'agent-1',
    name: 'K. EL IDRISSI',
    role: 'Inspecteur Principal (1er Shift)',
    code: 'INSP-01',
  },
  {
    id: 'agent-2',
    name: 'M. BENNANI',
    role: 'Pointeur Quai (2ème Shift)',
    code: 'POINT-02',
  },
  {
    id: 'agent-3',
    name: 'A. TAZI',
    role: 'Pointeur Nuit (3ème Shift)',
    code: 'POINT-03',
  },
  {
    id: 'agent-4',
    name: 'H. CHRAIBI',
    role: 'Superviseur Logistique COSUMAR',
    code: 'SUP-CSM',
  },
  {
    id: 'agent-5',
    name: 'CAPT. O. PETROV',
    role: 'Second Capitaine MV KAREWOOD',
    code: 'CH-OFF',
  },
];

export const INITIAL_MODIFICATION_LOGS = [
  {
    id: 'log-1',
    timestamp: '22/10/2026 à 07:05',
    agentName: 'K. EL IDRISSI',
    agentRole: 'Inspecteur Principal (1er Shift)',
    shiftKey: 'shift1' as const,
    shiftLabel: '1er Shift (07:00 - 15:00)',
    actionType: 'saisie' as const,
    description: "Ouverture officielle de la fiche de chargement navire MV KAREWOOD",
    details: "Vérification cales 1, 2, 3 propres et sèches. Marchandise : Sucre blanc raffiné en big bags.",
  },
  {
    id: 'log-2',
    timestamp: '22/10/2026 à 07:15',
    agentName: 'K. EL IDRISSI',
    agentRole: 'Inspecteur Principal (1er Shift)',
    shiftKey: 'shift1' as const,
    shiftLabel: '1er Shift (07:00 - 15:00)',
    rowNumber: 1,
    actionType: 'saisie' as const,
    description: "Pointage Camion 61516 A 55 - Bon BON-4401 - Cale 1 : 25 sacs (30.000 T)",
    details: "Début chargement Cale N° 1 sous Grue Quai 1.",
  },
  {
    id: 'log-3',
    timestamp: '22/10/2026 à 10:15',
    agentName: 'H. CHRAIBI',
    agentRole: 'Superviseur Logistique COSUMAR',
    shiftKey: 'shift1' as const,
    shiftLabel: '1er Shift (07:00 - 15:00)',
    actionType: 'arret' as const,
    description: "Enregistrement arrêt de chargement : Pause technique & Contrôle élingues de grue (10:15 - 10:35)",
    details: "Contrôle de sécurité des apparaux de levage.",
  },
];

