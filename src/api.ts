import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { processQuery } from './run_query';

const app = new Hono();

app.use('/*', cors());

app.get('/', (c) => {
  return c.json(
    {
      status: 'ok',
      message: 'LLM Integration API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    }, 
    200
  );
});

app.post('/completions', async (c) => {
  try {
    const body = await c.req.json();
    const { question, model } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return c.json(
        {
          error: 'Invalid request',
          message: 'Missing or invalid "question" field. It must be a string.',
        },
        400
      );
    }

    const modelToUse: string = model || String(process.env.DEFAULT_MODEL);
    if (!modelToUse || modelToUse.trim().length === 0) {
      return c.json(
        {
          error: 'Invalid request',
          message: 'Missing or invalid "model" field. It must be a string.',
        },
        400
      );
    }

    const result = await processQuery(question, modelToUse);

    return c.json(result, 200);
  } catch (error) {
    console.error('Error in /completions endpoint:', error);

    return c.json(
      {
        error: 'Internal server error',
        message:
          error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      500
    );
  }
});

app.notFound((c) => {
  console.error('404 Error:', {
    path: c.req.path,
    method: c.req.method,
  });

  return c.json(
    {
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
    },
    404
  );
});

app.onError((err, c) => {
  console.error('Unhandled error:', err);

  return c.json(
    {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    },
    500
  );
});

export default app;
