import React, { useState, useCallback, useEffect } from 'react';
import { SlidersHorizontal, DollarSign, Globe, Flame, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface StressSimulatorProps {
  baseDelay: number;
  taskName: string;
  isCritical: boolean;
  onDeadlyDelta?: (message: string) => void;
}

const COST_PER_DAY = 150000; // $150k/day for EPC projects
const CO2_PER_DAY = 28.5; // tons CO2e per day (diesel generators, idle equipment)
const GID_HOURS_PER_DAY = 320; // GID hours needed per day of delay recovery

function getLikelihood(days: number): number {
  if (days <= 3) return 15;
  if (days <= 7) return 30;
  if (days <= 14) return 55;
  if (days <= 21) return 72;
  if (days <= 30) return 85;
  if (days <= 45) return 93;
  return 97;
}

function getColor(likelihood: number): string {
  if (likelihood <= 30) return 'green';
  if (likelihood <= 60) return 'amber';
  return 'red';
}

function getDeadlyDeltaThreshold(isCritical: boolean): number {
  return isCritical ? 22 : 35;
}

export const StressSimulator: React.FC<StressSimulatorProps> = ({ baseDelay, taskName, isCritical, onDeadlyDelta }) => {
  const [simDays, setSimDays] = useState(baseDelay);
  const [deadlyTriggered, setDeadlyTriggered] = useState(false);

  const likelihood = getLikelihood(simDays);
  const color = getColor(likelihood);
  const financialImpact = simDays * COST_PER_DAY;
  const co2Impact = simDays * CO2_PER_DAY;
  const gidHours = Math.ceil(simDays * GID_HOURS_PER_DAY * (isCritical ? 1.5 : 1));
  const deadlyThreshold = getDeadlyDeltaThreshold(isCritical);

  useEffect(() => {
    if (simDays >= deadlyThreshold && !deadlyTriggered) {
      setDeadlyTriggered(true);
      onDeadlyDelta?.(
        `At ${simDays} days of delay, "${taskName}" hits a Deadly Delta — ${isCritical ? 'foundation work blocks the critical path for the entire Q3 turbine install' : 'downstream dependencies cascade into schedule compression'}. Immediate GID surge of ${gidHours.toLocaleString()} hours recommended.`
      );
    }
    if (simDays < deadlyThreshold) {
      setDeadlyTriggered(false);
    }
  }, [simDays, deadlyThreshold, deadlyTriggered, taskName, isCritical, gidHours, onDeadlyDelta]);

  const colorMap = {
    green: { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-200', label: 'LOW RISK' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50', border: 'border-amber-200', label: 'MEDIUM RISK' },
    red: { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200', label: 'CRITICAL RISK' },
  };

  const c = colorMap[color];

  return (
    <div className="p-6 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-worley-navy rounded-lg flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Schedule Stress-Tester</h4>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Dynamic Risk Sensitivity</span>
          </div>
        </div>
        <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase", c.light, c.text, c.border, "border")}>
          {c.label}
        </span>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Simulate Delay (Days)</span>
          <span className="text-lg font-mono font-bold">{simDays}d</span>
        </div>
        <input
          type="range"
          min={0}
          max={60}
          value={simDays}
          onChange={(e) => setSimDays(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-worley-primary"
          style={{
            background: `linear-gradient(to right, #22c55e 0%, #22c55e 12%, #eab308 25%, #eab308 42%, #ef4444 60%, #ef4444 100%)`,
          }}
        />
        <div className="flex justify-between text-[9px] font-mono text-zinc-400">
          <span>0d</span>
          <span>15d</span>
          <span>30d</span>
          <span>45d</span>
          <span>60d</span>
        </div>
      </div>

      {/* Likelihood Bar */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Failure Likelihood</span>
        <div className="h-4 bg-zinc-100 rounded-full overflow-hidden relative">
          <motion.div
            className={cn("h-full rounded-full", c.bg)}
            animate={{ width: `${likelihood}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">
            {likelihood}%
          </span>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className={cn("p-3 rounded-lg border", c.light, c.border)}>
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className={cn("w-3 h-3", c.text)} />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Financial Risk</span>
          </div>
          <span className={cn("text-lg font-bold font-mono", c.text)}>
            ${(financialImpact / 1000000).toFixed(1)}M
          </span>
          <p className="text-[9px] text-zinc-400 mt-0.5">Liquidated damages</p>
        </div>

        <div className={cn("p-3 rounded-lg border", c.light, c.border)}>
          <div className="flex items-center gap-1 mb-1">
            <Flame className={cn("w-3 h-3", c.text)} />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Carbon Penalty</span>
          </div>
          <span className={cn("text-lg font-bold font-mono", c.text)}>
            {Math.round(co2Impact)}t
          </span>
          <p className="text-[9px] text-zinc-400 mt-0.5">CO2e (diesel + idle)</p>
        </div>

        <div className="p-3 rounded-lg border bg-zinc-50 border-zinc-200">
          <div className="flex items-center gap-1 mb-1">
            <Globe className="w-3 h-3 text-zinc-600" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">GID Surge</span>
          </div>
          <span className="text-lg font-bold font-mono text-worley-navy">
            {gidHours.toLocaleString()}
          </span>
          <p className="text-[9px] text-zinc-400 mt-0.5">Hours (India/Colombia)</p>
        </div>
      </div>

      {/* Deadly Delta Warning */}
      <AnimatePresence>
        {simDays >= deadlyThreshold && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl flex gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">Deadly Delta Threshold Crossed</span>
                <p className="text-xs text-red-800 mt-1 leading-relaxed">
                  At <strong>{deadlyThreshold}+ days</strong>, this delay cascades into a non-recoverable critical path failure.
                  Estimated <strong>${(simDays * COST_PER_DAY / 1000000).toFixed(1)}M</strong> in damages and <strong>{Math.round(co2Impact)} tons CO2e</strong> additional emissions.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
