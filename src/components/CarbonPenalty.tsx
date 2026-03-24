import React, { useState, useEffect } from 'react';
import { Flame, Clock, Leaf, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface CarbonPenaltyProps {
  delayDays: number;
  taskName: string;
  isCritical: boolean;
}

const CO2_DIESEL_PER_DAY = 18.2; // tons from diesel generators
const CO2_IDLE_PER_DAY = 10.3; // tons from idle equipment/labor transport
const CARBON_CREDIT_COST = 85; // $/ton CO2e (EU ETS ~€80)

export const CarbonPenalty: React.FC<CarbonPenaltyProps> = ({ delayDays, taskName, isCritical }) => {
  const [animatedTons, setAnimatedTons] = useState(0);

  const totalCO2 = delayDays * (CO2_DIESEL_PER_DAY + CO2_IDLE_PER_DAY);
  const dieselCO2 = delayDays * CO2_DIESEL_PER_DAY;
  const idleCO2 = delayDays * CO2_IDLE_PER_DAY;
  const carbonCost = totalCO2 * CARBON_CREDIT_COST;
  const treesEquivalent = Math.round(totalCO2 / 0.022); // avg tree absorbs 22kg CO2/year

  useEffect(() => {
    const target = totalCO2;
    const duration = 1000;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedTons(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [totalCO2]);

  const severity = totalCO2 > 500 ? 'critical' : totalCO2 > 200 ? 'high' : 'moderate';
  const severityColors = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-500' },
    high: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-500' },
    moderate: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-500' },
  };
  const c = severityColors[severity];

  return (
    <div className={cn("p-5 rounded-xl border shadow-sm", c.bg, c.border)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", c.badge)}>
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Decarbonization Impact</h4>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Net-Zero Penalty Clock</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className={cn("w-3.5 h-3.5", c.text)} />
          <span className={cn("text-xs font-mono font-bold", c.text)}>{delayDays}d delay</span>
        </div>
      </div>

      {/* Main counter */}
      <div className="text-center py-4">
        <motion.div
          className={cn("text-4xl font-bold font-mono", c.text)}
          key={totalCO2}
        >
          {animatedTons}
        </motion.div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tons CO2e Additional Emissions</span>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-white/60 rounded-lg border border-white">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Diesel Generators</span>
          <span className="text-sm font-bold font-mono">{Math.round(dieselCO2)}t CO2e</span>
          <div className="h-1.5 bg-zinc-200 rounded-full mt-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-zinc-700 rounded-full"
              animate={{ width: `${(dieselCO2 / totalCO2) * 100}%` }}
            />
          </div>
        </div>
        <div className="p-3 bg-white/60 rounded-lg border border-white">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Idle Equipment</span>
          <span className="text-sm font-bold font-mono">{Math.round(idleCO2)}t CO2e</span>
          <div className="h-1.5 bg-zinc-200 rounded-full mt-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-zinc-500 rounded-full"
              animate={{ width: `${(idleCO2 / totalCO2) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Impact metrics */}
      <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-white">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Carbon Credit Cost</span>
        </div>
        <span className="text-sm font-bold font-mono">${(carbonCost / 1000).toFixed(0)}K</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-white mt-2">
        <div className="flex items-center gap-2">
          <Leaf className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Equivalent Trees (1yr)</span>
        </div>
        <span className="text-sm font-bold font-mono">{treesEquivalent.toLocaleString()}</span>
      </div>

      <p className="text-[10px] text-center mt-3 font-medium" style={{ color: 'inherit' }}>
        {isCritical
          ? `Critical delay on "${taskName}" extends diesel generator runtime and defers green commissioning`
          : `Delay on "${taskName}" increases on-site diesel usage and idle equipment emissions`
        }
      </p>
    </div>
  );
};
