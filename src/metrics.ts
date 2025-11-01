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
