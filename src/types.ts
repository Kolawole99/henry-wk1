import { RiskLevel } from "./constants";

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
  risk_level: RiskLevel;
  reason?: string;
}

export interface QueryResult {
  response: SupportResponse;
  metrics: QueryMetrics;
  safety: SafetyCheck;
}
