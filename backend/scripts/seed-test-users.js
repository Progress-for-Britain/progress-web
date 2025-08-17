#!/usr/bin/env node

/**
 * Script to seed test users into the database
 * Usage: node scripts/seed-test-users.js
 */

require('dotenv').config();
const { seedAllTestUsers } = require('../utils/seedTestUser');
const prisma = require('../utils/prisma');

async function main() {
  try {
    console.log('🚀 Starting test user seeding...');
    
    const result = await seedAllTestUsers();
    
    console.log('\n📊 Seeding Results:');
    console.log('User:', result.user.success ? '✅' : '❌', result.user.message);
    console.log('Admin:', result.admin.success ? '✅' : '❌', result.admin.message);
    
    if (result.user.success && result.admin.success) {
      console.log('\n🎉 All test users seeded successfully!');
      
      if (result.user.isNew || result.admin.isNew) {
        console.log('\n📝 Test User Credentials:');
        if (result.user.isNew) {
          console.log('Regular User - Email: test@example.com, Password: TestPassword123!');
        }
        if (result.admin.isNew) {
          console.log('Admin User - Email: admin@example.com, Password: AdminPassword123!');
        }
      }
    } else {
      console.log('\n⚠️  Some users failed to seed. Check the logs above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding script
main();
