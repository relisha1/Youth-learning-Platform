const express = require('express');
const db = require('../models/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// GET /api/notifications - my notifications, newest first
router.get('/', (req, res) => {
  const mine = db.findMany('notifications', { userId: req.user.id });
  const list = mine.reverse().slice(0, 50);
  const unread = mine.filter(n => !n.read).length;
  res.json({ success: true, data: list, unread });
});

// PUT /api/notifications/read - mark all as read
router.put('/read', (req, res) => {
  const mine = db.findMany('notifications', { userId: req.user.id, read: false });
  mine.forEach(n => db.update('notifications', n.id, { read: true }));
  res.json({ success: true, message: 'All marked as read' });
});

module.exports = router;
