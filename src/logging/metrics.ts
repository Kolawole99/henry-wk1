import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import type { QueryMetrics } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METRICS_DIR = path.join(__dirname, '..', '..', 'metrics');
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
