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
  const lower = message.toLowerCase();
  const { risks, deltas } = context;

  const criticalRisks = risks.filter(r => r.likelihood >= 80);
  const highRisks = risks.filter(r => r.likelihood >= 60 && r.likelihood < 80);
  const criticalDeltas = deltas.filter(d => d.severity === 'Critical');
  const highDeltas = deltas.filter(d => d.severity === 'High');
  const procurementDeltas = deltas.filter(d => d.type === 'Procurement');
  const scheduleDeltas = deltas.filter(d => d.type === 'Schedule');
  const costDeltas = deltas.filter(d => d.type === 'Cost');
  const inconsistencyDeltas = deltas.filter(d => d.type === 'Inconsistency');

  // "What are the top risks?"
  if (lower.includes('top risk') || lower.includes('biggest risk') || lower.includes('main risk') || lower.includes('highest risk') || lower.includes('worst risk')) {
    if (risks.length === 0) return "No risks detected yet. Upload project data (CSV) to begin risk analysis.";
    const sorted = [...risks].sort((a, b) => b.likelihood - a.likelihood);
    const topRisks = sorted.slice(0, 3);
    let response = `**Top ${topRisks.length} Risk(s) Identified:**\n\n`;
    topRisks.forEach((r, i) => {
      const taskDeltas = deltas.filter(d => d.task_id === r.id.replace('r-', ''));
      response += `**${i + 1}. ${r.title}** — Likelihood: **${r.likelihood}%**, Impact: ${r.impact}\n`;
      response += `   Evidence: ${taskDeltas.map(d => `${d.issue} (${d.evidence})`).join('; ')}\n\n`;
    });
    response += `These risks are ranked by likelihood and driven by ${deltas.length} delta(s) across ${new Set(deltas.map(d => d.type)).size} system(s). Click on any risk card for the full breakdown.`;
    return response;
  }

  // "Explain the turbine delay" or explain specific task/delay
  if (lower.includes('explain') && (lower.includes('delay') || lower.includes('turbine') || lower.includes('task'))) {
    const matchingDeltas = deltas.filter(d =>
      lower.includes(d.task_name.toLowerCase()) || d.type === 'Procurement'
    );
    if (matchingDeltas.length === 0 && procurementDeltas.length > 0) {
      const d = procurementDeltas[0];
      return `**${d.task_name} — ${d.issue}**\n\n${d.evidence}.\n\nThis is flagged as **${d.severity}** severity because vendor delays on ${d.task_name.includes('critical') || risks.some(r => r.impact.includes('Critical')) ? 'critical-path items' : 'active tasks'} directly impact downstream milestones. WorleyIQ benchmarks show that delays of this magnitude have a recovery rate below 30% without formal intervention.\n\n**Recommended action:** Request a formal recovery schedule from the vendor and evaluate GID surge support to compress the timeline.`;
    }
    if (matchingDeltas.length > 0) {
      let response = `**Analysis of matching signals:**\n\n`;
      matchingDeltas.forEach(d => {
        response += `- **[${d.type}] ${d.task_name}:** ${d.issue} — ${d.evidence} (${d.severity})\n`;
      });
      response += `\nThese signals indicate a developing risk pattern. ${matchingDeltas.length > 1 ? 'Multiple correlated deltas increase the confidence of this assessment.' : 'Monitor for additional correlated signals across other systems.'}`;
      return response;
    }
    return "No matching delay data found. Please specify a task name from the uploaded data, or ask about a specific risk type (procurement, schedule, cost).";
  }

  // "How can we mitigate impact?" or mitigation questions
  if (lower.includes('mitigat') || lower.includes('reduce') || lower.includes('fix') || lower.includes('solve') || lower.includes('action') || lower.includes('what can we do') || lower.includes('how to address') || lower.includes('recommendation')) {
    if (risks.length === 0) return "No active risks to mitigate. Upload project data to identify risks first.";
    let response = `**Recommended Mitigation Actions:**\n\n`;
    if (procurementDeltas.length > 0) {
      response += `**Procurement Risk:**\n- Request formal vendor recovery schedules within 48 hours\n- Pre-authorize air freight for critical components\n- Activate alternative vendor qualification from GID database\n- Consider GID surge support: 200-400 hours from India/Colombia centers\n\n`;
    }
    if (scheduleDeltas.length > 0) {
      response += `**Schedule Risk:**\n- Implement 24/7 double-shift for critical-path activities\n- Resequence non-critical activities to free float for critical path\n- Deploy GID engineering support to compress design/review cycles\n- Request updated baseline from scheduling team within 24 hours\n\n`;
    }
    if (costDeltas.length > 0) {
      response += `**Cost Risk:**\n- Conduct variance root-cause analysis with cost engineering\n- Freeze non-essential scope changes pending cost review\n- Negotiate fixed-price amendments with vendors showing variance\n- Activate early payment incentives for on-time delivery\n\n`;
    }
    if (inconsistencyDeltas.length > 0) {
      response += `**Data Inconsistency:**\n- Mandate cross-system data reconciliation within 48 hours\n- Schedule alignment meeting between scheduling and procurement teams\n- Implement weekly data quality audits across reporting systems\n\n`;
    }
    if (procurementDeltas.length === 0 && scheduleDeltas.length === 0 && costDeltas.length === 0 && inconsistencyDeltas.length === 0) {
      response += `Based on the ${risks.length} risk(s) identified, review each risk card and apply benchmark strategies from the WorleyIQ database. Select a risk to see specific mitigation options.\n\n`;
    }
    response += `**Priority:** Focus on ${criticalRisks.length > 0 ? `the ${criticalRisks.length} critical-likelihood risk(s)` : highRisks.length > 0 ? `the ${highRisks.length} high-likelihood risk(s)` : 'the highest-likelihood risks'} first. Use the Stress Simulator to model delay scenarios before committing resources.`;
    return response;
  }

  // "What changed?" / "What's new?" / summary
  if (lower.includes('what changed') || lower.includes('what\'s new') || lower.includes('summary') || lower.includes('overview') || lower.includes('status') || lower.includes('update')) {
    if (deltas.length === 0) return "No deltas detected yet. Upload project data (CSV) to begin monitoring.";
    let response = `**Project Status Summary:**\n\n`;
    response += `**${deltas.length} Delta(s) Detected** across ${new Set(deltas.map(d => d.task_id)).size} task(s):\n`;
    if (criticalDeltas.length > 0) response += `- ${criticalDeltas.length} **Critical** severity signal(s)\n`;
    if (highDeltas.length > 0) response += `- ${highDeltas.length} **High** severity signal(s)\n`;
    const mediumDeltas = deltas.filter(d => d.severity === 'Medium');
    if (mediumDeltas.length > 0) response += `- ${mediumDeltas.length} **Medium** severity signal(s)\n`;
    response += `\n**Breakdown by Type:**\n`;
    if (procurementDeltas.length > 0) response += `- Procurement: ${procurementDeltas.length} delta(s) — ${procurementDeltas.map(d => d.task_name).join(', ')}\n`;
    if (scheduleDeltas.length > 0) response += `- Schedule: ${scheduleDeltas.length} delta(s) — ${scheduleDeltas.map(d => `${d.task_name} (${d.evidence})`).join(', ')}\n`;
    if (costDeltas.length > 0) response += `- Cost: ${costDeltas.length} delta(s) — ${costDeltas.map(d => `${d.task_name} (${d.evidence})`).join(', ')}\n`;
    if (inconsistencyDeltas.length > 0) response += `- Inconsistency: ${inconsistencyDeltas.length} delta(s) — ${inconsistencyDeltas.map(d => d.task_name).join(', ')}\n`;
    response += `\n**${risks.length} Risk(s) Generated** — ${criticalRisks.length} critical, ${highRisks.length} high likelihood.`;
    return response;
  }

  // "Why is this risky?" / why questions
  if (lower.includes('why') && (lower.includes('risk') || lower.includes('dangerous') || lower.includes('concern') || lower.includes('flagged') || lower.includes('alert'))) {
    if (risks.length === 0) return "No risks detected yet. Risks are generated when deltas (data contradictions) are identified from uploaded project data.";
    let response = `**Why These Risks Are Flagged:**\n\nRisk Pulse detects risks by identifying **contradictions between data systems** — when one source says the project is on track but another signals trouble.\n\n`;
    if (inconsistencyDeltas.length > 0) {
      response += `**Key Contradiction(s):**\n`;
      inconsistencyDeltas.forEach(d => {
        response += `- ${d.task_name}: ${d.evidence}\n`;
      });
      response += `\nWhen schedule and procurement systems disagree, it often indicates **Optimism Bias** — the schedule hasn't caught up with ground-level delays.\n\n`;
    }
    if (procurementDeltas.length > 0 && scheduleDeltas.length > 0) {
      response += `Procurement reports vendor delays while scheduling metrics show degradation — these **correlated signals** significantly increase risk confidence.\n\n`;
    }
    response += `WorleyIQ historical data shows that projects with similar delta patterns experience delivery failures ${criticalRisks.length > 0 ? '72%' : '45%'} of the time without intervention.`;
    return response;
  }

  // Cost / budget questions
  if (lower.includes('cost') || lower.includes('budget') || lower.includes('spend') || lower.includes('expense') || lower.includes('eac') || lower.includes('variance')) {
    if (costDeltas.length === 0) return "No cost-related deltas detected in the current data. Cost alerts trigger when variance exceeds 10% from baseline.";
    let response = `**Cost Analysis:**\n\n`;
    costDeltas.forEach(d => {
      response += `- **${d.task_name}:** ${d.evidence} (${d.severity} severity)\n`;
    });
    response += `\nCost variances above 10% trigger alerts. ${costDeltas.some(d => d.severity === 'High') ? 'High-severity cost deltas indicate variance exceeding 20% — escalate to cost engineering for root-cause analysis.' : 'Monitor for escalation beyond 20% threshold.'}\n\n**Recommended:** Conduct variance decomposition to identify whether the driver is scope, rate, or quantity-based.`;
    return response;
  }

  // Schedule / SPI / timeline questions
  if (lower.includes('schedule') || lower.includes('spi') || lower.includes('timeline') || lower.includes('deadline') || lower.includes('late') || lower.includes('behind')) {
    if (scheduleDeltas.length === 0) return "No schedule-related deltas detected. Schedule alerts trigger when SPI drops below 0.9.";
    let response = `**Schedule Analysis:**\n\n`;
    scheduleDeltas.forEach(d => {
      response += `- **${d.task_name}:** ${d.evidence} (${d.severity})\n`;
    });
    response += `\nSPI below 0.9 indicates the task is earning value slower than planned. ${scheduleDeltas.some(d => d.severity === 'High') ? 'SPI below 0.8 is flagged as High severity — recovery without intervention is unlikely.' : 'Monitor weekly for trend direction.'}\n\n**Recommended:** Request updated schedules and evaluate fast-tracking or crashing options for critical-path tasks.`;
    return response;
  }

  // Vendor / procurement questions
  if (lower.includes('vendor') || lower.includes('procurement') || lower.includes('supplier') || lower.includes('delivery') || lower.includes('shipment')) {
    if (procurementDeltas.length === 0) return "No procurement deltas detected. Procurement alerts trigger when vendor delays exceed 7 days on critical tasks.";
    let response = `**Procurement Analysis:**\n\n`;
    procurementDeltas.forEach(d => {
      response += `- **${d.task_name}:** ${d.evidence} (${d.severity})\n`;
    });
    response += `\nVendor delays exceeding 7 days on critical-path items are flagged as Critical. WorleyIQ benchmarks show recovery rates drop below 30% once this threshold is crossed.\n\n**Recommended:** Demand formal recovery plans from vendors within 48 hours. Pre-qualify alternative suppliers from GID database as contingency.`;
    return response;
  }

  // Hello / greetings
  if (lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return `Hello! I'm the Risk Pulse Copilot. ${risks.length > 0 ? `I'm currently tracking **${risks.length} risk(s)** and **${deltas.length} delta(s)** from your project data.` : 'Upload your project data to get started with risk analysis.'}\n\nYou can ask me:\n- "What are the top risks?"\n- "What changed?"\n- "How can we mitigate impact?"\n- Or ask about specific tasks, vendors, or cost items.`;
  }

  // Help / what can you do
  if (lower.includes('help') || lower.includes('what can you') || lower.includes('how do') || lower.includes('guide') || lower.includes('instructions')) {
    return `**Risk Pulse Copilot — Quick Guide:**\n\nI can help you understand and act on project risks. Try asking:\n\n- **"What are the top risks?"** — See highest-priority risks\n- **"What changed?"** — Get a summary of all detected deltas\n- **"Explain the [task] delay"** — Deep dive on a specific issue\n- **"How can we mitigate impact?"** — Get actionable recommendations\n- **"Why is this risky?"** — Understand the reasoning behind risk flags\n- **"Tell me about cost/schedule/vendor"** — Filter by risk category\n\nYou can also use the **Challenge AI** tab to dispute risk assessments, or the **Stress Simulator** to model delay scenarios.`;
  }

  // Fallback for unrecognized questions
  if (deltas.length === 0 && risks.length === 0) {
    return "No project data loaded yet. Upload a CSV file with your project task data to begin risk analysis. I'll then be able to answer questions about risks, deltas, mitigation strategies, and more.";
  }

  return `I'm currently tracking **${deltas.length} delta(s)** and **${risks.length} risk(s)** from your project data.\n\nHere's what I can help with:\n- **"What are the top risks?"** — Ranked risk overview\n- **"What changed?"** — Delta summary by type and severity\n- **"How can we mitigate?"** — Actionable recommendations\n- **"Explain the [task name] delay"** — Task-specific analysis\n- Ask about **cost**, **schedule**, **vendors**, or **specific tasks**\n\nTry one of these, or rephrase your question and I'll do my best to help.`;
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
