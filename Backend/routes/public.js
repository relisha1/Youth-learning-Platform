const express = require('express');
const db = require('../models/database');

const router = express.Router();

// @route   GET /api/public/tutorials
// @desc    Get all tutorials (public access)
// @access  Public
router.get('/tutorials', (req, res) => {
  try {
    const tutorials = db.getAll('tutorials');
    res.json({
      success: true,
      data: tutorials,
      count: tutorials.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/public/tutorials/:id
// @desc    Get single tutorial by ID (public access)
// @access  Public
router.get('/tutorials/:id', (req, res) => {
  try {
    const tutorial = db.findById('tutorials', req.params.id);
    if (!tutorial) {
      return res.status(404).json({
        success: false,
        message: 'Tutorial not found'
      });
    }
    res.json({
      success: true,
      data: tutorial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/public/internships
// @desc    Get all internships (public access)
// @access  Public
router.get('/internships', (req, res) => {
  try {
    // jobs without an employer (old sample jobs) are hidden because nobody could read the applications
    const internships = db.getAll('internships').filter(job => job.postedBy);
    res.json({
      success: true,
      data: internships,
      count: internships.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/public/internships/:id
// @desc    Get single internship by ID (public access)
// @access  Public
router.get('/internships/:id', (req, res) => {
  try {
    const internship = db.findById('internships', req.params.id);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }
    res.json({
      success: true,
      data: internship
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/public/stats
// @desc    Get public statistics
// @access  Public
router.get('/stats', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        learners: db.findMany('users', { role: 'student' }).length,
        facilitators: db.findMany('users', { role: 'mentor' }).filter(u => u.approved !== false).length,
        certificates: db.count('certificates'),
        openJobs: db.getAll('internships').filter(j => j.postedBy && j.status !== 'closed').length,
        hired: db.findMany('applications', { status: 'hired' }).filter(a => a.hireConfirmed === true).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/public/verify/:code
// @desc    Check if a certificate code is real (employers use this)
// @access  Public
router.get('/verify/:code', (req, res) => {
  const certificate = db.findOne('certificates', { code: req.params.code.toUpperCase() });
  if (!certificate) {
    return res.status(404).json({ success: false, message: 'Certificate not found' });
  }
  res.json({
    success: true,
    data: {
      code: certificate.code,
      learnerName: certificate.learnerName,
      tutorialTitle: certificate.tutorialTitle,
      pathName: certificate.pathName || '',
      skills: certificate.skills || [],
      projectLink: certificate.projectLink || '',
      issuedBy: certificate.issuedBy || '',
      issuedAt: certificate.issuedAt
    }
  });
});

module.exports = router;
