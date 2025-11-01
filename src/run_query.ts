import path from 'path';
import OpenAI from 'openai';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

import { RiskLevel } from './constants';
import type { QueryResult } from './types';

function createOpenAIClient(): OpenAI {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENROUTER_API_KEY && !OPENAI_API_KEY) {
    throw new Error('Either OPENROUTER_API_KEY or OPENAI_API_KEY must be set');
  }

  return new OpenAI({
    apiKey: OPENROUTER_API_KEY || OPENAI_API_KEY,
    baseURL: OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined,
    defaultHeaders: OPENROUTER_API_KEY
      ? {
          'HTTP-Referer': process.env.OPENROUTER_REFERER_URL,
          'X-Title': process.env.OPENROUTER_APP_NAME,
        }
      : undefined,
  });
}

async function loadPromptTemplate(): Promise<string> {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const promptPath = path.join(__dirname, '..', 'prompts', 'main_prompt.md');

    const content = await fs.readFile(promptPath, 'utf-8');
  
    return content.trim();
  } catch (error) {
    console.error('Error loading prompt template:', error);
    throw error;
  }
}

export async function processQuery(question: string, model: string): Promise<QueryResult> {
  const prompt = await loadPromptTemplate();
  const client = createOpenAIClient();
 
  console.log('Prompt:', prompt);
  console.log('Question:', question);
  console.log('Model:', model);
  console.log('Client:', client);

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
