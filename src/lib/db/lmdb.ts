import { open, RootDatabase } from 'lmdb';
import path from 'path';

let db: RootDatabase | null = null;

export interface LMDBDatabase extends RootDatabase {}

/**
 * Initialize and return the LMDB database connection
 */
export function getDatabase(): LMDBDatabase {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'lmdb');
    
    db = open({
      path: dbPath,
      compression: true,
      encoding: 'msgpack',
    });

    console.log(`LMDB initialized at: ${dbPath}`);
  }

  return db;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}

/**
 * Generate a unique ID for database records
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
