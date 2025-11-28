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
    const tutorial = db.findById('tutorials', Number(req.params.id));
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
    const internships = db.getAll('internships');
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
    const internship = db.findById('internships', Number(req.params.id));
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
    const data = db.readData();
    res.json({
      success: true,
      data: {
        totalUsers: data.users ? data.users.length : 0,
        totalTutorials: data.tutorials ? data.tutorials.length : 0,
        totalInternships: data.internships ? data.internships.length : 0,
        totalApplications: data.applications ? data.applications.length : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
