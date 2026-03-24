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

    const raw = await chatCompletion([{ role: "user", content: prompt }]);

    try {
      const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
      const structured: StructuredExplanation = JSON.parse(cleaned);
      return {
        text: `${structured.signal} ${structured.impact} ${structured.rootCause} ${structured.action}`,
        structured,
      };
    } catch {
      return {
        text: raw || "No explanation generated.",
        structured: {
          signal: risk.description,
          impact: "Impact assessment pending.",
          rootCause: "Root cause analysis pending.",
          action: "Escalate to project lead for manual review.",
        },
      };
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

    return await chatCompletion([{ role: "user", content: prompt }]) || "Unable to process challenge.";
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

    return await chatCompletion([{ role: "user", content: prompt }]) || "";
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

    return await chatCompletion(messages) || "I'm sorry, I couldn't process that request.";
  }
}
