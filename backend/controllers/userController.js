const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { verifyTurnstileToken } = require('../utils/turnstile');

// Primary role derivation from roles[] with precedence
const derivePrimaryRole = (roles) => {
  const r = Array.isArray(roles) ? roles : [];
  const order = ['ADMIN', 'ONBOARDING', 'EVENT_MANAGER', 'WRITER', 'VOLUNTEER', 'MEMBER'];
  for (const key of order) if (r.includes(key)) return key;
  return 'MEMBER';
};

// Helper function to detect device type from user agent
const getDeviceType = (userAgent) => {
  if (!userAgent) return 'Unknown';
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('blackberry') || ua.includes('windows phone')) {
    return 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad') || ua.includes('kindle') || ua.includes('playbook')) {
    return 'Tablet';
  } else {
    return 'Desktop';
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        roles: true,
        firstName: true,
        lastName: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        constituency: true,
        payments: {
          select: {
            id: true,
            customerId: true,
            subscriptionId: true,
            status: true,
            amount: true,
            currency: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            totalDonated: true
          }
        },
        notificationPreferences: true,
        privacySettings: true
      }
    });

    // Synthesize legacy role for clients
    const usersWithPrimaryRole = users.map(u => ({ ...u, role: derivePrimaryRole(u.roles) }));

    res.json({
      success: true,
      data: usersWithPrimaryRole
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
        roles: true,
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
            status: true,
            amount: true,
            currency: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            totalDonated: true
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

    const userWithPrimaryRole = user ? { ...user, role: derivePrimaryRole(user.roles) } : null;

    res.json({
      success: true,
      data: userWithPrimaryRole
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
    let { email, password, firstName, lastName, accessCode } = req.body;

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

    let userRole = 'MEMBER'; // Default role
    let constituency = null;

    // If access code is provided, validate it and determine role
    if (accessCode) {
      const accessCodeRecord = await prisma.accessCode.findUnique({
        where: { code: accessCode }
      });

      if (!accessCodeRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid access code'
        });
      }

      if (accessCodeRecord.used) {
        return res.status(400).json({
          success: false,
          message: 'Access code has already been used'
        });
      }

      if (new Date() > accessCodeRecord.expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'Access code has expired'
        });
      }

      if (accessCodeRecord.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'Access code is not valid for this email address'
        });
      }

      constituency = accessCodeRecord.constituency;
      firstName = accessCodeRecord.firstName || firstName;
      lastName = accessCodeRecord.lastName || lastName;
      email = accessCodeRecord.email || email;
      // Determine roles granted by access code
      const codeRoles = Array.isArray(accessCodeRecord.roles) && accessCodeRecord.roles.length
        ? accessCodeRecord.roles
        : [accessCodeRecord.role || userRole];
      role = codeRoles[0];
      req._grantedRoles = codeRoles; // carry forward for user creation

      // Get the pending user to determine role
      const pendingUser = await prisma.pendingUser.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (pendingUser && pendingUser.status === 'APPROVED') {
        userRole = pendingUser.volunteer ? 'VOLUNTEER' : 'MEMBER';
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          roles: (req._grantedRoles && req._grantedRoles.length) ? req._grantedRoles : [role || userRole],
          constituency
        },
        select: {
          id: true,
          email: true,
          roles: true,
          firstName: true,
          lastName: true,
          createdAt: true
        }
      });

      // If access code was used, mark it as used
      if (accessCode) {
        await tx.accessCode.update({
          where: { code: accessCode },
          data: {
            used: true,
            usedAt: new Date()
          }
        });
      }

      return user;
    });

    // Schedule cleanup of pending user and access code after 1 minute
    if (accessCode) {
      setTimeout(async () => {
        try {
          const email = accessCodeRecord.email.toLowerCase();
          await prisma.$transaction(async (tx) => {
            // Delete pending user
            await tx.pendingUser.deleteMany({
              where: { email }
            });
            // Delete access code
            await tx.accessCode.deleteMany({
              where: { code: accessCode }
            });
          });
          console.log(`Cleaned up pending user and access code for email: ${email}`);
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      }, 60000); // 1 minute delay
    }

    // Generate refresh token
    const crypto = require('crypto');
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Create refresh token record
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
        userId: result.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceType: getDeviceType(req.get('User-Agent'))
      }
    });

    // Generate JWT token for auto-login (short-lived)
    const token = jwt.sign(
      { 
        userId: result.id, 
        email: result.email, 
        role: derivePrimaryRole(result.roles),
        roles: Array.isArray(result.roles) ? result.roles : [],
        firstName: result.firstName,
        lastName: result.lastName
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' } // 15 minutes
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: { ...result, role: derivePrimaryRole(result.roles) },
        token,
        refreshToken
      }
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
    const { email, firstName, lastName, address, role, constituency } = req.body;

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
        ...(constituency !== undefined && { constituency })
      },
      select: {
        id: true,
        email: true,
        // role derived
        roles: true,
        firstName: true,
        lastName: true,
        address: true,
        constituency: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { ...updatedUser, role: derivePrimaryRole(updatedUser.roles) }
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
    const { email, password, captchaToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Verify captcha if provided
    if (captchaToken) {
      const verify = await verifyTurnstileToken(captchaToken);
      if (!verify.success) {
        console.error('Captcha verification failed:', verify.error || verify.errorCodes);
        return res.status(400).json({
          success: false,
          message: 'Captcha verification failed. Please try again.'
        });
      }
    } else {
      // If captcha is required but not provided, fail
      return res.status(400).json({
        success: false,
        message: 'Captcha verification is required.'
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

    // Generate refresh token
    const crypto = require('crypto');
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Create refresh token record
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceType: getDeviceType(req.get('User-Agent'))
      }
    });

    // Generate JWT access token (short-lived)
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: derivePrimaryRole(user.roles),
        roles: Array.isArray(user.roles) ? user.roles : [],
        firstName: user.firstName,
        lastName: user.lastName
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' } // 15 minutes
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: derivePrimaryRole(user.roles),
          roles: Array.isArray(user.roles) ? user.roles : [],
          firstName: user.firstName,
          lastName: user.lastName
        },
        token,
        refreshToken
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

// User logout
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const user = refreshTokenRecord.user;

    // Generate new access token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: derivePrimaryRole(user.roles),
        roles: Array.isArray(user.roles) ? user.roles : [],
        firstName: user.firstName,
        lastName: user.lastName
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
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
    const userId = req.user.userId;

    // Get total events participated in (all statuses except cancelled, only completed events)
    const totalEventParticipations = await prisma.eventParticipant.aggregate({
      where: {
        userId,
        status: {
          not: 'CANCELLED'
        },
        event: {
          status: 'COMPLETED'
        }
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

    const thisMonthEventParticipations = await prisma.eventParticipant.count({
      where: {
        userId,
        status: {
          not: 'CANCELLED'
        },
        event: {
          status: 'COMPLETED'
        },
        registeredAt: {
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
        eventsParticipated: totalEventParticipations._count.id || 0,
        totalVolunteerHours: volunteerStats._sum.hours || 0,
        totalDonated: donationStats._sum.totalDonated || 0,
        thisMonth: {
          eventsParticipated: thisMonthEventParticipations || 0,
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
    const userId = req.user.userId;
    const { limit = 10 } = req.query;

    // Get recent event participations (all statuses except cancelled, only completed events)
    const recentEvents = await prisma.eventParticipant.findMany({
      where: {
        userId,
        status: {
          not: 'CANCELLED'
        },
        event: {
          status: 'COMPLETED'
        }
      },
      include: {
        event: {
          select: {
            title: true,
            eventType: true,
            startDate: true
          }
        }
      },
      orderBy: {
        registeredAt: 'desc'
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
        title: `Participated in ${participation.event.title}`,
        description: `Participated in ${participation.event.eventType.toLowerCase()} event`,
        date: participation.event.startDate,
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
    const userId = req.user.userId;
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

// Admin user management functions

// Assign user to event (admin only)
const assignUserToEvent = async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    const { status = 'REGISTERED' } = req.body;

    // Validate permissions: Admin or Onboarding
    {
      const roles = Array.isArray(req.user.roles) ? req.user.roles : [];
      const isAdmin = req.user.role === 'ADMIN' || roles.includes('ADMIN');
      const isEventManager = roles.includes('EVENT_MANAGER');
      if (!isAdmin && !isEventManager) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin or Onboarding role required.'
        });
      }
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is already assigned to event
    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (existingParticipant) {
      return res.status(409).json({
        success: false,
        message: 'User is already assigned to this event'
      });
    }

    // Assign user to event
    const eventParticipant = await prisma.eventParticipant.create({
      data: {
        userId,
        eventId,
        status
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            eventType: true,
            startDate: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'User assigned to event successfully',
      data: eventParticipant
    });
  } catch (error) {
    console.error('Error assigning user to event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign user to event',
      error: error.message
    });
  }
};

// Unassign user from event (admin only)
const unassignUserFromEvent = async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    // Validate admin permissions
    {
      const roles = Array.isArray(req.user.roles) ? req.user.roles : [];
      if (
        !roles.includes('ADMIN') && 
        !roles.includes('EVENT_MANAGER')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }
    }

    // Check if assignment exists
    const eventParticipant = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        event: {
          select: {
            title: true
          }
        }
      }
    });

    if (!eventParticipant) {
      return res.status(404).json({
        success: false,
        message: 'User assignment to event not found'
      });
    }

    // Remove assignment
    await prisma.eventParticipant.delete({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    res.json({
      success: true,
      message: 'User unassigned from event successfully',
      data: {
        user: eventParticipant.user,
        event: eventParticipant.event
      }
    });
  } catch (error) {
    console.error('Error unassigning user from event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unassign user from event',
      error: error.message
    });
  }
};

// Update user role(s) (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, roles } = req.body;

    // Validate admin permissions
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];
    if (!userRoles.includes('ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Validate role
    const validRoles = ['ADMIN', 'WRITER', 'MEMBER', 'VOLUNTEER', 'ONBOARDING', 'EVENT_MANAGER'];
    if (roles !== undefined) {
      if (!Array.isArray(roles) || roles.length === 0 || !roles.every(r => validRoles.includes(r))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid roles. Must be a non-empty array of: ' + validRoles.join(', ')
        });
      }
    } else if (role !== undefined) {
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be one of: ' + validRoles.join(', ')
        });
      }
    } else {
      return res.status(400).json({ success: false, message: 'role or roles is required' });
    }

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

    // Build update
    const updateData = {};
    if (roles) {
      updateData.roles = roles;
    } else if (role) {
      // Replace roles array with single role
      updateData.roles = [role];
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        roles: true,
        firstName: true,
        lastName: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { ...updatedUser, role: derivePrimaryRole(updatedUser.roles) }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

// Get user's event assignments (admin only)
const getUserEventAssignments = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate admin permissions
    {
      const roles = Array.isArray(req.user.roles) ? req.user.roles : [];
      if (
        !roles.includes('ADMIN') && 
        !roles.includes('EVENT_MANAGER')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }
    }

    const eventAssignments = await prisma.eventParticipant.findMany({
      where: { userId: id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            eventType: true,
            status: true,
            location: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: {
        event: {
          startDate: 'desc'
        }
      }
    });

    res.json({
      success: true,
      data: eventAssignments
    });
  } catch (error) {
    console.error('Error fetching user event assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user event assignments',
      error: error.message
    });
  }
};

