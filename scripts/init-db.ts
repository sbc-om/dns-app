import { initializeDatabase, isDatabaseInitialized } from '../src/lib/db/initialize';

async function main() {
  console.log('Starting database initialization...\n');

  const isInitialized = await isDatabaseInitialized();

  if (isInitialized) {
    console.log('Database is already initialized. Skipping...');
    process.exit(0);
  }

  const result = await initializeDatabase();

  if (result.success) {
    process.exit(0);
  } else {
    console.error('Failed to initialize database');
    process.exit(1);
  }
}

main();
