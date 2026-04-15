import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create a SQL query function using neon's serverless driver
const sql = neon(DATABASE_URL);

// Helper to run parameterized queries
// Uses sql.query() for conventional function call syntax
export async function query(text: string, params?: any[]) {
  try {
    if (params && params.length > 0) {
      const result = await sql.query(text, params);
      return result;
    } else {
      // For queries without parameters, use tagged template
      const result = await sql.query(text);
      return result;
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
