const express = require('express');
const db = require('../models/database');
const { authMiddleware } = require('../middleware/auth');
const { notify } = require('../services/notify');

const router = express.Router();

router.use(authMiddleware);

// finds the mentoring and checks that I am the student or the facilitator in it
const getMentoring = (req, res) => {
  const mentoring = db.findById('mentorships', req.params.id);
  const mine = mentoring && (String(mentoring.studentId) === String(req.user.id) ||
    String(mentoring.mentorId) === String(req.user.id));
  if (!mine) {
    res.status(404).json({ success: false, message: 'Mentoring not found' });
    return null;
  }
  if (mentoring.status !== 'accepted' && mentoring.status !== 'finished') {
    res.status(400).json({ success: false, message: 'The facilitator has not accepted this yet' });
    return null;
  }
  return mentoring;
};

// GET /api/chat/:id - the mentoring and its messages
router.get('/:id', (req, res) => {
  const mentoring = getMentoring(req, res);
  if (!mentoring) return;

  const messages = db.findMany('messages', { mentorshipId: mentoring.id });
  res.json({ success: true, data: { mentoring, messages } });
});

// POST /api/chat/:id - send a message
router.post('/:id', (req, res) => {
  const mentoring = getMentoring(req, res);
  if (!mentoring) return;

  if (mentoring.status === 'finished') {
    return res.status(400).json({ success: false, message: 'This mentoring is finished' });
  }

  const text = String(req.body.text || '').trim();
  if (!text) {
    return res.status(400).json({ success: false, message: 'Write a message first' });
  }
  if (text.length > 1000) {
    return res.status(400).json({ success: false, message: 'Message is too long (1000 letters max)' });
  }

  const iAmStudent = String(mentoring.studentId) === String(req.user.id);
  const myName = iAmStudent ? mentoring.studentName : mentoring.mentorName;

  const message = db.insert('messages', {
    mentorshipId: mentoring.id,
    senderId: req.user.id,
    senderName: myName,
    text,
    createdAt: new Date().toISOString()
  });

  // tell the other person
  const otherId = iAmStudent ? mentoring.mentorId : mentoring.studentId;
  notify(otherId, 'New message', myName + ' sent you a message', '/chat/' + mentoring.id);

  res.status(201).json({ success: true, data: message });
});

// PUT /api/chat/:id/finish - the facilitator ends the mentoring
router.put('/:id/finish', (req, res) => {
  const mentoring = getMentoring(req, res);
  if (!mentoring) return;

  if (String(mentoring.mentorId) !== String(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Only the facilitator can finish a mentoring' });
  }

  const updated = db.update('mentorships', mentoring.id, { status: 'finished' });
  notify(mentoring.studentId, 'Mentoring finished', mentoring.mentorName + ' finished your mentoring', '/chat/' + mentoring.id);
  res.json({ success: true, data: updated });
});

module.exports = router;
