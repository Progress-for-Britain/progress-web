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

// Helper: does user have any of the roles
const userHasAnyRole = (user, roles = []) => {
  if (!user) return false;
  const single = user.role;
  const multi = Array.isArray(user.roles) ? user.roles : [];
  return roles.some(r => single === r || multi.includes(r));
};

// Middleware for admin only routes
const requireAdmin = (req, res, next) => {
  if (!userHasAnyRole(req.user, ['ADMIN'])) {
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
  if (!userHasAnyRole(req.user, ['ADMIN']) && req.user.userId !== id) {
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
  if (!userHasAnyRole(req.user, ['ADMIN']) && req.user.userId !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own payments.'
    });
  }
  next();
};

// Middleware for writer or admin access (for creating posts)
const requireWriterOrAdmin = (req, res, next) => {
  if (!userHasAnyRole(req.user, ['ADMIN', 'WRITER'])) {
    return res.status(403).json({
      success: false,
      message: 'Writer or Admin access required'
    });
  }
  next();
};

// Middleware for checking specific roles
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!userHasAnyRole(req.user, allowedRoles)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnerOrAdmin,
  requireUserOrAdmin,
  requireWriterOrAdmin,
  requireRole
};
