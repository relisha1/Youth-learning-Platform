const express = require('express');
const db = require('../models/database');
const { authMiddleware, isPartner } = require('../middleware/auth');
const { notify } = require('../services/notify');

const router = express.Router();

// only employers (partners) and admins can use these
router.use(authMiddleware, isPartner);

// check that this job belongs to the logged in partner
function getMyJob(req) {
  const job = db.findById('internships', req.params.id);
  if (!job) return null;
  if (req.user.role !== 'admin' && String(job.postedBy) !== String(req.user.id)) return null;
  return job;
}

// GET /api/partner/profile - my company info
router.get('/profile', (req, res) => {
  const user = db.findById('users', req.user.id);
  res.json({
    success: true,
    data: {
      companyName: user.companyName || '',
      website: user.website || '',
      about: user.about || ''
    }
  });
});

// PUT /api/partner/profile - save my company info
router.put('/profile', (req, res) => {
  const updates = {};
  ['companyName', 'website', 'about'].forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });
  db.update('users', req.user.id, updates);
  res.json({ success: true, message: 'Company info saved', data: updates });
});

// GET /api/partner/jobs - jobs I posted
router.get('/jobs', (req, res) => {
  const jobs = db.findMany('internships', { postedBy: req.user.id });
  res.json({ success: true, data: jobs });
});

// POST /api/partner/jobs - post a new job
router.post('/jobs', (req, res) => {
  const me = db.findById('users', req.user.id);
  const { title, description, location, type, deadline, skills, requiresCertificate } = req.body;
  // if no company name is typed we use the one from my company info
  const company = req.body.company || me.companyName;

  if (!title || !company || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title, company and description are required'
    });
  }

  const job = db.insert('internships', {
    title,
    company,
    description,
    location: location || 'Kigali',
    type: type || 'internship',
    skills: skills || '',
    deadline: deadline || '',
    contactEmail: req.body.contactEmail || me.email,
    requiresCertificate: requiresCertificate === true,
    status: 'open',
    applicants: 0,
    postedBy: req.user.id
  });

  res.status(201).json({ success: true, message: 'Job posted', data: job });
});

// PUT /api/partner/jobs/:id - change a job or close it
router.put('/jobs/:id', (req, res) => {
  const job = getMyJob(req);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  // only these fields can be changed
  const updates = {};
  ['title', 'company', 'description', 'location', 'type', 'status', 'skills', 'deadline', 'contactEmail', 'requiresCertificate'].forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const updated = db.update('internships', job.id, updates);
  res.json({ success: true, message: 'Job updated', data: updated });
});

// DELETE /api/partner/jobs/:id
router.delete('/jobs/:id', (req, res) => {
  const job = getMyJob(req);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }
  db.delete('internships', job.id);
  res.json({ success: true, message: 'Job deleted' });
});

// GET /api/partner/applications - applications for all my jobs, newest first
router.get('/applications', (req, res) => {
  const myJobs = db.findMany('internships', { postedBy: req.user.id });
  const list = [];

  myJobs.forEach(job => {
    db.findMany('applications', { internshipId: job.id }).forEach(a => {
      const certificates = db.findMany('certificates', { userId: a.userId });
      list.push({ ...a, jobTitle: job.title, certificates });
    });
  });

  list.sort((a, b) => b.id - a.id);
  res.json({ success: true, data: list });
});

// GET /api/partner/jobs/:id/applicants - people who applied, with their certificates
router.get('/jobs/:id/applicants', (req, res) => {
  const job = getMyJob(req);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  const applications = db.findMany('applications', { internshipId: job.id });
  const list = applications.map(a => {
    const certificates = db.findMany('certificates', { userId: a.userId });
    return { ...a, certificates };
  });

  res.json({ success: true, data: list });
});

// PUT /api/partner/applications/:id - accept or reject an applicant
router.put('/applications/:id', (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'accepted', 'rejected'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be pending, accepted or rejected' });
  }

  const application = db.findById('applications', req.params.id);
  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  // the job must be one of mine
  const job = db.findById('internships', application.internshipId);
  if (!job || (req.user.role !== 'admin' && String(job.postedBy) !== String(req.user.id))) {
    return res.status(403).json({ success: false, message: 'This is not your job' });
  }

  const updated = db.update('applications', application.id, { status });
  if (status === 'accepted' || status === 'rejected') {
    notify(application.userId, 'Job application ' + status, 'Your application for ' + job.title + ' at ' + job.company + ' was ' + status, '/my-certificates', true);
  }
  res.json({ success: true, message: 'Application updated', data: updated });
});

// GET /api/partner/learners - learners who have certificates (the talent list)
router.get('/learners', (req, res) => {
  const certificates = db.getAll('certificates');
  const learners = {};

  certificates.forEach(c => {
    if (!learners[c.userId]) {
      learners[c.userId] = { id: c.userId, name: c.learnerName, certificates: [] };
    }
    learners[c.userId].certificates.push({ code: c.code, tutorialTitle: c.tutorialTitle, issuedAt: c.issuedAt });
  });

  res.json({ success: true, data: Object.values(learners) });
});

module.exports = router;
