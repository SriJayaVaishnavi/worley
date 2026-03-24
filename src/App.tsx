import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  MessageSquare, 
  Database, 
  Activity,
  ChevronRight,
  Info,
  ExternalLink,
  Menu,
  X,
  Radar,
  Zap,
  Leaf,
  Globe,
  ArrowDown,
  AlertTriangle,
  Target,
  Search,
  Lightbulb,
  SlidersHorizontal,
  Box,
  Swords,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUpload } from './components/FileUpload';
import { RiskRadar } from './components/RiskRadar';
import { DeltaTable } from './components/DeltaTable';
import { Copilot } from './components/Copilot';
import { BenchmarkCard } from './components/BenchmarkCard';
import { StressSimulator } from './components/StressSimulator';
import { DigitalTwin } from './components/DigitalTwin';
import { CarbonPenalty } from './components/CarbonPenalty';
import { ChallengeMode } from './components/ChallengeMode';
import { ProjectTask, Delta, RiskInsight, Benchmark, ChatMessage, StructuredExplanation } from './types';
import { RiskAgentService } from './services/riskAgent';
import { cn, renderBold } from './lib/utils';

// Benchmarks aligned with Energy, Chemicals & Resources sectors
const MOCK_BENCHMARKS: Benchmark[] = [
  {
    id: 'b1',
    project_type: 'Energy Infrastructure — LNG Terminal',
    scenario: 'Turbine delivery delayed by 14 days during critical path installation phase.',
    outcome: 'Project completion delayed by 3 weeks; $2M liquidated damages triggered.',
    mitigation: 'Pre-authorize air freight for critical components; implement 24/7 double-shift for installation.',
    similarity: 92,
    likelihoodReduction: 55
  },
  {
    id: 'b2',
    project_type: 'Chemicals — Hydrogen Plant',
    scenario: 'Electrolyzer vendor reported 12% cost variance due to rare-earth material shortages.',
    outcome: 'Budget overrun of 4%; procurement cycle extended by 30 days; green hydrogen commissioning delayed.',
    mitigation: 'Diversify vendor base; establish fixed-price contracts with early payment incentives; activate GID procurement support.',
    similarity: 78,
    likelihoodReduction: 40
  }
];

