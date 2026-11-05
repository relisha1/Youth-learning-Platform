const jwt = require('jsonwebtoken');
const db = require('../models/database');

// check the token and put the user info on req.user
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
  next();
};

// mentors and partners can only work after an admin approved them
const isApproved = (userId) => {
  const user = db.findById('users', userId);
  return user && user.approved !== false;
};

const isMentor = (req, res, next) => {
  if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Mentor only.' });
  }
  if (req.user.role === 'mentor' && !isApproved(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Your account is waiting for admin approval.' });
  }
  next();
};

// partners are the employers
const isPartner = (req, res, next) => {
  if (req.user.role !== 'partner' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Partner only.' });
  }
  if (req.user.role === 'partner' && !isApproved(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Your account is waiting for admin approval.' });
  }
  next();
};

module.exports = {
  authMiddleware,
  isAdmin,
  isMentor,
  isPartner
};
