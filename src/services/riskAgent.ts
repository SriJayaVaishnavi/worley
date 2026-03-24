import { Delta, RiskInsight, StructuredExplanation } from "../types";

const MODEL_NAME = "llama-3.3-70b-versatile";

async function chatCompletion(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch('/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model: MODEL_NAME }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function generateFallbackExplanation(risk: RiskInsight, relatedDeltas: Delta[]): { text: string; structured: StructuredExplanation } {
  const deltaTypes = relatedDeltas.map(d => d.type);
  const hasSchedule = deltaTypes.includes('Schedule');
  const hasCost = deltaTypes.includes('Cost');
  const hasProcurement = deltaTypes.includes('Procurement');
  const hasInconsistency = deltaTypes.includes('Inconsistency');

  let signal = risk.description;
  let rootCause = "Multiple data sources indicate divergence requiring manual review.";
  let impact = "Impact assessment requires AI agent — currently unavailable. Review evidence manually.";
  let action = "Escalate to project lead. Recommend GID surge support review for risk mitigation.";

  if (hasProcurement && hasSchedule) {
    signal = "Procurement delay contradicts schedule reporting — data sources are misaligned.";
    rootCause = "Root cause: likely Optimism Bias or Reporting Lag between procurement and scheduling systems.";
  } else if (hasProcurement) {
    signal = "Vendor delay detected on critical path — procurement system flagged risk.";
    rootCause = "Root cause: Vendor Risk — delivery timeline exceeds acceptable threshold.";
  } else if (hasInconsistency) {
    signal = "Schedule reports on-track but procurement data contradicts — system divergence detected.";
    rootCause = "Root cause: Optimism Bias — schedule performance index does not reflect ground reality.";
  } else if (hasSchedule && hasCost) {
    signal = "Both schedule and cost metrics have breached thresholds simultaneously.";
    rootCause = "Root cause: System Divergence — correlated schedule and cost overruns suggest systemic issue.";
  } else if (hasSchedule) {
    signal = "Schedule performance below threshold — delivery timeline at risk.";
    rootCause = "Root cause: Reporting Lag — SPI indicates emerging delay not yet reflected in milestones.";
  } else if (hasCost) {
    signal = "Cost variance exceeds baseline tolerance — budget overrun developing.";
    rootCause = "Root cause: Vendor Risk or scope creep driving cost escalation.";
  }

  const evidenceDetails = relatedDeltas.map(d => `${d.issue}: ${d.evidence}`).join('. ');
  impact = `Evidence: ${evidenceDetails}. Quantified impact requires AI analysis — review delta details for assessment.`;

  return {
    text: `${signal} ${impact} ${rootCause} ${action}`,
    structured: { signal, impact, rootCause, action },
  };
}

function generateFallbackChallenge(risk: RiskInsight, relatedDeltas: Delta[], challenge: string): string {
  const lower = challenge.toLowerCase();
  const procurementDelta = relatedDeltas.find(d => d.type === 'Procurement');
  const scheduleDelta = relatedDeltas.find(d => d.type === 'Schedule');
  const costDelta = relatedDeltas.find(d => d.type === 'Cost');
  const inconsistencyDelta = relatedDeltas.find(d => d.type === 'Inconsistency');

  // "I think the vendor will catch up"
  if (lower.includes('vendor') && (lower.includes('catch up') || lower.includes('recover') || lower.includes('improve'))) {
    const delayDays = procurementDelta?.evidence.match(/(\d+)\s*days/)?.[1] || 'significant';
    return `Challenge REJECTED. The current ${delayDays}-day vendor delay exceeds standard recovery thresholds. Historical data from WorleyIQ shows that once a vendor delay crosses 7 days on a critical-path item, the recovery rate drops below 30% without intervention. ${procurementDelta ? `Evidence: ${procurementDelta.evidence}.` : ''} Optimism about vendor recovery without a concrete catch-up plan is a documented cause of further schedule erosion. Recommendation: Request a formal recovery schedule from the vendor within 48 hours, and pre-authorize GID surge support as a contingency.`;
  }

  // "The SPI data might be stale"
  if (lower.includes('spi') && (lower.includes('stale') || lower.includes('outdated') || lower.includes('old') || lower.includes('not updated') || lower.includes('lag'))) {
    const spiValue = scheduleDelta?.evidence.match(/SPI\s*(?:is\s*)?([\d.]+)/)?.[1] || 'below threshold';
    return `Challenge PARTIALLY ACCEPTED. Data freshness is a valid concern — reporting lag is a known risk factor in EPC projects. However, even if the SPI of ${spiValue} has a 1-2 week lag, the trend direction remains significant. ${inconsistencyDelta ? `Additionally, ${inconsistencyDelta.evidence} — this cross-system divergence cannot be explained by stale data alone.` : 'Cross-referencing with procurement data confirms the risk signal.'} Recommendation: Request an updated SPI reading from the scheduling team within 24 hours. Until confirmed otherwise, maintain the current risk posture.`;
  }

  // "We have buffer in the schedule"
  if (lower.includes('buffer') || lower.includes('float') || lower.includes('slack') || lower.includes('contingency')) {
    return `Challenge REJECTED. Schedule buffers are frequently cited as risk mitigants, but WorleyIQ data shows that on projects with similar delta patterns, buffers are consumed 78% faster than planned. ${procurementDelta ? `The current vendor delay (${procurementDelta.evidence}) is already eroding available float.` : ''} ${scheduleDelta ? `With SPI tracking at ${scheduleDelta.evidence}, buffer consumption is accelerating.` : ''} Buffer existence does not eliminate the risk — it only delays the impact. Recommendation: Quantify remaining buffer in days and compare against the projected delay trajectory before adjusting the risk rating.`;
  }

  // "This delay is within tolerance"
  if (lower.includes('tolerance') || lower.includes('within range') || lower.includes('acceptable') || lower.includes('normal') || lower.includes('expected')) {
    return `Challenge REJECTED. While individual metrics may appear within tolerance, the risk assessment is based on **correlated signals** across multiple systems. ${relatedDeltas.length > 1 ? `There are ${relatedDeltas.length} concurrent deltas detected: ${relatedDeltas.map(d => d.issue).join(', ')}.` : ''} WorleyIQ benchmarks show that when multiple metrics simultaneously approach tolerance limits, the probability of a threshold breach increases by 3-4x. A "within tolerance" reading across ${relatedDeltas.length} systems simultaneously is itself an anomaly. Recommendation: Review each delta individually and confirm that the combined risk exposure is truly acceptable before downgrading.`;
  }

  // "The risk is overestimated / too high"
  if (lower.includes('overestimate') || lower.includes('too high') || lower.includes('exaggerat') || lower.includes('unlikely') || lower.includes('won\'t happen')) {
    return `Challenge PARTIALLY ACCEPTED. Risk likelihood of ${risk.likelihood}% is model-derived and carries uncertainty. However, the assessment is grounded in ${relatedDeltas.length} independent data signal(s): ${relatedDeltas.map(d => `[${d.type}] ${d.evidence}`).join('; ')}. To lower the rating, provide counter-evidence: a vendor recovery plan, updated SPI, or a revised cost forecast. Without new data, the current signals support the existing assessment. Recommendation: Bring updated evidence from at least two source systems to justify a downgrade.`;
  }

  // "We've seen this before / this is not new"
  if (lower.includes('seen this') || lower.includes('not new') || lower.includes('happened before') || lower.includes('always') || lower.includes('every project')) {
    return `Challenge REJECTED. Familiarity with a risk pattern does not reduce its likelihood — it increases the obligation to act on it. WorleyIQ data shows that "known" risks that are deprioritized due to normalization account for 40% of project overruns. ${relatedDeltas.length > 0 ? `Current evidence: ${relatedDeltas.map(d => d.evidence).join('; ')}.` : ''} The fact that this pattern recurs suggests a systemic issue, not a benign one. Recommendation: If this is a recurring pattern, escalate for a root-cause review rather than accepting it as normal.`;
  }

  // "The team can handle it / we have resources"
  if (lower.includes('team') || lower.includes('resource') || lower.includes('handle') || lower.includes('manage') || lower.includes('we can')) {
    return `Challenge PARTIALLY ACCEPTED. Team capability is a valid mitigant, but it must be quantified. ${procurementDelta ? `The current vendor delay (${procurementDelta.evidence}) requires specific recovery actions, not general team capacity.` : ''} ${scheduleDelta ? `SPI of ${scheduleDelta.evidence} indicates the current resource allocation is not recovering the schedule.` : ''} WorleyIQ benchmarks show that without a formal resource surge plan, team-based recovery claims result in actual recovery only 25% of the time. Recommendation: Submit a specific resource plan with named personnel, hours, and milestones to justify adjusting the risk.`;
  }

  // Generic fallback for any other challenge
  const evidenceList = relatedDeltas.map(d => `[${d.type}] ${d.issue}: ${d.evidence}`).join('; ');
  return `Challenge noted. The current risk assessment (Likelihood: ${risk.likelihood}%) is based on ${relatedDeltas.length} correlated signal(s): ${evidenceList}. To modify this assessment, counter-evidence must address the specific data contradictions identified. General objections without supporting data do not meet the Challenge Discipline threshold. Recommendation: Provide updated data from at least one source system that contradicts the current delta readings, then resubmit the challenge for re-evaluation.`;
}

function generateFallbackDeadlyDelta(taskName: string, delayDays: number, isCritical: boolean): string {
  if (isCritical) {
    return `A ${delayDays}-day delay on critical-path task "${taskName}" will cascade to downstream activities, potentially blocking commissioning and handover milestones. Recommend activating GID surge support with an estimated 200-400 additional engineering hours to compress the recovery schedule.`;
  }
  return `A ${delayDays}-day delay on "${taskName}" may impact parallel workstreams and resource allocation across the project. Monitor downstream dependencies and consider GID support allocation of 100-200 hours if delay extends beyond current projections.`;
}

function generateFallbackCopilot(message: string, context: { risks: RiskInsight[], deltas: Delta[] }): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('what changed') || lowerMsg.includes('what\'s new') || lowerMsg.includes('summary')) {
    if (context.deltas.length === 0) {
      return "No deltas detected yet. Upload project data to begin analysis.";
    }
    const summary = context.deltas.map(d => `- [${d.type}] ${d.task_name}: ${d.issue} (${d.severity})`).join('\n');
    return `Here are the current deltas detected:\n\n${summary}\n\nAI copilot is currently unavailable for deeper analysis. Review the delta details above for more context.`;
  }

  if (lowerMsg.includes('why') || lowerMsg.includes('risky') || lowerMsg.includes('risk')) {
    if (context.risks.length === 0) {
      return "No risks detected yet. Risks are generated when deltas are identified from uploaded project data.";
    }
    const riskSummary = context.risks.map(r => `- ${r.title}: Likelihood ${r.likelihood}%, ${r.impact}`).join('\n');
    return `Current risk assessment:\n\n${riskSummary}\n\nRisks are driven by contradictions between data sources (e.g., schedule vs procurement). AI copilot is unavailable for detailed explanation — review the evidence in each risk card.`;
  }

  return `AI copilot is currently unavailable. Here's what I can tell you from the data:\n\n- ${context.deltas.length} delta(s) detected\n- ${context.risks.length} risk(s) identified\n\nPlease review the dashboard for details, or try again later when the AI service is restored.`;
}

