const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser
} = require('../controllers/userController');
const {
  authenticateToken,
  requireAdmin,
  requireOwnerOrAdmin
} = require('../middleware/auth');

// Public routes
router.post('/register', createUser);
router.post('/login', loginUser);

// Protected routes
router.get('/', authenticateToken, requireAdmin, getAllUsers);
router.get('/:id', authenticateToken, requireOwnerOrAdmin, getUserById);
router.put('/:id', authenticateToken, requireOwnerOrAdmin, updateUser);
router.delete('/:id', authenticateToken, requireOwnerOrAdmin, deleteUser);

module.exports = router;
