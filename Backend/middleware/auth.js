const jwt = require('jsonwebtoken');
const db = require('../models/database');

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // In development, if no token is provided, auto-login the first admin user
      // to make local testing easier. This MUST NOT run in production.
      if (process.env.NODE_ENV !== 'production') {
        try {
          const users = db.getAll('users') || [];
          const admin = users.find(u => u.role === 'admin');
          if (admin) {
            req.user = { id: admin.id, email: admin.email, role: admin.role };
            return next();
          }
        } catch (e) {
          console.error('Dev auto-login failed:', e && e.stack ? e.stack : e);
        }
      }

      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT secret missing when verifying token');
      return res.status(500).json({ success: false, message: 'Server configuration error: JWT secret is missing.' });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
      next();
    } catch (err) {
      console.error('Token verification error:', err && err.message ? err.message : err);
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Invalid token.' 
    });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin only.' 
    });
  }
  next();
};

// Middleware to check if user is mentor
const isMentor = (req, res, next) => {
  if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Mentor only.' 
    });
  }
  next();
};

// Middleware to check if user is partner
const isPartner = (req, res, next) => {
  if (req.user.role !== 'partner' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Internship Partner only.' 
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  isAdmin,
  isMentor,
  isPartner
};
