import { initializeBuiltInResources } from '../src/lib/access-control/accessRegistry';

async function main() {
  console.log('Updating built-in resources...\n');

  try {
    await initializeBuiltInResources();
    console.log('✓ Built-in resources updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to update resources:', error);
    process.exit(1);
  }
}

main();
