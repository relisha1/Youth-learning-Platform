const express = require('express');
const db = require('../models/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// every route here needs a logged in user
router.use(authMiddleware);

// GET /api/learner/progress - tutorials where the facilitator approved my project
router.get('/progress', (req, res) => {
  const done = db.findMany('submissions', { userId: req.user.id, status: 'approved' });
  res.json({ success: true, data: done });
});

// GET /api/learner/submissions - all my projects and what the facilitator said
router.get('/submissions', (req, res) => {
  const submissions = db.findMany('submissions', { userId: req.user.id });
  res.json({ success: true, data: submissions });
});

// POST /api/learner/submit/:tutorialId - send my project for a tutorial
router.post('/submit/:tutorialId', (req, res) => {
  const tutorial = db.findById('tutorials', req.params.tutorialId);
  if (!tutorial) {
    return res.status(404).json({ success: false, message: 'Tutorial not found' });
  }

  const { projectLink, notes } = req.body;
  if (!projectLink) {
    return res.status(400).json({ success: false, message: 'Please add the link to your project' });
  }

  // you can send a new one only if the old one was rejected
  const old = db.findMany('submissions', { userId: req.user.id, tutorialId: tutorial.id });
  const blocking = old.find(s => s.status === 'pending' || s.status === 'approved');
  if (blocking) {
    const msg = blocking.status === 'pending'
      ? 'Your project is still waiting for the facilitator'
      : 'Your project was already approved';
    return res.status(400).json({ success: false, message: msg });
  }

  const user = db.findById('users', req.user.id);
  const submission = db.insert('submissions', {
    userId: req.user.id,
    learnerName: user ? user.name : '',
    tutorialId: tutorial.id,
    tutorialTitle: tutorial.title,
    projectLink,
    notes: notes || '',
    status: 'pending',
    feedback: ''
  });

  res.status(201).json({ success: true, message: 'Project sent to the facilitator', data: submission });
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

  // some jobs need at least one certificate
  if (job.requiresCertificate) {
    const myCertificates = db.findMany('certificates', { userId: req.user.id });
    if (myCertificates.length === 0) {
      return res.status(400).json({ success: false, message: 'This job needs at least one certificate' });
    }
  }

  // the deadline is a date like 2026-12-31
  if (job.deadline && new Date(job.deadline + 'T23:59:59') < new Date()) {
    return res.status(400).json({ success: false, message: 'The deadline for this job has passed' });
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
