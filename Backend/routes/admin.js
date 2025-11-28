const express = require('express');
const User = require('../models/User');
const db = require('../models/database');
const { authMiddleware, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware, isAdmin);

// ========== USERS MANAGEMENT ==========

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', (req, res) => {
  try {
    const users = User.getAll();
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/users/stats
// @desc    Get user statistics
// @access  Private (Admin only)
router.get('/users/stats', (req, res) => {
  try {
    const stats = User.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private (Admin only)
router.get('/users/:id', (req, res) => {
  try {
    const user = User.findById(req.params.id);
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

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    User.delete(req.params.id);
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['student', 'mentor', 'partner', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    User.update(req.params.id, { role });
    const updatedUser = User.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'User role updated',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== TUTORIALS MANAGEMENT ==========

// @route   GET /api/admin/tutorials
// @desc    Get all tutorials
// @access  Private (Admin only)
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

// @route   POST /api/admin/tutorials
// @desc    Create new tutorial
// @access  Private (Admin only)
router.post('/tutorials', (req, res) => {
  try {
    const { title, description, category, content, level, duration, image } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category'
      });
    }

    const tutorial = {
      title,
      description,
      category,
      content: content || '',
      level: level || 'beginner',
      duration: duration || 0,
      image: image || '',
      createdBy: req.user.id,
      enrolled: 0
    };

    const savedTutorial = db.insert('tutorials', tutorial);
    res.status(201).json({
      success: true,
      message: 'Tutorial created successfully',
      data: savedTutorial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/tutorials/:id
// @desc    Update tutorial
// @access  Private (Admin only)
router.put('/tutorials/:id', (req, res) => {
  try {
    const tutorial = db.findById('tutorials', req.params.id);
    if (!tutorial) {
      return res.status(404).json({
        success: false,
        message: 'Tutorial not found'
      });
    }

    db.update('tutorials', req.params.id, req.body);
    const updatedTutorial = db.findById('tutorials', req.params.id);

    res.json({
      success: true,
      message: 'Tutorial updated successfully',
      data: updatedTutorial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/admin/tutorials/:id
// @desc    Delete tutorial
// @access  Private (Admin only)
router.delete('/tutorials/:id', (req, res) => {
  try {
    db.delete('tutorials', req.params.id);
    res.json({
      success: true,
      message: 'Tutorial deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== INTERNSHIPS MANAGEMENT ==========

// @route   GET /api/admin/internships
// @desc    Get all internships
// @access  Private (Admin only)
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

// @route   POST /api/admin/internships
// @desc    Create new internship
// @access  Private (Admin only)
router.post('/internships', (req, res) => {
  try {
    const { title, company, description, requirements, duration, stipend, location } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, company, and description'
      });
    }

    const internship = {
      title,
      company,
      description,
      requirements: requirements || [],
      duration: duration || '3 months',
      stipend: stipend || 0,
      location: location || 'Remote',
      postedBy: req.user.id,
      applicants: 0,
      status: 'open'
    };

    const savedInternship = db.insert('internships', internship);
    res.status(201).json({
      success: true,
      message: 'Internship posted successfully',
      data: savedInternship
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/internships/:id
// @desc    Update internship
// @access  Private (Admin only)
router.put('/internships/:id', (req, res) => {
  try {
    const internship = db.findById('internships', req.params.id);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    db.update('internships', req.params.id, req.body);
    const updatedInternship = db.findById('internships', req.params.id);

    res.json({
      success: true,
      message: 'Internship updated successfully',
      data: updatedInternship
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/admin/internships/:id
// @desc    Delete internship
// @access  Private (Admin only)
router.delete('/internships/:id', (req, res) => {
  try {
    db.delete('internships', req.params.id);
    res.json({
      success: true,
      message: 'Internship deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== APPLICATIONS MANAGEMENT ==========

// @route   GET /api/admin/applications
// @desc    Get all applications
// @access  Private (Admin only)
router.get('/applications', (req, res) => {
  try {
    const applications = db.getAll('applications');
    res.json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/applications/:id/status
// @desc    Update application status
// @access  Private (Admin only)
router.put('/applications/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    db.update('applications', req.params.id, { status });
    const updatedApp = db.findById('applications', req.params.id);

    res.json({
      success: true,
      message: 'Application status updated',
      data: updatedApp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== DASHBOARD STATS ==========

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalUsers: db.count('users'),
      totalTutorials: db.count('tutorials'),
      totalInternships: db.count('internships'),
      totalApplications: db.count('applications'),
      usersByRole: {
        students: db.count('users', { role: 'student' }),
        mentors: db.count('users', { role: 'mentor' }),
        partners: db.count('users', { role: 'partner' }),
        admins: db.count('users', { role: 'admin' })
      },
      applicationsByStatus: {
        pending: db.count('applications', { status: 'pending' }),
        approved: db.count('applications', { status: 'approved' }),
        rejected: db.count('applications', { status: 'rejected' })
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
