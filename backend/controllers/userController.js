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
    const { email, password, accessCode } = req.body;

    // Validate required fields
    if (!email || !password || !accessCode) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and access code are required'
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

    // Verify pending user and access code
    const pending = await prisma.pendingUser.findFirst({
      where: { email, accessCode, status: 'APPROVED' }
    });

    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'Invalid access code'
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
        firstName: pending.firstName,
        lastName: pending.lastName,
        address: pending.constituency,
        role: pending.volunteer ? 'VOLUNTEER' : 'MEMBER'
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

    // Remove pending user record
    await prisma.pendingUser.delete({ where: { id: pending.id } });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user, token }
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

// Get user statistics for account dashboard
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get event participation stats
    const eventStats = await prisma.eventParticipant.aggregate({
      where: {
        userId,
        status: 'ATTENDED'
      },
      _count: {
        id: true
      }
    });

    // Get total volunteer hours
    const volunteerStats = await prisma.volunteerHours.aggregate({
      where: {
        userId,
        approved: true
      },
      _sum: {
        hours: true
      }
    });

    // Get donation stats
    const donationStats = await prisma.payment.aggregate({
      where: {
        userId
      },
      _sum: {
        totalDonated: true
      }
    });

    // Get recent activity counts for this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const thisMonthEvents = await prisma.eventParticipant.count({
      where: {
        userId,
        status: 'ATTENDED',
        checkedInAt: {
          gte: currentMonth
        }
      }
    });

    const thisMonthVolunteerHours = await prisma.volunteerHours.aggregate({
      where: {
        userId,
        approved: true,
        date: {
          gte: currentMonth
        }
      },
      _sum: {
        hours: true
      }
    });

    const thisMonthDonations = await prisma.payment.aggregate({
      where: {
        userId,
        createdAt: {
          gte: currentMonth
        }
      },
      _sum: {
        amount: true
      }
    });

    res.json({
      success: true,
      data: {
        eventsAttended: eventStats._count.id || 0,
        totalVolunteerHours: volunteerStats._sum.hours || 0,
        totalDonated: donationStats._sum.totalDonated || 0,
        thisMonth: {
          eventsAttended: thisMonthEvents || 0,
          volunteerHours: thisMonthVolunteerHours._sum.hours || 0,
          donationAmount: thisMonthDonations._sum.amount || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
};

// Get user activity timeline for account dashboard
const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get recent event participations
    const recentEvents = await prisma.eventParticipant.findMany({
      where: {
        userId,
        status: 'ATTENDED'
      },
      include: {
        event: {
          select: {
            title: true,
            eventType: true
          }
        }
      },
      orderBy: {
        checkedInAt: 'desc'
      },
      take: parseInt(limit)
    });

    // Get recent donations
    const recentDonations = await prisma.payment.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    // Get recent volunteer hours
    const recentVolunteerWork = await prisma.volunteerHours.findMany({
      where: {
        userId,
        approved: true
      },
      include: {
        event: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: parseInt(limit)
    });

    // Combine and sort all activities
    const activities = [];

    recentEvents.forEach(participation => {
      activities.push({
        type: 'event',
        title: `Attended ${participation.event.title}`,
        description: `Participated in ${participation.event.eventType.toLowerCase()} event`,
        date: participation.checkedInAt,
        icon: 'calendar',
        color: '#10B981'
      });
    });

    recentDonations.forEach(donation => {
      activities.push({
        type: 'donation',
        title: `Donated $${donation.amount}`,
        description: donation.purpose || 'General donation',
        date: donation.createdAt,
        icon: 'heart',
        color: '#d946ef'
      });
    });

    recentVolunteerWork.forEach(volunteer => {
      activities.push({
        type: 'volunteer',
        title: `Volunteered ${volunteer.hours} hours`,
        description: volunteer.event ? `For ${volunteer.event.title}` : volunteer.description || 'General volunteer work',
        date: volunteer.date,
        icon: 'people',
        color: '#0ea5e9'
      });
    });

    // Sort by date (most recent first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: activities.slice(0, parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: error.message
    });
  }
};

// Get user's upcoming events
const getUserUpcomingEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    const upcomingEvents = await prisma.eventParticipant.findMany({
      where: {
        userId,
        status: {
          in: ['REGISTERED', 'CONFIRMED']
        },
        event: {
          status: 'UPCOMING',
          startDate: {
            gte: new Date()
          }
        }
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            eventType: true,
            location: true,
            address: true,
            isVirtual: true,
            virtualLink: true,
            startDate: true,
            endDate: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        event: {
          startDate: 'asc'
        }
      },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: upcomingEvents.map(participation => ({
        participationStatus: participation.status,
        registeredAt: participation.registeredAt,
        ...participation.event
      }))
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events',
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
  updatePrivacySettings,
  getUserStats,
  getUserActivity,
  getUserUpcomingEvents
};
