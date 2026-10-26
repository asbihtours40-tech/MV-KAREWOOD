import { ReportData, TallyRow, ShiftDefinition, ShiftKey, DayReport24h } from '../types/tally';

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
    defaultInspector: 'A. EL MEHDI',
  },
  {
    key: 'shift2',
    label: '2ème Shift',
    timeRange: '15:00 - 23:00',
    fullTitle: '2ème SHIFT (15:00 - 23:00)',
    defaultInspector: 'A. FAICAL',
  },
  {
    key: 'shift3',
    label: '3ème Shift',
    timeRange: '23:00 - 07:00',
    fullTitle: '3ème SHIFT (23:00 - 07:00)',
    defaultInspector: 'A. ABDERAHIM',
  },
];

export const createEmptyRow = (
  rowNumber: number,
  defaultDate: string = '26/10/2026',
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

export const create25Rows = (defaultDate: string = '26/10/2026'): TallyRow[] => {
  return Array.from({ length: 25 }, (_, i) =>
    createEmptyRow(i + 1, defaultDate, '')
  );
};

export const createBlankReportForShift = (
  shiftKey: ShiftKey,
  date: string = '26/10/2026'
): ReportData => {
  const def = SHIFTS_DEFINITIONS.find((s) => s.key === shiftKey) || SHIFTS_DEFINITIONS[0];
  return {
    id: `report-${shiftKey}-${date.replace(/\//g, '-')}-${Date.now()}`,
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

export const createFresh24hPeriod = (
  date: string = '26/10/2026',
  dayNumber: number = 1,
  savedBy: string = 'A. EL MEHDI'
): DayReport24h => {
  return {
    id: `day-${date.replace(/\//g, '-')}-${Date.now()}`,
    date,
    dayNumber,
    savedAt: new Date().toISOString(),
    savedBy,
    status: 'en_cours',
    shifts: {
      shift1: createBlankReportForShift('shift1', date),
      shift2: createBlankReportForShift('shift2', date),
      shift3: createBlankReportForShift('shift3', date),
    },
    notes24h: '',
  };
};

export const DEFAULT_AGENTS = [
  {
    id: 'agent-mehdi',
    name: 'A. EL MEHDI',
    role: 'Inspecteur / Pointeur Quai (1er Shift)',
    code: 'INSP-MEHDI',
  },
  {
    id: 'agent-faical',
    name: 'A. FAICAL',
    role: 'Pointeur Quai & Cales (2ème Shift)',
    code: 'POINT-FAICAL',
  },
  {
    id: 'agent-abderahim',
    name: 'A. ABDERAHIM',
    role: 'Pointeur & Contrôle Pesée (3ème Shift)',
    code: 'POINT-ABDERAHIM',
  },
  {
    id: 'agent-idrissi',
    name: 'K. EL IDRISSI',
    role: 'Inspecteur Coordinateur',
    code: 'INSP-IDRISSI',
  },
  {
    id: 'agent-bennani',
    name: 'M. BENNANI',
    role: 'Chef de Poste Quai',
    code: 'CHEF-BENNANI',
  },
  {
    id: 'agent-chraibi',
    name: 'H. CHRAIBI',
    role: 'Superviseur Logistique COSUMAR',
    code: 'SUP-CSM',
  },
  {
    id: 'agent-petrov',
    name: 'CAPT. O. PETROV',
    role: 'Second Capitaine MV KAREWOOD',
    code: 'CH-OFF',
  },
];

// Realistic sample completed day (25/10/2026) with all 3 shifts filled
const createHistoricalDay25 = (): DayReport24h => {
  const d25 = createFresh24hPeriod('25/10/2026', 1, 'A. EL MEHDI');
  d25.id = 'day-2026-10-25-archive';
  d25.status = 'cloturee';
  d25.notes24h = 'Période 24h clôturée sans incident majeur. Cadence régulière sous grues 1 et 2.';

  // Fill shift 1
  d25.shifts.shift1.rows = Array.from({ length: 25 }, (_, i) => {
    if (i < 18) {
      const truck = TRUCK_NUMBERS_FROM_IMAGE[i % TRUCK_NUMBERS_FROM_IMAGE.length];
      const h = Math.floor(7 + (i * 25) / 60);
      const m = (i * 25) % 60;
      return {
        id: `d25-s1-${i + 1}`,
        rowNumber: i + 1,
        date: '25/10/2026',
        hour: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        truckNo: truck,
        platform: i % 2 === 0 ? 'P-01' : 'P-02',
        voucher: `BON-410${i + 1}`,
        hold1: i % 3 === 0 ? 25 : null,
        hold2: i % 3 === 1 ? 25 : null,
        hold3: i % 3 === 2 ? 25 : null,
        notes: '',
        lastModifiedBy: 'A. EL MEHDI',
      };
    }
    return createEmptyRow(i + 1, '25/10/2026', '');
  });
  d25.shifts.shift1.header.truckCountManual = '18';

  // Fill shift 2
  d25.shifts.shift2.rows = Array.from({ length: 25 }, (_, i) => {
    if (i < 16) {
      const truck = TRUCK_NUMBERS_FROM_IMAGE[i % TRUCK_NUMBERS_FROM_IMAGE.length];
      const h = Math.floor(15 + (i * 25) / 60);
      const m = (i * 25) % 60;
      return {
        id: `d25-s2-${i + 1}`,
        rowNumber: i + 1,
        date: '25/10/2026',
        hour: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        truckNo: truck,
        platform: i % 2 === 0 ? 'P-01' : 'P-02',
        voucher: `BON-412${i + 1}`,
        hold1: i % 3 === 0 ? 25 : null,
        hold2: i % 3 === 1 ? 25 : null,
        hold3: i % 3 === 2 ? 25 : null,
        notes: '',
        lastModifiedBy: 'A. FAICAL',
      };
    }
    return createEmptyRow(i + 1, '25/10/2026', '');
  });
  d25.shifts.shift2.header.truckCountManual = '16';

  // Fill shift 3
  d25.shifts.shift3.rows = Array.from({ length: 25 }, (_, i) => {
    if (i < 14) {
      const truck = TRUCK_NUMBERS_FROM_IMAGE[i % TRUCK_NUMBERS_FROM_IMAGE.length];
      const h = (23 + Math.floor((i * 25) / 60)) % 24;
      const m = (i * 25) % 60;
      return {
        id: `d25-s3-${i + 1}`,
        rowNumber: i + 1,
        date: '25/10/2026',
        hour: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        truckNo: truck,
        platform: i % 2 === 0 ? 'P-01' : 'P-02',
        voucher: `BON-414${i + 1}`,
        hold1: i % 3 === 0 ? 25 : null,
        hold2: i % 3 === 1 ? 25 : null,
        hold3: i % 3 === 2 ? 25 : null,
        notes: '',
        lastModifiedBy: 'A. ABDERAHIM',
      };
    }
    return createEmptyRow(i + 1, '25/10/2026', '');
  });
  d25.shifts.shift3.header.truckCountManual = '14';

  return d25;
};

// Current day: 26/10/2026
const createCurrentDay26 = (): DayReport24h => {
  const d26 = createFresh24hPeriod('26/10/2026', 2, 'A. EL MEHDI');
  d26.id = 'day-2026-10-26-current';
  d26.status = 'en_cours';

  // Pre-fill some active rows on 1er shift for today
  d26.shifts.shift1.rows = Array.from({ length: 25 }, (_, i) => {
    if (i < 10) {
      const truck = TRUCK_NUMBERS_FROM_IMAGE[i % TRUCK_NUMBERS_FROM_IMAGE.length];
      const h = Math.floor(7 + (i * 20) / 60);
      const m = (i * 20) % 60;
      return {
        id: `d26-s1-${i + 1}`,
        rowNumber: i + 1,
        date: '26/10/2026',
        hour: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        truckNo: truck,
        platform: i % 2 === 0 ? 'P-01' : 'P-02',
        voucher: `BON-440${i + 1}`,
        hold1: i % 3 === 0 ? 25 : null,
        hold2: i % 3 === 1 ? 25 : null,
        hold3: i % 3 === 2 ? 25 : null,
        notes: i === 0 ? 'Début chargement cale 1' : '',
        lastModifiedBy: 'A. EL MEHDI',
        lastModifiedAt: '07:18',
      };
    }
    return createEmptyRow(i + 1, '26/10/2026', '');
  });
  d26.shifts.shift1.header.truckCountManual = '10';

  return d26;
};

export const INITIAL_24H_DAYS: DayReport24h[] = [
  createCurrentDay26(),
  createHistoricalDay25(),
];

export const INITIAL_MODIFICATION_LOGS = [
  {
    id: 'log-1',
    timestamp: '26/10/2026 à 07:05:12',
    agentName: 'A. EL MEHDI',
    agentRole: 'Inspecteur / Pointeur Quai (1er Shift)',
    shiftKey: 'shift1' as const,
    shiftLabel: '1er Shift (07:00 - 15:00)',
    actionType: 'saisie' as const,
    description: "Ouverture officielle de la période 24h - Journée du 26/10/2026 (MV KAREWOOD)",
    details: "Contrôle cales 1, 2, 3 effectué par A. EL MEHDI. Autorisation de chargement sucre blanc accordée.",
  },
  {
    id: 'log-2',
    timestamp: '26/10/2026 à 07:18:40',
    agentName: 'A. EL MEHDI',
    agentRole: 'Inspecteur / Pointeur Quai (1er Shift)',
    shiftKey: 'shift1' as const,
    shiftLabel: '1er Shift (07:00 - 15:00)',
    rowNumber: 1,
    actionType: 'saisie' as const,
    description: "Pointage initial : Camion 61516 A 55 - Bon BON-4401 - Cale 1 : 25 sacs (30.000 T)",
    details: "Pesée brute plateforme P-01 vérifiée.",
  },
  {
    id: 'log-3',
    timestamp: '25/10/2026 à 23:55:00',
    agentName: 'A. ABDERAHIM',
    agentRole: 'Pointeur & Contrôle Pesée (3ème Shift)',
    shiftKey: 'shift3' as const,
    shiftLabel: '3ème Shift (23:00 - 07:00)',
    actionType: 'remplissage_global' as const,
    description: "Clôture et enregistrement de la période 24h du 25/10/2026 (48 camions · 1 200 sacs · 1 440.000 T)",
    details: "Enregistrement complet des 3 shifts (1er, 2ème et 3ème shift).",
  },
];
