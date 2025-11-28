const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
  console.log('=== REGISTER REQUEST ===');
  console.log('Body:', req.body);
  const { name, email, password, role, phone, language } = req.body;

    // Validate input
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    console.log('Creating user...');
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      phone,
      language: language || 'en'
    });

    console.log('User created:', user);

    // Generate JWT token (ensure secret is present)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT secret missing when generating token for registration');
      return res.status(500).json({ success: false, message: 'Server configuration error: JWT secret is missing.' });
    }

    let token;
    try {
      token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        jwtSecret,
        { expiresIn: '7d' }
      );
    } catch (err) {
      console.error('Error signing JWT during registration:', err && err.message ? err.message : err);
      return res.status(500).json({ success: false, message: 'Server error while generating token.' });
    }

    console.log('Token generated');
    console.log('=== REGISTRATION SUCCESS ===');

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Generate JWT token (ensure secret is present)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT secret missing when generating token for login');
      return res.status(500).json({ success: false, message: 'Server configuration error: JWT secret is missing.' });
    }

    let token;
    try {
      token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        jwtSecret,
        { expiresIn: '7d' }
      );
    } catch (err) {
      console.error('Error signing JWT during login:', err && err.message ? err.message : err);
      return res.status(500).json({ success: false, message: 'Server error while generating token.' });
    }

    // Remove password from user object
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
  const { name, phone, bio, skills, interests, language, profileImage } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
  if (bio) updates.bio = bio;
  if (skills) updates.skills = skills;
  if (interests) updates.interests = interests;
  if (language) updates.language = language;
  if (profileImage) updates.profileImage = profileImage;

    const user = User.update(req.user.id, updates);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide old and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    await User.changePassword(req.user.id, oldPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
