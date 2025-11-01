import dotenv from 'dotenv';
import { serve } from '@hono/node-server';
import app from './server';

dotenv.config();

const port = parseInt(process.env.PORT || '3000', 10);

console.log(`🚀 Starting server to run on port: ${port}`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`✅ Server is listening at http://localhost:${info.port}`);
});