export default function App() {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<RiskInsight | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'risks' | 'data'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'brief' | 'simulate' | 'twin' | 'challenge'>('brief');

  const riskAgent = useMemo(() => {
    const apiKey = process.env.GROQ_API_KEY;
    console.log('[DEBUG] GROQ_API_KEY present:', !!apiKey, 'value prefix:', apiKey?.slice(0, 8));
    return apiKey ? new RiskAgentService(apiKey) : null;
  }, []);

  // Core Logic: Delta Detection
  const deltas = useMemo(() => {
    const detected: Delta[] = [];
    tasks.forEach(task => {
      // Rule 1: Vendor delay on critical task
      if (task.is_critical && task.vendor_delay_days > 7) {
        detected.push({
          id: `d-${task.task_id}-proc`,
          task_id: task.task_id,
          task_name: task.task_name,
          type: 'Procurement',
          issue: 'Critical Path Vendor Delay',
          evidence: `${task.vendor_delay_days} days delay reported by ${task.vendor}`,
          severity: 'Critical'
        });
      }

      // Rule 2: Low SPI
      if (task.spi < 0.9) {
        detected.push({
          id: `d-${task.task_id}-sch`,
          task_id: task.task_id,
          task_name: task.task_name,
          type: 'Schedule',
          issue: 'Schedule Performance Lag',
          evidence: `SPI is ${task.spi} (Threshold: 0.9)`,
          severity: task.spi < 0.8 ? 'High' : 'Medium'
        });
      }

      // Rule 3: Cost Variance
      if (task.cost_variance_pct > 10) {
        detected.push({
          id: `d-${task.task_id}-cost`,
          task_id: task.task_id,
          task_name: task.task_name,
          type: 'Cost',
          issue: 'Budget Variance Alert',
          evidence: `${task.cost_variance_pct}% variance from baseline`,
          severity: task.cost_variance_pct > 20 ? 'High' : 'Medium'
        });
      }

      // Rule 4: System Inconsistency (e.g. SPI is good but vendor delay is high)
      if (task.spi >= 0.95 && task.vendor_delay_days > 5) {
        detected.push({
          id: `d-${task.task_id}-inc`,
          task_id: task.task_id,
          task_name: task.task_name,
          type: 'Inconsistency',
          issue: 'Optimism Bias Detected',
          evidence: `Schedule reports on-track (SPI ${task.spi}) but Procurement reports ${task.vendor_delay_days}d delay`,
          severity: 'High'
        });
      }
    });
    return detected;
  }, [tasks]);

  // Core Logic: Risk Generation
  const risks = useMemo(() => {
    const generated: RiskInsight[] = [];
    
    const taskGroups: Record<string, Delta[]> = deltas.reduce((acc: Record<string, Delta[]>, d: Delta) => {
      if (!acc[d.task_id]) acc[d.task_id] = [];
      acc[d.task_id].push(d);
      return acc;
    }, {});

    Object.entries(taskGroups).forEach(([taskId, taskDeltas]: [string, Delta[]]) => {
      const task = tasks.find(t => t.task_id === taskId);
      if (!task) return;

      const hasCritical = taskDeltas.some(d => d.severity === 'Critical');
      const hasHigh = taskDeltas.some(d => d.severity === 'High');

      const deltaCount = taskDeltas.length;
      const confidence = Math.min(45 + deltaCount * 12, 82); // Realistic: 57-82% range

      generated.push({
        id: `r-${taskId}`,
        title: `${task.task_name} Delivery Failure`,
        description: `Multiple system signals indicate a high probability of failure for ${task.task_name}.`,
        likelihood: hasCritical ? 85 : (hasHigh ? 65 : 40),
        impact: task.is_critical ? 'Critical (Project Delay)' : 'Moderate',
        timeToImpact: '2-4 Weeks',
        confidence,
        evidence: taskDeltas.map(d => d.issue),
        explanation: 'Analyzing signals...',
        carbonImpact: task.is_critical ? 'Delays commissioning' : undefined,
      });
    });

    return generated;
  }, [deltas, tasks]);

  const handleSendMessage = async (text: string) => {
    if (!riskAgent) return;

    const newUserMessage: ChatMessage = { role: 'user', text };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    try {
      const history = chatMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await riskAgent.copilotChat(history, text, { risks, deltas });
      setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: "I encountered an error analyzing the data." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectRisk = async (risk: RiskInsight) => {
    setSelectedRisk(risk);
    if (risk.explanation === 'Analyzing signals...' && riskAgent) {
      try {
        const relatedDeltas = deltas.filter(d => d.task_id === risk.id.replace('r-', ''));
        const result = await riskAgent.explainRisk(risk, relatedDeltas);
        setSelectedRisk({ ...risk, explanation: result.text, structuredExplanation: result.structured });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleApplyStrategy = (benchmark: Benchmark) => {
    if (!selectedRisk) return;
    const newLikelihood = Math.max(selectedRisk.likelihood - benchmark.likelihoodReduction, 10);
    setSelectedRisk({
      ...selectedRisk,
      mitigatedLikelihood: newLikelihood,
      appliedMitigation: benchmark.mitigation,
    });
  };

  const handleGIDSurge = () => {
    if (!selectedRisk) return;
    const newLikelihood = Math.max((selectedRisk.mitigatedLikelihood ?? selectedRisk.likelihood) - 15, 10);
    setSelectedRisk({
      ...selectedRisk,
      mitigatedLikelihood: newLikelihood,
      appliedMitigation: (selectedRisk.appliedMitigation ? selectedRisk.appliedMitigation + ' + ' : '') + 'GID Surge Support activated (20% hours shifted to India/Colombia centers)',
    });
  };

  const handleChallenge = async (challenge: string): Promise<string> => {
    if (!riskAgent || !selectedRisk) return "No risk selected.";
    const relatedDeltas = deltas.filter(d => d.task_id === selectedRisk.id.replace('r-', ''));
    return riskAgent.challengeRisk(selectedRisk, relatedDeltas, challenge);
  };

  const handleDeadlyDelta = useCallback(async (message: string) => {
    if (!riskAgent || !selectedRisk) return;
    // Send the deadly delta insight to the copilot chat
    const taskName = selectedRisk.title.replace(' Delivery Failure', '');
    const isCritical = selectedRisk.impact.includes('Critical');
    try {
      const aiInsight = await riskAgent.getDeadlyDeltaInsight(taskName, 22, isCritical);
      setChatMessages(prev => [...prev, {
        role: 'model',
        text: `**Deadly Delta Alert:** ${aiInsight}`
      }]);
      setIsCopilotOpen(true);
    } catch {
      setChatMessages(prev => [...prev, { role: 'model', text: `**Deadly Delta Alert:** ${message}` }]);
      setIsCopilotOpen(true);
    }
  }, [riskAgent, selectedRisk]);

  // Get the task data for the selected risk (for stress simulator)
  const selectedTask = useMemo(() => {
    if (!selectedRisk) return null;
    const taskId = selectedRisk.id.replace('r-', '');
    return tasks.find(t => t.task_id === taskId) || null;
  }, [selectedRisk, tasks]);

  return (
    <div className="flex h-screen bg-worley-bg font-sans text-worley-navy overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-worley-navy text-white flex flex-col border-r border-worley-navy-mid z-50"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-worley-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold text-sm">W</span>
              </div>
              <div>
                <span className="font-bold tracking-tight text-lg">Risk Pulse</span>
                <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-worley-primary">Worley Intelligence</div>
              </div>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-worley-navy-mid rounded">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6 mx-auto" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Risk Dashboard' },
            { id: 'risks', icon: Radar, label: 'Risk Radar' },
            { id: 'data', icon: Database, label: 'Data Management' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                activeTab === item.id ? "bg-worley-primary text-white shadow-lg" : "text-zinc-400 hover:text-white hover:bg-worley-navy-mid"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="text-sm font-bold">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-worley-navy-mid">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-worley-navy-mid flex items-center justify-center text-xs font-bold">JD</div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-xs font-bold">John Director</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Project Lead</span>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
              {activeTab === 'dashboard' ? 'Project Overview' : activeTab === 'risks' ? 'Risk Analysis' : 'Data Ingestion'}
            </h2>
            <ChevronRight className="w-4 h-4 text-zinc-300" />
            <span className="text-sm font-bold">Global Turbine Project</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold uppercase tracking-tighter">System Status: Healthy</span>
            </div>
            <button className="p-2 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors">
              <Info className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-12 gap-8"
              >
                <div className="col-span-12 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm border-l-4 border-l-worley-primary">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Critical Risks</span>
                      <div className="text-3xl font-bold mt-1 text-worley-primary">{risks.filter(r => r.likelihood > 70).length}</div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm border-l-4 border-l-worley-secondary">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">System Deltas</span>
                      <div className="text-3xl font-bold mt-1 text-worley-secondary">{deltas.length}</div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm border-l-4 border-l-worley-navy">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Avg Confidence</span>
                      <div className="text-3xl font-bold mt-1 text-worley-navy">{risks.length > 0 ? Math.round(risks.reduce((s, r) => s + r.confidence, 0) / risks.length) : 0}%</div>
                    </div>
                  </div>

                  <DeltaTable deltas={deltas} />
                </div>
              </motion.div>
            )}

            {activeTab === 'risks' && (
              <motion.div
                key="risks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <div className="grid grid-cols-12 gap-6 h-full">
                  {/* Left: Risk List (4 cols) */}
                  <div className="col-span-12 lg:col-span-4 overflow-y-auto pr-2">
                    <RiskRadar
                      risks={risks}
                      onSelectRisk={(risk) => { handleSelectRisk(risk); setDetailTab('brief'); }}
                      selectedRiskId={selectedRisk?.id}
                    />
                  </div>

                  {/* Right: Detail Panel (8 cols) */}
                  <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0">
                    <AnimatePresence mode="wait">
                      {selectedRisk ? (
                        <motion.div
                          key={selectedRisk.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex flex-col h-full min-h-0"
                        >
                          {/* Sticky Header */}
                          <div className="p-5 bg-white rounded-2xl border-2 border-worley-navy shadow-xl relative shrink-0">
                            <div className="absolute top-4 right-4">
                              <button onClick={() => setSelectedRisk(null)} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-worley-navy text-white rounded-xl flex items-center justify-center shrink-0">
                                <ShieldAlert className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-lg font-bold tracking-tight truncate">{selectedRisk.title}</h3>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 font-mono">Confidence: {selectedRisk.confidence}%</span>
                                  <span className="text-[9px] text-zinc-300">|</span>
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 font-mono">AI + Human Oversight</span>
                                  {selectedRisk.carbonImpact && (
                                    <>
                                      <span className="text-[9px] text-zinc-300">|</span>
                                      <span className="flex items-center gap-1">
                                        <Leaf className="w-3 h-3 text-green-600" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-green-700">{selectedRisk.carbonImpact}</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Mitigation banner (always visible when active) */}
                            {selectedRisk.mitigatedLikelihood !== undefined && (
                              <div className="mt-3 flex items-center gap-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                <Target className="w-4 h-4 text-green-700 shrink-0" />
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-red-500 line-through">{selectedRisk.likelihood}%</span>
                                  <ArrowDown className="w-3.5 h-3.5 text-green-600" />
                                  <span className="text-sm font-bold text-green-700">{selectedRisk.mitigatedLikelihood}%</span>
                                </div>
                                <span className="text-[10px] text-green-700 font-medium">
                                  {selectedRisk.likelihood - selectedRisk.mitigatedLikelihood}pt reduction via mitigation
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Sub-Tab Bar */}
                          <div className="flex items-center gap-1 mt-4 mb-3 shrink-0">
                            {[
                              { id: 'brief' as const, icon: FileText, label: 'Brief', dot: !!selectedRisk.structuredExplanation },
                              { id: 'simulate' as const, icon: SlidersHorizontal, label: 'Simulate', dot: !!selectedTask },
                              { id: 'twin' as const, icon: Box, label: 'Digital Twin', dot: false },
                              { id: 'challenge' as const, icon: Swords, label: 'Challenge', dot: false },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setDetailTab(tab.id)}
                                className={cn(
                                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all relative",
                                  detailTab === tab.id
                                    ? "bg-worley-navy text-white shadow-lg"
                                    : "bg-white text-zinc-500 hover:text-worley-navy hover:bg-zinc-100 border border-zinc-200"
                                )}
                              >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                                {tab.dot && detailTab !== tab.id && (
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full absolute top-2 right-2" />
                                )}
                              </button>
                            ))}
                          </div>

                          {/* Tab Content (scrollable) */}
                          <div className="flex-1 overflow-y-auto min-h-0 pb-4">
                            <AnimatePresence mode="wait">
                              {/* === BRIEF TAB === */}
                              {detailTab === 'brief' && (
                                <motion.div
                                  key="brief"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="space-y-5"
                                >
                                  {/* Signal-Impact-Action Cards */}
                                  {selectedRisk.structuredExplanation ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div className="p-4 bg-white rounded-xl border border-worley-primary shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-6 h-6 bg-worley-primary/10 rounded-lg flex items-center justify-center">
                                            <Zap className="w-3.5 h-3.5 text-worley-primary" />
                                          </div>
                                          <span className="text-[9px] font-bold uppercase tracking-widest text-worley-primary font-mono">Signal</span>
                                        </div>
                                        <p className="text-sm text-zinc-800 leading-relaxed">{renderBold(selectedRisk.structuredExplanation.signal)}</p>
                                      </div>
                                      <div className="p-4 bg-white rounded-xl border border-worley-secondary shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-6 h-6 bg-worley-secondary/10 rounded-lg flex items-center justify-center">
                                            <AlertTriangle className="w-3.5 h-3.5 text-worley-secondary" />
                                          </div>
                                          <span className="text-[9px] font-bold uppercase tracking-widest text-worley-secondary font-mono">Impact</span>
                                        </div>
                                        <p className="text-sm text-zinc-800 leading-relaxed">{renderBold(selectedRisk.structuredExplanation.impact)}</p>
                                      </div>
                                      <div className="p-4 bg-white rounded-xl border border-worley-navy-mid shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-6 h-6 bg-worley-navy-mid/10 rounded-lg flex items-center justify-center">
                                            <Search className="w-3.5 h-3.5 text-worley-navy-mid" />
                                          </div>
                                          <span className="text-[9px] font-bold uppercase tracking-widest text-worley-navy-mid font-mono">Root Cause</span>
                                        </div>
                                        <p className="text-sm text-zinc-800 leading-relaxed">{renderBold(selectedRisk.structuredExplanation.rootCause)}</p>
                                      </div>
                                      <div className="p-4 bg-white rounded-xl border border-worley-navy shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-6 h-6 bg-worley-navy/10 rounded-lg flex items-center justify-center">
                                            <Lightbulb className="w-3.5 h-3.5 text-worley-navy" />
                                          </div>
                                          <span className="text-[9px] font-bold uppercase tracking-widest text-worley-navy font-mono">Action</span>
                                        </div>
                                        <p className="text-sm text-zinc-800 leading-relaxed">{renderBold(selectedRisk.structuredExplanation.action)}</p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-5 bg-white rounded-xl border border-zinc-200 shadow-sm">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Generating Intelligence Report...</span>
                                      </div>
                                      <p className="text-sm text-zinc-500 italic">{renderBold(selectedRisk.explanation || '')}</p>
                                    </div>
                                  )}

                                  {/* Supporting Signals */}
                                  <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm">
                                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 font-mono mb-3">Supporting Signals</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedRisk.evidence.map((ev, i) => (
                                        <span key={i} className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-bold uppercase tracking-tighter border border-zinc-200">
                                          {ev}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Benchmarks */}
                                  <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm">
                                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 font-mono mb-3">Historical Benchmarks — Mitigation Simulator</h4>
                                    <div className="space-y-3">
                                      {MOCK_BENCHMARKS.map(b => (
                                        <BenchmarkCard
                                          key={b.id}
                                          benchmark={b}
                                          onApplyStrategy={handleApplyStrategy}
                                          isApplied={selectedRisk.appliedMitigation?.includes(b.mitigation.substring(0, 20))}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {/* === SIMULATE TAB === */}
                              {detailTab === 'simulate' && (
                                <motion.div
                                  key="simulate"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="space-y-5"
                                >
                                  {/* Stress Simulator */}
                                  {selectedTask && (
                                    <StressSimulator
                                      baseDelay={selectedTask.vendor_delay_days}
                                      taskName={selectedTask.task_name}
                                      isCritical={selectedTask.is_critical}
                                      onDeadlyDelta={handleDeadlyDelta}
                                    />
                                  )}

                                  {/* Carbon Penalty */}
                                  {selectedTask && (
                                    <CarbonPenalty
                                      delayDays={selectedTask.vendor_delay_days}
                                      taskName={selectedTask.task_name}
                                      isCritical={selectedTask.is_critical}
                                    />
                                  )}

                                  {/* GID Surge */}
                                  <button
                                    onClick={handleGIDSurge}
                                    className="w-full p-4 bg-worley-primary text-white rounded-xl flex items-center justify-center gap-3 hover:bg-worley-primary-hover transition-colors shadow-lg"
                                  >
                                    <Globe className="w-5 h-5" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Request GID Surge Support</span>
                                    <span className="text-[10px] text-zinc-400 ml-2">Shift 20% hours to India/Colombia</span>
                                  </button>
                                </motion.div>
                              )}

                              {/* === DIGITAL TWIN TAB === */}
                              {detailTab === 'twin' && (
                                <motion.div
                                  key="twin"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                >
                                  <DigitalTwin
                                    highlightedAsset={selectedRisk.id.replace('r-', '')}
                                    taskName={selectedRisk.title.replace(' Delivery Failure', '')}
                                  />
                                </motion.div>
                              )}

                              {/* === CHALLENGE TAB === */}
                              {detailTab === 'challenge' && (
                                <motion.div
                                  key="challenge"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                >
                                  <ChallengeMode
                                    onChallenge={handleChallenge}
                                    riskTitle={selectedRisk.title}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-full flex items-center justify-center p-12 border border-dashed border-zinc-200 rounded-2xl"
                        >
                          <div className="text-center">
                            <Radar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                            <p className="text-sm text-zinc-400 font-medium">Select a risk from the radar to view its detailed analysis</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'data' && (
              <motion.div 
                key="data"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto space-y-8"
              >
                <FileUpload onDataLoaded={setTasks} />
                
                <div className="p-8 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Data Schema Mapping</h3>
                  <div className="space-y-4">
                    {[
                      { field: 'task_id', type: 'String', desc: 'Unique identifier from P6/Schedule' },
                      { field: 'spi', type: 'Float', desc: 'Schedule Performance Index' },
                      { field: 'vendor_delay', type: 'Integer', desc: 'Days delayed in procurement log' },
                      { field: 'cost_variance', type: 'Percentage', desc: 'Deviation from budget' },
                    ].map(item => (
                      <div key={item.field} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold font-mono">{item.field}</span>
                          <span className="text-[10px] text-zinc-500">{item.desc}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{item.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Copilot */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isCopilotOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-[400px] h-[520px] shadow-2xl rounded-2xl overflow-hidden"
            >
              <Copilot
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className="w-14 h-14 bg-worley-navy text-white rounded-full shadow-xl flex items-center justify-center hover:bg-worley-navy-mid transition-colors"
        >
          {isCopilotOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
