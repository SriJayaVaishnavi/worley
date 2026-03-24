import React from 'react';
import { Delta } from '../types';
import { cn } from '../lib/utils';
import { AlertCircle, Clock, DollarSign, Layers } from 'lucide-react';

interface DeltaTableProps {
  deltas: Delta[];
}

export const DeltaTable: React.FC<DeltaTableProps> = ({ deltas }) => {
  const getIcon = (type: Delta['type']) => {
    switch (type) {
      case 'Schedule': return <Clock className="w-3 h-3" />;
      case 'Procurement': return <Layers className="w-3 h-3" />;
      case 'Cost': return <DollarSign className="w-3 h-3" />;
      case 'Inconsistency': return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getSeverityClass = (severity: Delta['severity']) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low': return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
      <div className="p-4 border-bottom border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">System Inconsistencies (Deltas)</h3>
        <span className="text-[10px] font-mono text-zinc-400">Total: {deltas.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Task</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Type</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Issue</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Evidence</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {deltas.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-zinc-400 italic">
                  No deltas detected yet.
                </td>
              </tr>
            ) : (
              deltas.map((delta) => (
                <tr key={delta.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-900">{delta.task_name}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{delta.task_id}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 rounded-md w-fit">
                      {getIcon(delta.type)}
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{delta.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-zinc-700 font-medium">{delta.issue}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono text-zinc-500 bg-zinc-50 px-2 py-1 rounded border border-zinc-100">
                      {delta.evidence}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
                      getSeverityClass(delta.severity)
                    )}>
                      {delta.severity}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
