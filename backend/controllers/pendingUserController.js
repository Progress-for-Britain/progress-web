const prisma = require('../utils/prisma');
const crypto = require('crypto');
const { sendFormSubmissionEmail, sendAcceptanceEmail } = require('../utils/email');

// Submit membership application (join page)
const submitApplication = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      constituency, 
      interests, 
      volunteer, 
      newsletter,
      // Volunteer-specific fields
      socialMediaHandle,
      isBritishCitizen,
      livesInUK,
      briefBio,
      briefCV,
      otherAffiliations,
      interestedIn,
      canContribute,
      signedNDA,
      gdprConsent
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Validate volunteer-specific required fields if volunteer is true
    if (volunteer) {
      const requiredVolunteerFields = {
        socialMediaHandle: 'Social media handle',
        isBritishCitizen: 'British citizenship status',
        livesInUK: 'UK residence status',
        briefBio: 'Brief bio',
        briefCV: 'Brief CV',
        signedNDA: 'NDA agreement',
        gdprConsent: 'GDPR consent'
      };

      const missingFields = [];
      
      if (!socialMediaHandle) missingFields.push(requiredVolunteerFields.socialMediaHandle);
      if (isBritishCitizen === undefined || isBritishCitizen === null) missingFields.push(requiredVolunteerFields.isBritishCitizen);
      if (livesInUK === undefined || isBritishCitizen === null) missingFields.push(requiredVolunteerFields.livesInUK);
      if (!briefBio) missingFields.push(requiredVolunteerFields.briefBio);
      if (!briefCV) missingFields.push(requiredVolunteerFields.briefCV);
      if (!signedNDA) missingFields.push(requiredVolunteerFields.signedNDA);
      if (!gdprConsent) missingFields.push(requiredVolunteerFields.gdprConsent);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `The following volunteer fields are required: ${missingFields.join(', ')}`
        });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Check if there's already a pending application
    const existingPending = await prisma.pendingUser.findUnique({
      where: { email }
    });

    if (existingPending && existingPending.status === 'UNREVIEWED') {
      return res.status(409).json({
        success: false,
        message: 'A membership application with this email is already pending review'
      });
    }

    // Create or update pending user application
    const pendingUser = await prisma.pendingUser.upsert({
      where: { email },
      create: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        constituency: constituency || null,
        interests: interests || [],
        volunteer: volunteer || false,
        newsletter: newsletter !== false, // Default to true
        status: 'UNREVIEWED',
        // Volunteer-specific fields
        socialMediaHandle: volunteer ? socialMediaHandle : null,
        isBritishCitizen: volunteer ? isBritishCitizen : null,
        livesInUK: volunteer ? livesInUK : null,
        briefBio: volunteer ? briefBio : null,
        briefCV: volunteer ? briefCV : null,
        otherAffiliations: volunteer ? otherAffiliations : null,
        interestedIn: volunteer ? (interestedIn || []) : [],
        canContribute: volunteer ? (canContribute || []) : [],
        signedNDA: volunteer ? (signedNDA || false) : false,
        gdprConsent: volunteer ? (gdprConsent || false) : false
      },
      update: {
        firstName,
        lastName,
        phone: phone || null,
        constituency: constituency || null,
        interests: interests || [],
        volunteer: volunteer || false,
        newsletter: newsletter !== false,
        status: 'UNREVIEWED',
        reviewedBy: null,
        reviewNotes: null,
        approvedAt: null,
        accessCode: null,
        // Volunteer-specific fields
        socialMediaHandle: volunteer ? socialMediaHandle : null,
        isBritishCitizen: volunteer ? isBritishCitizen : null,
        livesInUK: volunteer ? livesInUK : null,
        briefBio: volunteer ? briefBio : null,
        briefCV: volunteer ? briefCV : null,
        otherAffiliations: volunteer ? otherAffiliations : null,
        interestedIn: volunteer ? (interestedIn || []) : [],
        canContribute: volunteer ? (canContribute || []) : [],
        signedNDA: volunteer ? (signedNDA || false) : false,
        gdprConsent: volunteer ? (gdprConsent || false) : false
      }
    });

    // Send form submission email
    const emailResult = await sendFormSubmissionEmail(email, firstName);
    if (!emailResult.success) {
      console.error('Failed to send form submission email:', emailResult.error);
      // Note: We don't fail the application submission if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Membership application submitted successfully. An admin will review your application shortly.',
      data: {
        id: pendingUser.id,
        email: pendingUser.email,
        firstName: pendingUser.firstName,
        lastName: pendingUser.lastName,
        status: pendingUser.status
      }
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// Get all pending applications (admin only)
const getAllPendingApplications = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const pendingUsers = await prisma.pendingUser.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.pendingUser.count({ where });

    res.json({
      success: true,
      data: {
        applications: pendingUsers,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + pendingUsers.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending applications',
      error: error.message
    });
  }
};

