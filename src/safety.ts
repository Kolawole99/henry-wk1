import { RiskLevel } from './constants';
import type { SafetyCheck } from './types';

const MAX_QUERY_LENGTH = 5000;

const MIN_QUERY_LENGTH = 3;

const SUSPICIOUS_PATTERNS = [
  /prompt.?injection/i,
  /ignore.?previous/i,
  /forget.?instructions/i,
  /system.?prompt/i,
  /new.?instructions/i,
  /override/i,
  /jailbreak/i,
  /hack/i,
  /exploit/i,
];

const HIGH_RISK_KEYWORDS = [
  'ignore all previous',
  'forget everything',
  'new instructions',
  'system override',
  'developer mode',
];

const MEDIUM_RISK_KEYWORDS = [
  'pretend',
  'act as',
  'roleplay',
  'simulate',
];

/**
 * Performs a safety check on user input
 * @param query - The user's query/question
 * @returns SafetyCheck result with risk assessment
 */
export function checkInputSafety(query: string): SafetyCheck {
  // Check for empty or extremely short queries
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return {
      passed: false,
      risk_level: RiskLevel.LOW,
      reason: 'Query too short or empty',
    };
  }

  // Check for extremely long queries (potential DoS)
  if (query.length > MAX_QUERY_LENGTH) {
    return {
      passed: false,
      risk_level: RiskLevel.HIGH,
      reason: 'Query exceeds maximum length',
    };
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(query)) {
      return {
        passed: false,
        risk_level: RiskLevel.HIGH,
        reason: 'Detected prompt injection pattern',
      };
    }
  }

  // Check for high-risk keywords
  const lowerQuery = query.toLowerCase();
  for (const keyword of HIGH_RISK_KEYWORDS) {
    if (lowerQuery.includes(keyword)) {
      return {
        passed: false,
        risk_level: RiskLevel.HIGH,
        reason: `Contains high-risk keyword: ${keyword}`,
      };
    }
  }

  // Check for medium-risk keywords
  for (const keyword of MEDIUM_RISK_KEYWORDS) {
    if (lowerQuery.includes(keyword)) {
      return {
        passed: true,
        risk_level: RiskLevel.MEDIUM,
        reason: `Contains medium-risk keyword: ${keyword}`,
      };
    }
  }

  // Check for excessive special characters (potential encoding attack)
  const specialCharRatio = (query.match(/[<>{}[\]\\\/|`~!@#$%^&*+=]/g)?.length || 0) / query.length;
  if (specialCharRatio > 0.3) {
    return {
      passed: true,
      risk_level: RiskLevel.MEDIUM,
      reason: 'High ratio of special characters detected',
    };
  }

  // All checks passed
  return {
    passed: true,
    risk_level: RiskLevel.LOW,
    reason: 'No safety concerns detected',
  };
}

/**
 * Sanitizes query text by removing potentially harmful control characters except newlines and tabs
 * @param query - The original query
 * @returns Sanitized query string
 */
export function sanitizeQuery(query: string): string {
  return query
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, MAX_QUERY_LENGTH); 
}
