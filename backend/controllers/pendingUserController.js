const prisma = require('../utils/prisma');
const crypto = require('crypto');

// Create pending user (join request)
const createPendingUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      constituency,
      interests = [],
      volunteer = false,
    } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name and email are required'
      });
    }

    const pending = await prisma.pendingUser.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        constituency,
        interests,
        volunteer
      }
    });

    res.status(201).json({ success: true, data: pending });
  } catch (error) {
    console.error('Error creating pending user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pending user',
      error: error.message
    });
  }
};

// Get all pending users
const getPendingUsers = async (req, res) => {
  try {
    const users = await prisma.pendingUser.findMany();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending users',
      error: error.message
    });
  }
};

// Approve pending user and generate access code
const approvePendingUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pending = await prisma.pendingUser.findUnique({ where: { id } });
    if (!pending) {
      return res.status(404).json({ success: false, message: 'Pending user not found' });
    }
    if (pending.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'User has already been processed' });
    }
    const accessCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    await prisma.pendingUser.update({
      where: { id },
      data: { status: 'APPROVED', accessCode }
    });
    res.json({ success: true, data: { accessCode } });
  } catch (error) {
    console.error('Error approving pending user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve pending user',
      error: error.message
    });
  }
};

// Deny pending user
const denyPendingUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pending = await prisma.pendingUser.findUnique({ where: { id } });
    if (!pending) {
      return res.status(404).json({ success: false, message: 'Pending user not found' });
    }
    if (pending.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'User has already been processed' });
    }
    await prisma.pendingUser.update({
      where: { id },
      data: { status: 'DENIED' }
    });
    res.json({ success: true, message: 'User denied' });
  } catch (error) {
    console.error('Error denying pending user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deny pending user',
      error: error.message
    });
  }
};

module.exports = {
  createPendingUser,
  getPendingUsers,
  approvePendingUser,
  denyPendingUser
};