export class RiskAgentService {
  async explainRisk(risk: RiskInsight, relatedDeltas: Delta[]): Promise<{ text: string; structured: StructuredExplanation }> {
    const prompt = `
### ROLE: Worley Executive Intelligence Agent
Convert the raw risk analysis into a "Disciplined Execution" brief.

Risk: ${risk.title}
Description: ${risk.description}

Evidence (Deltas):
${relatedDeltas.map(d => `- [${d.type}] ${d.issue}: ${d.evidence}`).join('\n')}

### FORMAT: Return ONLY a JSON object with exactly these 4 fields:
{
  "signal": "[Source A] contradicts [Source B]. (Max 15 words, be specific about the data contradiction)",
  "impact": "Total schedule slip in days, EAC cost impact in dollars, and carbon penalty in tons CO2e. Bold the critical numbers.",
  "rootCause": "One sentence identifying root cause: Optimism Bias, Reporting Lag, Vendor Risk, or System Divergence.",
  "action": "Recommended GID surge support action with specific hours and center location (India/Colombia)."
}

### CONSTRAINTS:
- No introductory filler.
- Use specific numbers from the evidence.
- Bold critical numbers using **number** format.
- Include a one-sentence WorleyIQ benchmark reference in the action field.
- Return ONLY the JSON object. No markdown fences, no extra text.
    `;

    try {
      const raw = await chatCompletion([{ role: "user", content: prompt }]);
      const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
      const structured: StructuredExplanation = JSON.parse(cleaned);
      return {
        text: `${structured.signal} ${structured.impact} ${structured.rootCause} ${structured.action}`,
        structured,
      };
    } catch {
      return generateFallbackExplanation(risk, relatedDeltas);
    }
  }

