import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import type { SafetyCheck } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAFETY_REPORTS_DIR = path.join(__dirname, '..', '..', 'reports', 'safety-reports');

interface SafetyCheckLog {
  timestamp: string;
  query: string;
  safety: SafetyCheck;
  model?: string;
  request_id?: string;
}

/**
 * Ensure safety reports directory exists
 */
async function ensureSafetyReportsDir(): Promise<void> {
  try {
    await fs.mkdir(SAFETY_REPORTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create safety reports directory:', error);
  }
}

/**
 * Load existing safety check logs from file
 */
async function loadSafetyChecks(): Promise<SafetyCheckLog[]> {
  try {
    const data = await fs.readFile(path.join(SAFETY_REPORTS_DIR, 'safety-checks.json'), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

/**
 * Save safety check logs to file
 */
async function saveSafetyChecks(checks: SafetyCheckLog[]): Promise<void> {
  try {
    await fs.writeFile(
      path.join(SAFETY_REPORTS_DIR, 'safety-checks.json'),
      JSON.stringify(checks, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('Failed to save safety checks:', error);
  }
}

/**
 * Log a safety check to the safety reports file
 */
export async function logSafetyChecks(
  query: string,
  safety: SafetyCheck,
  model?: string,
  requestId?: string
): Promise<void> {
  await ensureSafetyReportsDir();

  const safetyLog: SafetyCheckLog = {
    timestamp: new Date().toISOString(),
    query: query.substring(0, 500),
    safety,
    model,
    request_id: requestId,
  };

  const allChecks = await loadSafetyChecks();
  allChecks.push(safetyLog);

  await saveSafetyChecks(allChecks);
}
