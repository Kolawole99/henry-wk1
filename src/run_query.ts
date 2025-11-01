import path from 'path';
import OpenAI from 'openai';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { RiskLevel } from './constants';
import { logQueryData } from './logging';
import { calculateCost } from './metrics';
import type { QueryMetrics, QueryResult } from './types';
import { checkInputSafety, parseJSONResponse, sanitizeQuery, validateResponse } from './safety';

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

export async function processQuery(question: string, model: string, requestId?: string): Promise<QueryResult> {
  const startTime = Date.now();

  const safetyCheck = checkInputSafety(question);
  if (!safetyCheck.passed && safetyCheck.risk_level === RiskLevel.HIGH) {
    const metrics: QueryMetrics = {
      model,
      timestamp: new Date().toISOString(),
      query: question.substring(0, 100),
      tokens_prompt: 0,
      tokens_completion: 0,
      total_tokens: 0,
      latency_ms: Date.now() - startTime,
      estimated_cost_usd: 0,
      request_id: requestId,
    };
    await logQueryData(metrics, question, safetyCheck, requestId);

    return {
      metrics,
      safety: safetyCheck,
      response: {
        answer: 'I cannot process this request due to security concerns.',
        confidence: 1.0,
        actions: ['Please rephrase your question', 'Contact support if you need assistance'],
        category: 'other',
        tags: ['safety', 'moderation'],
      },
    };
  }

  const sanitizedQuery = sanitizeQuery(question);

  try {
    const client = createOpenAIClient();
    const systemPrompt = await loadPromptTemplate();
    
    const completionResponse = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: sanitizedQuery },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    const responseText = completionResponse.choices[0]?.message?.content || '{}';
    const latency = Date.now() - startTime;

    const response = parseJSONResponse(responseText);
    validateResponse(response);

    const tokens = completionResponse.usage;
    if (!tokens) {
      throw new Error('No tokens found in completion response');
    }

    const metrics: QueryMetrics = {
      timestamp: new Date().toISOString(),
      query: sanitizedQuery.substring(0, 200),
      tokens_prompt: tokens.prompt_tokens,
      tokens_completion: tokens.completion_tokens,
      total_tokens: tokens.total_tokens,
      latency_ms: latency,
      estimated_cost_usd: calculateCost(model, tokens.prompt_tokens, tokens.completion_tokens),
      model,
      request_id: requestId,
    };
    await logQueryData(metrics, question, safetyCheck, requestId);

    return {
      response,
      metrics,
      safety: safetyCheck,
    };
  } catch (error) {
    const metrics: QueryMetrics = {
      model,
      timestamp: new Date().toISOString(),
      query: sanitizedQuery.substring(0, 200),
      latency_ms: Date.now() - startTime,
      tokens_prompt: 0,
      tokens_completion: 0,
      total_tokens: 0,
      estimated_cost_usd: 0,
      request_id: requestId,
    };
    await logQueryData(metrics, question, safetyCheck, requestId);

    console.error('Error processing query:', error);

    return {
      metrics,
      safety: safetyCheck,
      response: {
        answer: `I encountered an error processing your question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0.0,
        actions: ['Please try rephrasing your question', 'Contact support if the issue persists'],
        category: 'other',
        tags: ['error'],
      },
    };
  }
}
