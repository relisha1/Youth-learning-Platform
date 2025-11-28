const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
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
