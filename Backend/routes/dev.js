const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../models/database');

const router = express.Router();

// Development helper: return a JWT for a local admin user so beginners can test admin flows.
// This endpoint is only available when NODE_ENV !== 'production'.
router.get('/admin-token', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Not available in production' });
  }

  const users = db.getAll('users') || [];
  const admin = users.find(u => u.role === 'admin');
  if (!admin) return res.status(404).json({ success: false, message: 'No admin user found in DB' });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return res.status(500).json({ success: false, message: 'JWT secret not configured' });

  try {
    const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, jwtSecret, { expiresIn: '7d' });
    return res.json({ success: true, data: { token, user: { id: admin.id, email: admin.email, role: admin.role } } });
  } catch (err) {
    console.error('Error creating dev admin token:', err);
    return res.status(500).json({ success: false, message: 'Could not create token' });
  }
});

module.exports = router;
