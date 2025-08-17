const { PrismaClient } = require('@prisma/client');

// Instantiate Prisma Client
const prisma = new PrismaClient();

// Export singleton instance
module.exports = prisma;