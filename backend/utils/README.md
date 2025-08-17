# Backend Utilities

This directory contains utility functions and scripts for the backend application.

## Test User Seeding

The `seedTestUser.js` utility allows you to create test users in the database for development and testing purposes.

### Available Functions

- `seedTestUser(testUserData)` - Creates a regular test user
- `seedTestAdmin(testAdminData)` - Creates a test admin user  
- `seedAllTestUsers()` - Creates both test user and admin

### Usage

#### As a Script
```bash
# Run the seeding script directly
npm run seed:test-users

# Or run the script file directly
node scripts/seed-test-users.js
```

#### In Code
```javascript
const { seedTestUser, seedTestAdmin, seedAllTestUsers } = require('./utils/seedTestUser');

// Seed a regular test user
const result = await seedTestUser();

// Seed with custom data
const customUser = await seedTestUser({
  email: 'custom@test.com',
  firstName: 'Custom',
  lastName: 'User'
});

// Seed admin user
const adminResult = await seedTestAdmin();

// Seed both
const allResults = await seedAllTestUsers();
```

#### Automatic Seeding on Server Start

The server can automatically seed test users when starting in development mode:

```bash
# Set environment variable
export NODE_ENV=development
npm start

# Or use the convenience script
npm run dev:seed

# Or set the specific flag
export SEED_TEST_USERS=true
npm start
```

### Default Test Users

When seeded, the following test users are created:

**Regular User:**
- Email: `test@example.com`
- Password: `TestPassword123!`
- Role: `MEMBER`

**Admin User:**
- Email: `admin@example.com`
- Password: `AdminPassword123!`
- Role: `ADMIN`

### Safety Features

- **Duplicate Prevention**: The utility checks if users already exist before creating them
- **Secure Passwords**: Passwords are properly hashed using bcrypt
- **Error Handling**: Comprehensive error handling and logging
- **Graceful Failures**: Script continues even if some users fail to create

### Environment Variables

- `NODE_ENV=development` - Enables automatic seeding on server start
- `SEED_TEST_USERS=true` - Forces test user seeding regardless of NODE_ENV
