const express = require('express');
const db = require('../models/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// every route here needs a logged in user
router.use(authMiddleware);

// makes a short code like SB-4F9A2C
function makeCode() {
  const letters = Math.random().toString(16).substring(2, 8).toUpperCase();
  return 'SB-' + letters;
}

// GET /api/learner/progress - the tutorials this user finished
router.get('/progress', (req, res) => {
  const progress = db.findMany('progress', { userId: req.user.id });
  res.json({ success: true, data: progress });
});

// POST /api/learner/complete/:tutorialId - mark a tutorial as done and give a certificate
router.post('/complete/:tutorialId', (req, res) => {
  const tutorial = db.findById('tutorials', req.params.tutorialId);
  if (!tutorial) {
    return res.status(404).json({ success: false, message: 'Tutorial not found' });
  }

  // already finished before?
  const old = db.findOne('progress', { userId: req.user.id, tutorialId: tutorial.id });
  if (old) {
    return res.status(400).json({ success: false, message: 'You already finished this tutorial' });
  }

  const user = db.findById('users', req.user.id);

  db.insert('progress', {
    userId: req.user.id,
    tutorialId: tutorial.id,
    completedAt: new Date().toISOString()
  });

  const certificate = db.insert('certificates', {
    code: makeCode(),
    userId: req.user.id,
    learnerName: user ? user.name : '',
    tutorialId: tutorial.id,
    tutorialTitle: tutorial.title,
    issuedAt: new Date().toISOString()
  });

  res.status(201).json({ success: true, message: 'Tutorial completed', data: certificate });
});

// GET /api/learner/certificates - my certificates
router.get('/certificates', (req, res) => {
  const certificates = db.findMany('certificates', { userId: req.user.id });
  res.json({ success: true, data: certificates });
});

// POST /api/learner/apply/:jobId - apply for a job
router.post('/apply/:jobId', (req, res) => {
  const job = db.findById('internships', req.params.jobId);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }
  if (job.status === 'closed') {
    return res.status(400).json({ success: false, message: 'This job is closed' });
  }

  const old = db.findOne('applications', { userId: req.user.id, internshipId: job.id });
  if (old) {
    return res.status(400).json({ success: false, message: 'You already applied for this job' });
  }

  const user = db.findById('users', req.user.id);
  const application = db.insert('applications', {
    userId: req.user.id,
    learnerName: user ? user.name : '',
    internshipId: job.id,
    message: req.body.message || '',
    status: 'pending'
  });

  db.update('internships', job.id, { applicants: (job.applicants || 0) + 1 });

  res.status(201).json({ success: true, message: 'Application sent', data: application });
});

// GET /api/learner/applications - jobs I applied for
router.get('/applications', (req, res) => {
  const applications = db.findMany('applications', { userId: req.user.id });
  // add the job title to each one so the page can show it
  const list = applications.map(a => {
    const job = db.findById('internships', a.internshipId);
    return { ...a, jobTitle: job ? job.title : '', company: job ? job.company : '' };
  });
  res.json({ success: true, data: list });
});

module.exports = router;