// Get pending application by ID (admin only)
const getPendingApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const pendingUser = await prisma.pendingUser.findUnique({
      where: { id }
    });

    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message: 'Pending application not found'
      });
    }

    res.json({
      success: true,
      data: pendingUser
    });
  } catch (error) {
    console.error('Error fetching pending application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending application',
      error: error.message
    });
  }
};

// Generate access code
const generateAccessCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Approve pending application (admin only)
const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    const adminId = req.user.id;

    // Find pending application
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { id }
    });

    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message: 'Pending application not found'
      });
    }

    if (pendingUser.status !== 'UNREVIEWED' && pendingUser.status !== 'CONTACTED') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been reviewed or is not in a reviewable state'
      });
    }

    // Generate access code
    const accessCode = generateAccessCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update pending user
      const updatedPendingUser = await tx.pendingUser.update({
        where: { id },
        data: {
          status: 'APPROVED',
          accessCode,
          reviewedBy: adminId,
          reviewNotes: reviewNotes || null,
          approvedAt: new Date()
        }
      });

      // Create access code record
      await tx.accessCode.create({
        data: {
          code: accessCode,
          email: pendingUser.email,
          firstName: pendingUser.firstName,
          lastName: pendingUser.lastName,
          constituency: pendingUser.constituency,
          roles: [pendingUser.volunteer ? 'VOLUNTEER' : 'MEMBER'],
          expiresAt
        }
      });

      return updatedPendingUser;
    });

    // Send acceptance email
    const emailResult = await sendAcceptanceEmail(pendingUser.email, pendingUser.firstName, accessCode);
    if (!emailResult.success) {
      console.error('Failed to send acceptance email:', emailResult.error);
      // Note: We don't fail the approval if email fails
    }

    res.json({
      success: true,
      message: 'Application approved successfully',
      data: {
        id: result.id,
        status: result.status,
        accessCode: result.accessCode,
        approvedAt: result.approvedAt
      }
    });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve application',
      error: error.message
    });
  }
};

// Reject pending application (admin only)
const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    const adminId = req.user.id;

    // Find pending application
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { id }
    });

    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message: 'Pending application not found'
      });
    }

    if (pendingUser.status !== 'UNREVIEWED' && pendingUser.status !== 'CONTACTED') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been reviewed or is not in a reviewable state'
      });
    }

    // Update pending user
    const updatedPendingUser = await prisma.pendingUser.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy: adminId,
        reviewNotes: reviewNotes || null,
        approvedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Application rejected',
      data: {
        id: updatedPendingUser.id,
        status: updatedPendingUser.status,
        approvedAt: updatedPendingUser.approvedAt
      }
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject application',
      error: error.message
    });
  }
};

// Validate access code during registration
const validateAccessCode = async (req, res) => {
  try {
    const { code, email } = req.body;

    if (!code || !email) {
      return res.status(400).json({
        success: false,
        message: 'Access code and email are required'
      });
    }

    // Find access code
    const accessCodeRecord = await prisma.accessCode.findUnique({
      where: { code }
    });

    if (!accessCodeRecord) {
      return res.status(404).json({
        success: false,
        message: 'Invalid access code'
      });
    }

    // Check if already used
    if (accessCodeRecord.used) {
      return res.status(400).json({
        success: false,
        message: 'Access code has already been used'
      });
    }

    // Check if expired
    if (new Date() > accessCodeRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Access code has expired'
      });
    }

    // Check if email matches
    if (accessCodeRecord.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Access code is not valid for this email address'
      });
    }

    // Get pending user details
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!pendingUser || pendingUser.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'No approved application found for this email'
      });
    }

    res.json({
      success: true,
      message: 'Access code is valid',
      data: {
        email: pendingUser.email,
        firstName: accessCodeRecord.firstName || pendingUser.firstName,
        lastName: accessCodeRecord.lastName || pendingUser.lastName,
        constituency: accessCodeRecord.constituency || pendingUser.constituency,
        volunteer: pendingUser.volunteer,
        role: (Array.isArray(accessCodeRecord.roles) && accessCodeRecord.roles.length)
          ? accessCodeRecord.roles[0]
          : (pendingUser.volunteer ? 'VOLUNTEER' : 'MEMBER'),
        roles: accessCodeRecord.roles || [pendingUser.volunteer ? 'VOLUNTEER' : 'MEMBER']
      }
    });
  } catch (error) {
    console.error('Error validating access code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate access code',
      error: error.message
    });
  }
};

// Mark access code as used (called during successful registration)
const markAccessCodeUsed = async (code) => {
  try {
    await prisma.accessCode.update({
      where: { code },
      data: {
        used: true,
        usedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error marking access code as used:', error);
    throw error;
  }
};

// Get application statistics (admin only)
const getApplicationStats = async (req, res) => {
  try {
    const totalPending = await prisma.pendingUser.count({
      where: { status: 'PENDING' }
    });

    const totalApproved = await prisma.pendingUser.count({
      where: { status: 'APPROVED' }
    });

    const totalRejected = await prisma.pendingUser.count({
      where: { status: 'REJECTED' }
    });

    const volunteerApplications = await prisma.pendingUser.count({
      where: { 
        volunteer: true,
        status: 'PENDING'
      }
    });

    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentApplications = await prisma.pendingUser.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        pending: totalPending,
        approved: totalApproved,
        rejected: totalRejected,
        volunteerApplications,
        recentApplications
      }
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics',
      error: error.message
    });
  }
};

