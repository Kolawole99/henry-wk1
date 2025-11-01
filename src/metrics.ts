import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import type { QueryMetrics } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METRICS_DIR = path.join(__dirname, '..', 'metrics');
const METRICS_FILE = path.join(METRICS_DIR, 'metrics.json');

/**
 * Ensure metrics directory exists
 */
async function ensureMetricsDir(): Promise<void> {
  try {
    await fs.mkdir(METRICS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create metrics directory:', error);
  }
}

/**
 * Load existing metrics from file
 */
async function loadMetrics(): Promise<QueryMetrics[]> {
  try {
    const data = await fs.readFile(METRICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

/**
 * Save metrics to file
 */
async function saveMetrics(metrics: QueryMetrics[]): Promise<void> {
  try {
    await fs.writeFile(METRICS_FILE, JSON.stringify(metrics, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save metrics:', error);
  }
}

/**
 * Log a query metric to the metrics file
 */
export async function logMetrics(metrics: QueryMetrics): Promise<void> {
  await ensureMetricsDir();
  
  const allMetrics = await loadMetrics();
  allMetrics.push(metrics);
  
  await saveMetrics(allMetrics);
}

/**
 * Calculate estimated cost in USD based on model and token usage
 * Using OpenRouter pricing (approximate for common models)
 */
export function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing: Record<string, { prompt: number; completion: number }> = {
    'gpt-4': { prompt: 30.0, completion: 60.0 },
    'gpt-4-turbo': { prompt: 10.0, completion: 30.0 },
    'gpt-3.5-turbo': { prompt: 0.5, completion: 1.5 },
    'claude-3-opus': { prompt: 15.0, completion: 75.0 },
    'claude-3-sonnet': { prompt: 3.0, completion: 15.0 },
    'claude-3-haiku': { prompt: 0.25, completion: 1.25 },
  };

  // Find matching pricing (supports partial model names)
  const modelKey = Object.keys(pricing).find((key) => model.includes(key));

  if (!modelKey) {
    const defaultPricing = pricing['gpt-3.5-turbo'];

    return (
      (promptTokens / 1_000_000) * defaultPricing.prompt +
      (completionTokens / 1_000_000) * defaultPricing.completion
    );
  }

  const modelPricing = pricing[modelKey];
  return (
    (promptTokens / 1_000_000) * modelPricing.prompt +
    (completionTokens / 1_000_000) * modelPricing.completion
  );
}
