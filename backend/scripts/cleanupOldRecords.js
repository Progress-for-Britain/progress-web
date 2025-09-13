const prisma = require('../utils/prisma');

/**
 * Cleanup script to remove old access codes and pending users
 * This script should be run periodically (e.g., daily) to keep the database clean
 */
async function cleanupOldRecords() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  console.log(`Starting cleanup for records older than ${thirtyDaysAgo.toISOString()}`);

  try {
    // Delete access codes older than 30 days
    const deletedAccessCodes = await prisma.accessCode.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    console.log(`Deleted ${deletedAccessCodes.count} access codes`);

    // Delete pending users that have been rejected or approved more than 30 days ago
    const deletedPendingUsers = await prisma.pendingUser.deleteMany({
      where: {
        status: {
          in: ['APPROVED', 'REJECTED']
        },
        updatedAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    console.log(`Deleted ${deletedPendingUsers.count} pending users`);

    // Also delete any pending users that have been unreviewed for more than 90 days (stale applications)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deletedStalePendingUsers = await prisma.pendingUser.deleteMany({
      where: {
        status: 'UNREVIEWED',
        createdAt: {
          lt: ninetyDaysAgo
        }
      }
    });

    console.log(`Deleted ${deletedStalePendingUsers.count} stale unreviewed applications`);

    console.log('Cleanup completed successfully');

  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupOldRecords()
    .then(() => {
      console.log('Cleanup script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup script failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupOldRecords };