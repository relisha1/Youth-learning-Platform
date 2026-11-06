const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../models/database');
const rateLimit = require('../middleware/rateLimit');
const { authMiddleware } = require('../middleware/auth');
const { emailIsOn, sendEmail } = require('../services/messenger');

const router = express.Router();

// 5 reset requests every 15 minutes from the same address
const resetLimit = rateLimit(5, 15);

// the token we email is random, in the database we only keep its hash
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// the address of the website, used to build the links in the emails
function siteUrl(req) {
  return process.env.CLIENT_URL || req.protocol + '://' + req.get('host');
}

// send a link by email. Without email keys the link is only printed in the server window
async function sendLink(email, subject, text, link) {
  if (!emailIsOn()) {
    console.log('[email is off] ' + subject + ' -> ' + email + ' : ' + link);
    return;
  }
  try {
    await sendEmail(email, subject, text + '\n\n' + link);
  } catch (err) {
    console.error('Could not send email:', err.message);
  }
}

// make a verification token for a user and email it
async function sendVerification(req, user) {
  // without email keys nobody can receive the link, so there is nothing to confirm
  if (!emailIsOn()) {
    db.update('users', user.id, { emailVerified: true });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  db.update('users', user.id, { emailVerified: false, verifyHash: hashToken(token) });
  await sendLink(
    user.email,
    'Confirm your email - Youth Tech Hub',
    'Hi ' + user.name + ', please confirm your email address:',
    siteUrl(req) + '/verify-email?token=' + token
  );
}

// POST /api/account/forgot - ask for a reset link
router.post('/forgot', resetLimit, async (req, res) => {
  const email = String(req.body.email || '').trim();
  const user = email ? db.findOne('users', { email }) : null;

  if (user && user.isActive !== false) {
    const token = crypto.randomBytes(32).toString('hex');
    // the link works for one hour
    db.update('users', user.id, {
      resetHash: hashToken(token),
      resetExpires: Date.now() + 60 * 60 * 1000
    });
    await sendLink(
      user.email,
      'Reset your password - Youth Tech Hub',
      'Hi ' + user.name + ', use this link to choose a new password. It works for one hour.',
      siteUrl(req) + '/reset-password?token=' + token
    );
  }

  // same answer if the email exists or not, so nobody can test who has an account
  res.json({ success: true, message: 'If this email has an account, a reset link was sent.' });
});

// POST /api/account/reset - choose a new password with the link
router.post('/reset', resetLimit, async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  const user = db.findOne('users', { resetHash: hashToken(String(token)) });
  if (!user || !user.resetExpires || user.resetExpires < Date.now()) {
    return res.status(400).json({ success: false, message: 'This link is not valid anymore. Ask for a new one.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  db.update('users', user.id, { password: hashed, resetHash: '', resetExpires: 0 });
  res.json({ success: true, message: 'Password changed. You can login now.' });
});

// POST /api/account/verify - confirm my email with the link
router.post('/verify', (req, res) => {
  const token = String(req.body.token || '');
  const user = token ? db.findOne('users', { verifyHash: hashToken(token) }) : null;
  if (!user) {
    return res.status(400).json({ success: false, message: 'This link is not valid' });
  }
  db.update('users', user.id, { emailVerified: true, verifyHash: '' });
  res.json({ success: true, message: 'Email confirmed. Thank you!' });
});

// POST /api/account/resend - send the confirmation link again
router.post('/resend', authMiddleware, async (req, res) => {
  const user = db.findById('users', req.user.id);
  if (user.emailVerified !== false) {
    return res.json({ success: true, message: 'Your email is already confirmed' });
  }
  await sendVerification(req, user);
  res.json({ success: true, message: 'We sent you a new link' });
});

module.exports = router;
module.exports.sendVerification = sendVerification;
