/**
 * Check migration status - verify all 'kid' roles are migrated to 'player'
 */

import { getDatabase } from '../src/lib/db/lmdb';

async function checkMigration() {
  console.log('Checking migration status...\n');
  
  const db = getDatabase();
  let kidUsersCount = 0;
  let playerUsersCount = 0;
  let kidMembershipsCount = 0;
  let playerMembershipsCount = 0;
  let kidIndexesCount = 0;
  
  try {
    // 1. Check users
    console.log('=== Checking Users ===');
    for (const { key, value } of db.getRange({ start: 'users:', end: 'users:\xFF' })) {
      if (value && typeof value === 'object' && 'role' in value) {
        const user = value as any;
        
        if (user.role === 'kid') {
          console.log(`❌ Found user with 'kid' role: ${user.id} (${user.username || user.email})`);
          kidUsersCount++;
        } else if (user.role === 'player') {
          playerUsersCount++;
        }
      }
    }
    
    console.log(`✅ Players found: ${playerUsersCount}`);
    console.log(`❌ Kids found: ${kidUsersCount}\n`);

    // 2. Check academy memberships
    console.log('=== Checking Academy Memberships ===');
    for (const { key, value } of db.getRange({ start: 'academy_membership:', end: 'academy_membership:\xFF' })) {
      if (value && typeof value === 'object' && 'role' in value) {
        const membership = value as any;
        
        if (membership.role === 'kid') {
          console.log(`❌ Found membership with 'kid' role: ${membership.userId} in academy ${membership.academyId}`);
          kidMembershipsCount++;
        } else if (membership.role === 'player') {
          playerMembershipsCount++;
        }
      }
    }
    
    console.log(`✅ Player memberships found: ${playerMembershipsCount}`);
    console.log(`❌ Kid memberships found: ${kidMembershipsCount}\n`);

    // 3. Check user indexes
    console.log('=== Checking User Indexes ===');
    for (const { key, value } of db.getRange({ start: 'academy_memberships_by_user:', end: 'academy_memberships_by_user:\xFF' })) {
      if (value && typeof value === 'object') {
        const index = value as Record<string, string>;
        
        for (const [academyId, role] of Object.entries(index)) {
          if (role === 'kid') {
            console.log(`❌ Found 'kid' role in index for user: ${String(key).replace('academy_memberships_by_user:', '')} in academy ${academyId}`);
            kidIndexesCount++;
          }
        }
      }
    }
    
    console.log(`❌ Kid roles in indexes: ${kidIndexesCount}\n`);
    
    // Summary
    console.log('=== Migration Status Summary ===');
    if (kidUsersCount === 0 && kidMembershipsCount === 0 && kidIndexesCount === 0) {
      console.log('✅ Migration completed successfully! No "kid" roles found.');
      console.log(`✅ Total players: ${playerUsersCount}`);
      console.log(`✅ Total player memberships: ${playerMembershipsCount}`);
    } else {
      console.log('⚠️  Migration incomplete or not run!');
      console.log(`❌ Users with 'kid' role: ${kidUsersCount}`);
      console.log(`❌ Memberships with 'kid' role: ${kidMembershipsCount}`);
      console.log(`❌ Indexes with 'kid' role: ${kidIndexesCount}`);
      console.log('\n🔧 Run: npm run migrate:kid-to-player');
    }
    
  } catch (error) {
    console.error('Fatal error during check:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run check
checkMigration()
  .then(() => {
    console.log('\nCheck completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });
