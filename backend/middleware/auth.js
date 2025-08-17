const jwt = require('jsonwebtoken');

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Middleware for admin only routes
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Middleware for owner or admin access
const requireOwnerOrAdmin = (req, res, next) => {
  const { id } = req.params;
  if (req.user.role !== 'ADMIN' && req.user.userId !== id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own data.'
    });
  }
  next();
};

// Middleware for user access (own payments) or admin
const requireUserOrAdmin = (req, res, next) => {
  const { userId } = req.params;
  if (req.user.role !== 'ADMIN' && req.user.userId !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own payments.'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnerOrAdmin,
  requireUserOrAdmin
};
