import { open, RootDatabase } from 'lmdb';
import path from 'path';

let db: RootDatabase | null = null;

export interface LMDBDatabase extends RootDatabase {}

/**
 * Check if we're in a memory-constrained Docker environment
 */
function isMemoryConstrained(): boolean {
  const mapSize = process.env.LMDB_MAP_SIZE;
  // Always use environment LMDB_MAP_SIZE if provided
  return !!mapSize && parseInt(mapSize) <= 134217728; // Less than or equal to 128MB
}

/**
 * Initialize and return the LMDB database connection
 */
export function getDatabase(): LMDBDatabase {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'lmdb');
    
    // Use environment variable for map size, with fallback
    const envMapSize = process.env.LMDB_MAP_SIZE;
    const mapSize = envMapSize 
      ? parseInt(envMapSize)
      : 128 * 1024 * 1024; // 128MB default for development
    
    try {
      db = open({
        path: dbPath,
        compression: true,
        encoding: 'msgpack',
        mapSize: mapSize,
        maxReaders: envMapSize ? 1 : 4, // Single reader for constrained environments
        maxDbs: envMapSize ? 4 : 16, // Minimal databases for constrained environments
        noMemInit: true, // Don't pre-allocate memory
      });

      console.log(`LMDB initialized at: ${dbPath} (mapSize: ${mapSize / 1024 / 1024}MB)`);
    } catch (error) {
      console.error('LMDB initialization failed:', error);
      throw error;
    }
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