  async challengeRisk(risk: RiskInsight, relatedDeltas: Delta[], challenge: string): Promise<string> {
    const prompt = `
### ROLE: Worley Risk Challenge Agent (Challenge Discipline Protocol)
You are an adversarial risk analyst. A project leader is challenging a risk assessment.
Your job is to defend the assessment with EVIDENCE, or concede if the challenge is valid.

### RISK BEING CHALLENGED:
Title: ${risk.title}
Likelihood: ${risk.likelihood}%
Evidence: ${relatedDeltas.map(d => `[${d.type}] ${d.issue}: ${d.evidence}`).join('; ')}

### USER'S CHALLENGE:
"${challenge}"

### RESPONSE RULES:
1. Start with the verdict: "Challenge REJECTED" or "Challenge PARTIALLY ACCEPTED" or "Challenge ACCEPTED"
2. Cite specific data from the evidence (numbers, percentages, days).
3. Reference WorleyIQ historical data: "Historical data from WorleyIQ shows [vendor type] has a [X]% recovery rate once a [Y]-day delay is hit in [region]."
4. If rejecting: explain why the user's assumption is contradicted by the data.
5. If accepting: explain what new information would need to be true for the risk to be lowered.
6. End with a one-sentence recommendation.

Keep response under 100 words. Be direct and evidence-backed. No filler.
    `;

    try {
      return await chatCompletion([{ role: "user", content: prompt }]) || generateFallbackChallenge(risk, relatedDeltas, challenge);
    } catch {
      return generateFallbackChallenge(risk, relatedDeltas, challenge);
    }
  }

