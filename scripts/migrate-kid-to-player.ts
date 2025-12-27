/**
 * Migration script to change all 'kid' role to 'player' role in LMDB database
 * Run this script ONCE after deploying the code changes
 */

import { getDatabase } from '../src/lib/db/lmdb';

async function migrateKidToPlayer() {
  console.log('Starting migration: kid -> player');
  
  const db = getDatabase();
  let usersUpdatedCount = 0;
  let membershipsUpdatedCount = 0;
  let errorCount = 0;
  
  try {
    // 1. Iterate through all users
    console.log('\n=== Migrating Users ===');
    for (const { key, value } of db.getRange({ start: 'users:', end: 'users:\xFF' })) {
      try {
        if (value && typeof value === 'object' && 'role' in value) {
          const user = value as any;
          
          // Check if user has 'kid' role
          if (user.role === 'kid') {
            console.log(`Updating user: ${user.id} (${user.username || user.email})`);
            
            // Update role to 'player'
            const updatedUser = {
              ...user,
              role: 'player'
            };
            
            // Save back to database
            db.put(String(key), updatedUser);
            usersUpdatedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing user with key ${String(key)}:`, error);
        errorCount++;
      }
    }

    // 2. Iterate through all academy memberships
    console.log('\n=== Migrating Academy Memberships ===');
    for (const { key, value } of db.getRange({ start: 'academy_membership:', end: 'academy_membership:\xFF' })) {
      try {
        if (value && typeof value === 'object' && 'role' in value) {
          const membership = value as any;
          
          // Check if membership has 'kid' role
          if (membership.role === 'kid') {
            console.log(`Updating membership: ${membership.userId} in academy ${membership.academyId}`);
            
            // Update role to 'player'
            const updatedMembership = {
              ...membership,
              role: 'player'
            };
            
            // Save back to database
            db.put(String(key), updatedMembership);
            membershipsUpdatedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing membership with key ${String(key)}:`, error);
        errorCount++;
      }
    }

    // 3. Update user indexes (academy_memberships_by_user)
    console.log('\n=== Updating User Indexes ===');
    for (const { key, value } of db.getRange({ start: 'academy_memberships_by_user:', end: 'academy_memberships_by_user:\xFF' })) {
      try {
        if (value && typeof value === 'object') {
          const index = value as Record<string, string>;
          let indexUpdated = false;
          
          // Check if any academy has 'kid' role
          for (const [academyId, role] of Object.entries(index)) {
            if (role === 'kid') {
              index[academyId] = 'player';
              indexUpdated = true;
            }
          }
          
          if (indexUpdated) {
            db.put(String(key), index);
            console.log(`Updated index for user: ${String(key).replace('academy_memberships_by_user:', '')}`);
          }
        }
      } catch (error) {
        console.error(`Error processing user index with key ${String(key)}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n=== Migration Complete ===');
    console.log(`Total users updated: ${usersUpdatedCount}`);
    console.log(`Total memberships updated: ${membershipsUpdatedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    
    // Force commit to ensure all changes are written to disk
    console.log('\n⏳ Committing changes to database...');
    await db.flushed;
    console.log('✅ Changes committed successfully');
    
  } catch (error) {
    console.error('Fatal error during migration:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run migration
migrateKidToPlayer()
  .then(() => {
    console.log('Migration script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
