import React, { useState } from 'react';
import { History, User, Filter, Search, Calendar, Clock, Download, Trash2, ArrowRight } from 'lucide-react';
import { ModificationLog, ShiftKey } from '../types/tally';

interface AgentModificationsHistoryProps {
  logs: ModificationLog[];
  onClearLogs?: () => void;
  onSelectShift?: (key: ShiftKey) => void;
}

export const AgentModificationsHistory: React.FC<AgentModificationsHistoryProps> = ({
  logs,
  onClearLogs,
  onSelectShift,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('all');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');

  // Unique agents
  const agentsList = Array.from(new Set(logs.map((l) => l.agentName)));

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      searchTerm === '' ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchShift =
      selectedShiftFilter === 'all' || log.shiftKey === selectedShiftFilter;

    const matchAgent =
      selectedAgentFilter === 'all' || log.agentName === selectedAgentFilter;

    return matchSearch && matchShift && matchAgent;
  });

  const exportLogsCSV = () => {
    const lines = [
      '"DATE_HEURE","AGENT","ROLE","SHIFT","LIGNE","ACTION","DESCRIPTION","DETAILS"',
    ];
    filteredLogs.forEach((l) => {
      lines.push(
        `"${l.timestamp}","${l.agentName}","${l.agentRole}","${l.shiftLabel}","${
          l.rowNumber || '-'
        }","${l.actionType}","${l.description.replace(/"/g, '""')}","${(
          l.details || ''
        ).replace(/"/g, '""')}"`
      );
    });

    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HISTORIQUE_MODIFICATIONS_AGENTS_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              Journal d'audit & Modifications par les Agents
            </h3>
            <p className="text-xs text-slate-500">
              Traçabilité complète des saisies, modifications de cales et interventions de chaque pointeur
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportLogsCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Exporter l'historique</span>
          </button>
          {onClearLogs && (
            <button
              onClick={() => {
                if (window.confirm("Effacer tout l'historique des modifications ?")) {
                  onClearLogs();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
              title="Vider le journal d'audit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher (camion, bon, cale, mot-clé)..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Shift filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-semibold shrink-0">Shift :</span>
          <select
            value={selectedShiftFilter}
            onChange={(e) => setSelectedShiftFilter(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-medium focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">Tous les shifts (24h)</option>
            <option value="shift1">1er Shift (07:00 - 15:00)</option>
            <option value="shift2">2ème Shift (15:00 - 23:00)</option>
            <option value="shift3">3ème Shift (23:00 - 07:00)</option>
          </select>
        </div>

        {/* Agent filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-semibold shrink-0">Agent :</span>
          <select
            value={selectedAgentFilter}
            onChange={(e) => setSelectedAgentFilter(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-medium focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">Tous les agents / pointeurs</option>
            {agentsList.map((agent) => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          <strong>{filteredLogs.length}</strong> modification(s) enregistrée(s)
        </span>
        <span className="text-[11px] text-amber-700 italic">
          Chaque action sur la fiche (saisie camion, cale, arrêt, modification) est horodatée automatiquement.
        </span>
      </div>

      {/* List of modifications */}
      {filteredLogs.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200">
          Aucune modification correspondant aux critères de recherche.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
          {filteredLogs.map((log) => {
            const isSaisie = log.actionType === 'saisie';
            const isArret = log.actionType === 'arret';
            const isBatch = log.actionType === 'remplissage_global';

            return (
              <div
                key={log.id}
                className="bg-white border border-slate-200 rounded-lg p-3 hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  {/* Top line badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      {log.agentName}
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                      {log.agentRole}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSaisie
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : isArret
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : isBatch
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {log.shiftLabel}
                    </span>
                    {log.rowNumber && (
                      <span className="text-[10px] font-bold text-amber-950 bg-amber-400 px-1.5 py-0.2 rounded font-mono">
                        Ligne N° {log.rowNumber}
                      </span>
                    )}
                  </div>

                  {/* Main Description */}
                  <div className="font-semibold text-slate-800 pt-0.5">
                    {log.description}
                  </div>

                  {/* Additional details */}
                  {log.details && (
                    <div className="text-[11px] text-slate-500 font-sans leading-tight">
                      {log.details}
                    </div>
                  )}
                </div>

                {/* Right side: Timestamp & Switch to Shift */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{log.timestamp}</span>
                  </div>
                  {onSelectShift && (
                    <button
                      onClick={() => onSelectShift(log.shiftKey)}
                      className="text-amber-700 hover:text-amber-800 font-semibold text-[10px] flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Voir la fiche</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