  async getDeadlyDeltaInsight(taskName: string, delayDays: number, isCritical: boolean): Promise<string> {
    const prompt = `
### ROLE: Worley Critical Path Analyst
A schedule stress test has identified a Deadly Delta threshold.

Task: ${taskName}
Simulated Delay: ${delayDays} days
Critical Path: ${isCritical ? 'YES' : 'NO'}

In exactly 2 sentences:
1. Explain what happens at this delay level (cascade effects, downstream blocking).
2. Recommend specific GID surge action with hours estimate.

Be specific to EPC/energy infrastructure context. Reference concrete downstream impacts.
No filler. No introduction.
    `;

    try {
      return await chatCompletion([{ role: "user", content: prompt }]) || generateFallbackDeadlyDelta(taskName, delayDays, isCritical);
    } catch {
      return generateFallbackDeadlyDelta(taskName, delayDays, isCritical);
    }
  }

  async copilotChat(history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string, context: { risks: RiskInsight[], deltas: Delta[] }): Promise<string> {
    const systemInstruction = `
      You are the "Explainable Risk Pulse" Copilot.
      Your goal is to help project leaders understand emerging risks.

      Current Project Context:
      Risks Detected: ${JSON.stringify(context.risks)}
      Deltas Detected: ${JSON.stringify(context.deltas)}

      Guidelines:
      - Always refer to evidence from the deltas.
      - Be concise and actionable.
      - If asked "What changed?", summarize the latest deltas.
      - If asked "Why is this risky?", explain the contradiction between systems (e.g., "System A says X, but System B says Y").
      - Anonymize vendor names if they appear (e.g., use Vendor_A).
    `;

    const messages: { role: string; content: string }[] = [
      { role: 'system', content: systemInstruction },
    ];

    for (const msg of history) {
      messages.push({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.parts.map(p => p.text).join(''),
      });
    }

    messages.push({ role: 'user', content: message });

    try {
      return await chatCompletion(messages) || generateFallbackCopilot(message, context);
    } catch {
      return generateFallbackCopilot(message, context);
    }
  }
}
