import { Hono } from 'hono';
import { cors } from 'hono/cors';

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

app.notFound((c) => {
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

