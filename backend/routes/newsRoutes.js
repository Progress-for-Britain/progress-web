const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  toggleReaction,
  getPostReactions
} = require('../controllers/newsController');
const {
  authenticateToken,
  requireAdmin,
  requireWriterOrAdmin
} = require('../middleware/auth');

// Public routes (published posts only)
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.get('/:id/reactions', getPostReactions);

// Protected routes - require authentication
router.use(authenticateToken);

// User reactions
router.post('/:id/reactions', toggleReaction);

// Writer/Admin routes for managing posts
router.post('/', requireWriterOrAdmin, createPost);
router.get('/author/my-posts', getMyPosts);
router.put('/:id', updatePost); // Author or admin check is done in controller
router.delete('/:id', deletePost); // Author or admin check is done in controller

module.exports = router;
