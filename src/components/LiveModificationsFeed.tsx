import React, { useState } from 'react';
import { History, User, ChevronRight, Eye, Sparkles } from 'lucide-react';
import { ModificationLog } from '../types/tally';

interface LiveModificationsFeedProps {
  logs: ModificationLog[];
  onViewAll: () => void;
  activeAgentName: string;
}

export const LiveModificationsFeed: React.FC<LiveModificationsFeedProps> = ({
  logs,
  onViewAll,
  activeAgentName,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Take the 3 most recent logs
  const recentLogs = logs.slice(0, 3);

  if (logs.length === 0) return null;

  return (
    <div className="no-print bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-lg p-3 text-white shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Suivi des modifications en direct (Visible par tous les agents)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded transition-colors cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            <span>Voir tout l'historique ({logs.length})</span>
            <ChevronRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded cursor-pointer"
          >
            {isExpanded ? 'Réduire' : 'Afficher'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2.5 pt-2 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-3 gap-2">
          {recentLogs.map((log) => {
            const isMe = log.agentName === activeAgentName;
            return (
              <div
                key={log.id}
                className={`rounded p-2 text-xs border transition-colors ${
                  isMe
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-slate-800/80 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1 text-[10px]">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{log.agentName}</span>
                    {isMe && <span className="text-[9px] text-amber-200">(Vous)</span>}
                  </span>
                  <span className="font-mono text-slate-400">{log.timestamp.split('à')[1] || log.timestamp}</span>
                </div>
                <div className="text-[11px] font-medium text-slate-200 line-clamp-1">
                  {log.description}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
