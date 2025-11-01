import { SupportResponse } from "../types";

/**
 * Parse JSON response from LLM, handling removal of potential markdown code blocks if present
 */
export function parseJSONResponse(text: string): SupportResponse {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
  
    try {
      return JSON.parse(cleaned) as SupportResponse;
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
/**
 * Validate response structure
 */
export function validateResponse(response: SupportResponse): void {
    if (!response.answer || typeof response.answer !== 'string') {
      throw new Error('Missing or invalid answer field');
    }

    if (typeof response.confidence !== 'number' || response.confidence < 0 || response.confidence > 1) {
      throw new Error('Confidence must be a number between 0 and 1');
    }

    if (!Array.isArray(response.actions)) {
      throw new Error('Actions must be an array');
    }

    if (!response.category || typeof response.category !== 'string') {
      throw new Error('Missing or invalid category field');
    }

    if (!Array.isArray(response.tags)) {
      throw new Error('Tags must be an array');
    }
}
