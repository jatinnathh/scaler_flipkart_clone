import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Strip channel_binding param which can cause issues with the HTTP-based serverless driver
const cleanUrl = DATABASE_URL.replace(/&channel_binding=require/g, '');

// Create a SQL query function using neon's serverless driver
const sql = neon(cleanUrl);

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to run parameterized queries with retry logic
export async function query(text: string, params?: any[]) {
  let lastError: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (params && params.length > 0) {
        const result = await sql.query(text, params);
        return result;
      } else {
        const result = await sql.query(text);
        return result;
      }
    } catch (error: any) {
      lastError = error;
      const isTransient =
        error?.sourceError?.code === 'ECONNRESET' ||
        error?.sourceError?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
        error?.message?.includes('fetch failed') ||
        error?.message?.includes('ECONNRESET');

      if (isTransient && attempt < MAX_RETRIES) {
        console.warn(`DB query attempt ${attempt}/${MAX_RETRIES} failed (transient), retrying in ${RETRY_DELAY_MS * attempt}ms...`);
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }

      console.error('Database query error:', error);
      throw error;
    }
  }

  throw lastError;
}
