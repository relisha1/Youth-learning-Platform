const jwt = require('jsonwebtoken');

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

const isMentor = (req, res, next) => {
  if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Mentor only.' });
  }
  next();
};

// partners are the employers
const isPartner = (req, res, next) => {
  if (req.user.role !== 'partner' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Partner only.' });
  }
  next();
};

module.exports = {
  authMiddleware,
  isAdmin,
  isMentor,
  isPartner
};
