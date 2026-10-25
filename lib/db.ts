import { Pool } from 'pg';

// Create a singleton pool instance
// In Next.js, this ensures we don't create multiple pools during development hot reloads
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection can't be established
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

// Export the pool getter
export const db = getPool();

// Helper function for queries
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await db.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}
