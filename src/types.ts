/**
 * Type definitions for the customer support helper application
 */

export interface SupportResponse {
  answer: string;
  confidence: number;
  actions: string[];
  category: string;
  tags: string[];
}

export interface QueryMetrics {
  timestamp: string;
  model: string;
  query: string;
  latency_ms: number;
  tokens_prompt: number;
  tokens_completion: number;
  total_tokens: number;
  estimated_cost_usd: number;
}

export interface SafetyCheck {
  passed: boolean;
  risk_level: 'low' | 'medium' | 'high';
  reason?: string;
}

export interface QueryResult {
  response: SupportResponse;
  metrics: QueryMetrics;
  safety: SafetyCheck;
}
