import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { corsOptions } from './config/cors.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Clerk middleware — makes auth() available on all routes
app.use(clerkMiddleware());

// CORS — whitelist frontend origins
app.use(cors(corsOptions));

// Body parsing — raw for webhooks, json for everything else
app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());

// All routes
app.use('/api', routes);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Flipkart Clone API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
