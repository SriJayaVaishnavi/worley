import React from 'react';
import { AlertTriangle, ShieldAlert, Info, ChevronRight, Leaf, TrendingDown } from 'lucide-react';
import { RiskInsight } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface RiskRadarProps {
  risks: RiskInsight[];
  onSelectRisk: (risk: RiskInsight) => void;
  selectedRiskId?: string;
}

export const RiskRadar: React.FC<RiskRadarProps> = ({ risks, onSelectRisk, selectedRiskId }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Risk Radar</h3>
        <span className="px-2 py-0.5 bg-zinc-100 text-[10px] font-bold rounded uppercase">{risks.length} Detected</span>
      </div>

      {risks.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-zinc-200 rounded-xl">
          <p className="text-sm text-zinc-400">No risks detected. Upload data to begin.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {risks.map((risk) => {
            const isMitigated = risk.mitigatedLikelihood !== undefined;
            const displayLikelihood = isMitigated ? risk.mitigatedLikelihood! : risk.likelihood;

            return (
              <motion.div
                key={risk.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectRisk(risk)}
                className={cn(
                  "group p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                  selectedRiskId === risk.id
                    ? "bg-worley-navy border-worley-navy text-white shadow-lg"
                    : "bg-white border-zinc-200 hover:border-zinc-400 text-worley-navy"
                )}
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex gap-3">
                    <div className={cn(
                      "mt-1 p-2 rounded-lg",
                      selectedRiskId === risk.id ? "bg-white/10" : "bg-zinc-100"
                    )}>
                      {displayLikelihood > 70 ? (
                        <ShieldAlert className={cn("w-4 h-4", selectedRiskId === risk.id ? "text-red-400" : "text-red-600")} />
                      ) : displayLikelihood > 40 ? (
                        <AlertTriangle className={cn("w-4 h-4", selectedRiskId === risk.id ? "text-amber-400" : "text-amber-600")} />
                      ) : (
                        <TrendingDown className={cn("w-4 h-4", selectedRiskId === risk.id ? "text-green-400" : "text-green-600")} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold leading-tight">{risk.title}</h4>
                        {isMitigated && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold uppercase rounded">
                            Mitigated
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs mt-1 line-clamp-1",
                        selectedRiskId === risk.id ? "text-zinc-400" : "text-zinc-500"
                      )}>
                        {risk.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform",
                    selectedRiskId === risk.id ? "translate-x-1" : "group-hover:translate-x-1 text-zinc-300"
                  )} />
                </div>

                <div className="mt-4 flex items-center gap-4 relative z-10">
                  <div className="flex flex-col">
                    <span className={cn("text-[10px] uppercase font-bold tracking-tighter", selectedRiskId === risk.id ? "text-zinc-500" : "text-zinc-400")}>Likelihood</span>
                    <div className="flex items-center gap-1">
                      {isMitigated && (
                        <span className="text-xs font-mono line-through opacity-40">{risk.likelihood}%</span>
                      )}
                      <span className={cn("text-xs font-mono", isMitigated && "text-green-500 font-bold")}>{displayLikelihood}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("text-[10px] uppercase font-bold tracking-tighter", selectedRiskId === risk.id ? "text-zinc-500" : "text-zinc-400")}>Impact</span>
                    <span className="text-xs font-mono">{risk.impact}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("text-[10px] uppercase font-bold tracking-tighter", selectedRiskId === risk.id ? "text-zinc-500" : "text-zinc-400")}>Confidence</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono">{risk.confidence}%</span>
                      <Info className="w-3 h-3 opacity-50" />
                    </div>
                  </div>
                  {risk.carbonImpact && (
                    <div className="flex flex-col ml-auto">
                      <span className={cn("text-[10px] uppercase font-bold tracking-tighter", selectedRiskId === risk.id ? "text-zinc-500" : "text-zinc-400")}>Net-Zero</span>
                      <div className="flex items-center gap-1">
                        <Leaf className={cn("w-3 h-3", selectedRiskId === risk.id ? "text-green-400" : "text-green-600")} />
                        <span className="text-[10px] font-mono">{risk.carbonImpact}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress bar background */}
                <div className={cn(
                  "absolute bottom-0 left-0 h-1 transition-all duration-1000",
                  displayLikelihood > 70 ? "bg-red-500" : displayLikelihood > 40 ? "bg-amber-500" : "bg-green-500"
                )} style={{ width: `${displayLikelihood}%` }} />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