// Get user management statistics (admin only)
const getUserManagementStats = async (req, res) => {
  try {
    // Validate admin permissions
    {
      const roles = Array.isArray(req.user.roles) ? req.user.roles : [];
      if (
        !roles.includes('ADMIN') && 
        !roles.includes('ONBOARDING')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin or Onboarding role required.'
        });
      }
    }

    // Get total users by role (from roles[])
    const users = await prisma.user.findMany({ select: { roles: true } });
    const counts = users.reduce((acc, u) => {
      const r = Array.isArray(u.roles) ? u.roles : [];
      for (const role of r) acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    // Get recent user registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get active users (users who have participated in events in last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const activeUsers = await prisma.user.count({
      where: {
        eventParticipants: {
          some: {
            registeredAt: {
              gte: ninetyDaysAgo
            }
          }
        }
      }
    });

    // Get total volunteer hours this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyVolunteerHours = await prisma.volunteerHours.aggregate({
      where: {
        approved: true,
        date: {
          gte: currentMonth
        }
      },
      _sum: {
        hours: true
      }
    });

    res.json({
      success: true,
      data: {
        usersByRole: counts,
        recentRegistrations,
        activeUsers,
        monthlyVolunteerHours: monthlyVolunteerHours._sum.hours || 0
      }
    });
  } catch (error) {
    console.error('Error fetching user management stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user management statistics',
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
  logout,
  refreshToken,
  getNotificationPreferences,
  updateNotificationPreferences,
  getPrivacySettings,
  updatePrivacySettings,
  getUserStats,
  getUserActivity,
  getUserUpcomingEvents,
  assignUserToEvent,
  unassignUserFromEvent,
  updateUserRole,
  getUserEventAssignments,
  getUserManagementStats
};
