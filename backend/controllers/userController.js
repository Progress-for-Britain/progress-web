const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        payments: {
          select: {
            id: true,
            customerId: true,
            subscriptionId: true,
            billingCycle: true,
            status: true,
            amount: true,
            currency: true,
            startDate: true,
            endDate: true,
            nextBillingDate: true
          }
        },
        notificationPreferences: true,
        privacySettings: true
      }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        payments: {
          select: {
            id: true,
            customerId: true,
            subscriptionId: true,
            billingCycle: true,
            status: true,
            amount: true,
            currency: true,
            startDate: true,
            endDate: true,
            nextBillingDate: true
          }
        },
        notificationPreferences: true,
        privacySettings: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// Create new user (registration)
const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, address, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        address: address || null,
        role: role || 'MEMBER'
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        address: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, address, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If email is being updated, check for conflicts
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(address !== undefined && { address }),
        ...(role && { role })
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        address: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user (this will cascade delete payments due to schema)
    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// User login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get user's notification preferences
const getNotificationPreferences = async (req, res) => {
  try {
    const { id } = req.params;

    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: id }
    });

    // If preferences don't exist, create default ones
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId: id,
          emailNewsletter: true,
          eventNotifications: true,
          donationReminders: false,
          pushNotifications: true,
          smsUpdates: false
        }
      });
    }

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences',
      error: error.message
    });
  }
};

// Update user's notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { emailNewsletter, eventNotifications, donationReminders, pushNotifications, smsUpdates } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Upsert notification preferences
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: id },
      create: {
        userId: id,
        emailNewsletter: emailNewsletter ?? true,
        eventNotifications: eventNotifications ?? true,
        donationReminders: donationReminders ?? false,
        pushNotifications: pushNotifications ?? true,
        smsUpdates: smsUpdates ?? false
      },
      update: {
        ...(emailNewsletter !== undefined && { emailNewsletter }),
        ...(eventNotifications !== undefined && { eventNotifications }),
        ...(donationReminders !== undefined && { donationReminders }),
        ...(pushNotifications !== undefined && { pushNotifications }),
        ...(smsUpdates !== undefined && { smsUpdates })
      }
    });

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: preferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
};

// Get user's privacy settings
const getPrivacySettings = async (req, res) => {
  try {
    const { id } = req.params;

    let settings = await prisma.privacySettings.findUnique({
      where: { userId: id }
    });

    // If settings don't exist, create default ones
    if (!settings) {
      settings = await prisma.privacySettings.create({
        data: {
          userId: id,
          publicProfile: true,
          shareActivity: false,
          allowMessages: true
        }
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch privacy settings',
      error: error.message
    });
  }
};

// Update user's privacy settings
const updatePrivacySettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { publicProfile, shareActivity, allowMessages } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Upsert privacy settings
    const settings = await prisma.privacySettings.upsert({
      where: { userId: id },
      create: {
        userId: id,
        publicProfile: publicProfile ?? true,
        shareActivity: shareActivity ?? false,
        allowMessages: allowMessages ?? true
      },
      update: {
        ...(publicProfile !== undefined && { publicProfile }),
        ...(shareActivity !== undefined && { shareActivity }),
        ...(allowMessages !== undefined && { allowMessages })
      }
    });

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update privacy settings',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getNotificationPreferences,
  updateNotificationPreferences,
  getPrivacySettings,
  updatePrivacySettings
};
