import dotenv from 'dotenv';
import { serve } from '@hono/node-server';
import app from './api';

dotenv.config();

const port = Number.parseInt(`${process.env.PORT}`, 10);

console.log(`🚀 Starting server to run on port: ${port}`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`✅ Server is listening at http://localhost:${info.port}`);
});
