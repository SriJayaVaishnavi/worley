export interface ProjectTask {
  task_id: string;
  task_name: string;
  is_critical: boolean;
  spi: number;
  vendor: string;
  vendor_delay_days: number;
  cost_variance_pct: number;
}

export interface Delta {
  id: string;
  task_id: string;
  task_name: string;
  type: 'Schedule' | 'Procurement' | 'Cost' | 'Inconsistency';
  issue: string;
  evidence: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface StructuredExplanation {
  signal: string;
  impact: string;
  rootCause: string;
  action: string;
}

export interface RiskInsight {
  id: string;
  title: string;
  description: string;
  likelihood: number; // 0-100
  mitigatedLikelihood?: number; // post-mitigation likelihood
  appliedMitigation?: string; // which strategy was applied
  impact: string;
  timeToImpact: string;
  confidence: number; // 0-100
  evidence: string[];
  explanation: string;
  structuredExplanation?: StructuredExplanation;
  carbonImpact?: string;
}

export interface Benchmark {
  id: string;
  project_type: string;
  scenario: string;
  outcome: string;
  mitigation: string;
  similarity: number;
  likelihoodReduction: number; // how much this strategy reduces likelihood
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
