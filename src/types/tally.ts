export interface TallyRow {
  id: string;
  rowNumber: number;
  date: string;       // e.g. "22/10/2026"
  hour: string;       // e.g. "08:15"
  truckNo: string;    // N° CAMION (vide par défaut ou rempli)
  platform: string;   // N° PLATFORM
  voucher: string;    // N° BON
  hold1: number | null; // CALE 1
  hold2: number | null; // CALE 2
  hold3: number | null; // CALE 3
  notes?: string;
  lastModifiedBy?: string; // Nom de l'agent ayant modifié la ligne
  lastModifiedAt?: string; // Heure de la modification
}

export interface ReportHeader {
  title: string;
  producer: string;        // THE PRODUCER (COSUMAR)
  unloadingPlace: string;  // UNLOADING PLACE / NAVIRE (MV KAREWOOD)
  commodity: string;       // COMMODITY (WHITE REFINED SUGAR IN big bag)
  destination: string;     // DESTINATION (Gaeta, Italy / Kavala, Greece)
  client: string;          // CLIENT (A/C Chadwell)
  shiftNo: string;         // N° SHIFT (e.g. "1er Shift (07:00 - 15:00)")
  inspector: string;       // INSPECTEUR
  date: string;            // Date du rapport
  bagWeightKg: number;     // 1200 kg (= 1,200 T par big bag)
  truckCountManual?: string | number | null; // Nombre de camions manuel
  holdCapacities: {
    hold1: number;
    hold2: number;
    hold3: number;
  };
}

export interface ReportData {
  id: string;
  name: string;
  shiftKey: 'shift1' | 'shift2' | 'shift3';
  header: ReportHeader;
  rows: TallyRow[];
  createdAt: string;
  updatedAt: string;
  stoppages?: Array<{
    timeStart: string;
    timeEnd: string;
    reason: string;
  }>;
}

export type ShiftKey = 'shift1' | 'shift2' | 'shift3';

export interface ShiftDefinition {
  key: ShiftKey;
  label: string;
  timeRange: string;
  fullTitle: string;
  defaultInspector: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  code: string;
}

export interface ModificationLog {
  id: string;
  timestamp: string;      // Date & heure formattée
  agentName: string;      // Ex: "K. EL IDRISSI"
  agentRole: string;      // Ex: "Inspecteur Quai"
  shiftKey: ShiftKey;
  shiftLabel: string;     // Ex: "1er Shift"
  rowNumber?: number;     // Ex: Ligne 5
  actionType: 'saisie' | 'modification' | 'suppression' | 'remplissage_global' | 'arret';
  description: string;    // Description détaillée
  details?: string;
}

export interface BatchFillConfig {
  date: string;
  startHour: string;
  intervalMinutes: number;
  trucksList: string[];
  startingVoucherNumber: number;
  platform: string;
  bagsPerTruck: number;
  holdDistribution: 'equitable' | 'hold1' | 'hold2' | 'hold3';
  applyToScope: 'current' | 'all';
}
