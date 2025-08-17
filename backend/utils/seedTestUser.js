const bcrypt = require('bcryptjs');
const prisma = require('./prisma');

/**
 * Creates a test user in the database if it doesn't already exist
 * @param {Object} testUserData - Optional custom test user data
 * @returns {Promise<Object>} - Created or existing user data
 */
const seedTestUser = async (testUserData = {}) => {
  try {
    const defaultTestUser = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'MEMBER',
      address: '123 Test Street, Test City, TC 12345',
      ...testUserData
    };

    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: defaultTestUser.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        address: true,
        createdAt: true
      }
    });

    if (existingUser) {
      console.log(`✅ Test user already exists: ${existingUser.email}`);
      return {
        success: true,
        message: 'Test user already exists',
        data: existingUser,
        isNew: false
      };
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(defaultTestUser.password, saltRounds);

    // Create test user
    const newUser = await prisma.user.create({
      data: {
        email: defaultTestUser.email,
        password: hashedPassword,
        firstName: defaultTestUser.firstName,
        lastName: defaultTestUser.lastName,
        role: defaultTestUser.role,
        address: defaultTestUser.address
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        address: true,
        createdAt: true
      }
    });

    console.log(`✅ Test user created successfully: ${newUser.email}`);
    return {
      success: true,
      message: 'Test user created successfully',
      data: newUser,
      isNew: true
    };

  } catch (error) {
    console.error('❌ Error seeding test user:', error);
    return {
      success: false,
      message: 'Failed to seed test user',
      error: error.message
    };
  }
};

/**
 * Creates a test admin user in the database if it doesn't already exist
 * @param {Object} testAdminData - Optional custom test admin data
 * @returns {Promise<Object>} - Created or existing admin user data
 */
const seedTestAdmin = async (testAdminData = {}) => {
  const defaultTestAdmin = {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    address: '456 Admin Avenue, Admin City, AC 67890',
    ...testAdminData
  };

  return await seedTestUser(defaultTestAdmin);
};

/**
 * Seeds both test user and test admin
 * @returns {Promise<Object>} - Results of both operations
 */
const seedAllTestUsers = async () => {
  console.log('🌱 Seeding test users...');
  
  const userResult = await seedTestUser();
  const adminResult = await seedTestAdmin();

  console.log('🌱 Test user seeding completed');
  
  return {
    user: userResult,
    admin: adminResult
  };
};

module.exports = {
  seedTestUser,
  seedTestAdmin,
  seedAllTestUsers
};
