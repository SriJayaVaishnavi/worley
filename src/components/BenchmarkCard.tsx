import React from 'react';
import { History, CheckCircle, ArrowRight, Check } from 'lucide-react';
import { Benchmark } from '../types';

interface BenchmarkCardProps {
  benchmark: Benchmark;
  onApplyStrategy?: (benchmark: Benchmark) => void;
  isApplied?: boolean;
}

export const BenchmarkCard: React.FC<BenchmarkCardProps> = ({ benchmark, onApplyStrategy, isApplied }) => {
  return (
    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Historical Benchmark</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">{benchmark.similarity}% Match</span>
      </div>

      <h4 className="text-sm font-bold text-worley-navy mb-1">{benchmark.project_type}</h4>
      <p className="text-xs text-zinc-600 mb-4 line-clamp-2 italic">"{benchmark.scenario}"</p>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 block">Outcome</span>
            <p className="text-xs text-zinc-700">{benchmark.outcome}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="mt-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 block">Mitigation Strategy</span>
            <p className="text-xs text-zinc-800 font-medium">{benchmark.mitigation}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => onApplyStrategy?.(benchmark)}
        disabled={isApplied}
        className={`mt-4 w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
          isApplied
            ? 'bg-green-50 border border-green-200 text-green-700 cursor-default'
            : 'bg-white border border-zinc-200 text-zinc-500 hover:text-worley-navy hover:border-worley-navy'
        }`}
      >
        {isApplied ? (
          <>Strategy Applied <Check className="w-3 h-3" /></>
        ) : (
          <>Simulate Mitigation <ArrowRight className="w-3 h-3" /></>
        )}
      </button>
    </div>
  );
};
