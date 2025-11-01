import type { QueryMetrics, SafetyCheck } from '../types';
import { logMetrics } from './metrics';
import { logSafetyChecks } from './safety';

/**
 * Unified logging function that logs both metrics and safety checks
 * This is the central logging function for query data
 */
export async function logQueryData(
  metrics: QueryMetrics,
  query: string,
  safety: SafetyCheck,
  requestId?: string
): Promise<void> {
  await Promise.all([
    logMetrics(metrics),
    logSafetyChecks(query, safety, metrics.model, requestId),
  ]);
}