// Update volunteer details for pending user (admin only)
const updatePendingUserVolunteerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      socialMediaHandle,
      isBritishCitizen,
      livesInUK,
      briefBio,
      briefCV,
      otherAffiliations,
      interestedIn,
      canContribute,
      signedNDA,
      gdprConsent
    } = req.body;

    // Check if pending user exists
    const existingPendingUser = await prisma.pendingUser.findUnique({
      where: { id }
    });

    if (!existingPendingUser) {
      return res.status(404).json({
        success: false,
        message: 'Pending user not found'
      });
    }

    // Update the pending user with new volunteer details
    const updatedPendingUser = await prisma.pendingUser.update({
      where: { id },
      data: {
        socialMediaHandle: socialMediaHandle || null,
        isBritishCitizen: isBritishCitizen !== undefined ? isBritishCitizen : null,
        livesInUK: livesInUK !== undefined ? livesInUK : null,
        briefBio: briefBio || null,
        briefCV: briefCV || null,
        otherAffiliations: otherAffiliations || null,
        interestedIn: interestedIn || [],
        canContribute: canContribute || [],
        signedNDA: signedNDA || false,
        gdprConsent: gdprConsent || false
      }
    });

    res.json({
      success: true,
      message: 'Volunteer details updated successfully',
      data: updatedPendingUser
    });
  } catch (error) {
    console.error('Error updating volunteer details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update volunteer details',
      error: error.message
    });
  }
};

// Update application status (admin only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    const adminId = req.user.id;

    // Validate status
    const validStatuses = ['UNREVIEWED', 'CONTACTED', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Find pending application
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { id }
    });

    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message: 'Pending application not found'
      });
    }

    // Validate status transitions
    const currentStatus = pendingUser.status;
    const allowedTransitions = {
      'UNREVIEWED': ['CONTACTED', 'APPROVED', 'REJECTED'],
      'CONTACTED': ['APPROVED', 'REJECTED', 'UNREVIEWED'],
      'APPROVED': [],
      'REJECTED': ['UNREVIEWED', 'CONTACTED']
    };

    if (!allowedTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${currentStatus} to ${status}`
      });
    }

    // Update data object
    const updateData = {
      status,
      reviewedBy: adminId,
      reviewNotes: reviewNotes || null,
      updatedAt: new Date()
    };

    // For approvals, generate access code
    if (status === 'APPROVED') {
      const accessCode = generateAccessCode();
      updateData.accessCode = accessCode;
      updateData.approvedAt = new Date();

      // Start transaction to create access code record
      const result = await prisma.$transaction(async (tx) => {
        const updatedPendingUser = await tx.pendingUser.update({
          where: { id },
          data: updateData
        });

        // Create access code record
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days

        await tx.accessCode.create({
          data: {
            code: accessCode,
            email: pendingUser.email,
            firstName: pendingUser.firstName,
            lastName: pendingUser.lastName,
            constituency: pendingUser.constituency,
            roles: [pendingUser.volunteer ? 'VOLUNTEER' : 'MEMBER'],
            expiresAt
          }
        });

        return updatedPendingUser;
      });

      // Send acceptance email
      const emailResult = await sendAcceptanceEmail(pendingUser.email, pendingUser.firstName, accessCode);
      if (!emailResult.success) {
        console.error('Failed to send acceptance email:', emailResult.error);
        // Note: We don't fail the approval if email fails
      }

      return res.json({
        success: true,
        message: 'Application status updated to approved successfully',
        data: {
          id: result.id,
          status: result.status,
          accessCode: result.accessCode,
          approvedAt: result.approvedAt
        }
      });
    } else {
      // For other status updates
      if (status === 'REJECTED') {
        updateData.approvedAt = new Date(); // Track when rejection happened
      }

      const updatedPendingUser = await prisma.pendingUser.update({
        where: { id },
        data: updateData
      });

      return res.json({
        success: true,
        message: `Application status updated to ${status.toLowerCase()} successfully`,
        data: {
          id: updatedPendingUser.id,
          status: updatedPendingUser.status,
          reviewedBy: updatedPendingUser.reviewedBy,
          reviewNotes: updatedPendingUser.reviewNotes,
          updatedAt: updatedPendingUser.updatedAt
        }
      });
    }
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
};

module.exports = {
  submitApplication,
  getAllPendingApplications,
  getPendingApplicationById,
  approveApplication,
  rejectApplication,
  validateAccessCode,
  markAccessCodeUsed,
  getApplicationStats,
  updatePendingUserVolunteerDetails,
  updateApplicationStatus
};
