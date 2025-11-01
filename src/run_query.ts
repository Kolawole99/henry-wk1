import { RiskLevel } from "./constants";
import { QueryResult } from "./types";

export async function processQuery(
  question: string,
  model: string
): Promise<QueryResult> {
  return {
    metrics: {
      model,
      timestamp: new Date().toISOString(),
      query: question,
      tokens_prompt: 0,
      tokens_completion: 0,
      total_tokens: 0,
      latency_ms: 0,
      estimated_cost_usd: 0,
    },
    safety: {
      passed: true,
      risk_level: RiskLevel.LOW,
    },
    response: {
      answer: 'Hello, world!',
      confidence: 0.95,
      actions: ['action1', 'action2'],
      category: 'category',
      tags: ['tag1', 'tag2'],
    },
  };
}