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

  if (!me.website) {
    return res.status(400).json({ success: false, message: 'Add your company website in Your company before you post' });
  }

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

// finds an application and checks that it is for one of my jobs
function getMyApplication(req, res) {
  const application = db.findById('applications', req.params.id);
  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return null;
  }
  const job = db.findById('internships', application.internshipId);
  if (!job || (req.user.role !== 'admin' && String(job.postedBy) !== String(req.user.id))) {
    res.status(403).json({ success: false, message: 'This is not your job' });
    return null;
  }
  return { application, job };
}

// PUT /api/partner/applications/:id - shortlist (accepted), reject or mark as hired
router.put('/applications/:id', (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'accepted', 'rejected', 'hired'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be pending, accepted, rejected or hired' });
  }

  const found = getMyApplication(req, res);
  if (!found) return;
  const { application, job } = found;

  // a hire only counts after the learner confirms it (hireConfirmed becomes true)
  const updated = db.update('applications', application.id, { status, hireConfirmed: null });

  const chatLink = '/application-chat/' + application.id;
  if (status === 'accepted') {
    notify(application.userId, 'You were shortlisted',
      job.company + ' shortlisted you for ' + job.title + '. Open the chat to talk with them.', chatLink, true);
  } else if (status === 'rejected') {
    notify(application.userId, 'Application not selected',
      job.company + ' did not select you for ' + job.title + '. Keep going, try other jobs.', '/my-certificates', true);
  } else if (status === 'hired') {
    notify(application.userId, 'You got the job! 🎉',
      'Congratulations! ' + job.company + ' chose you for ' + job.title + '. Please confirm it on My Certificates.', '/my-certificates', true);
  }
  res.json({ success: true, message: 'Application updated', data: updated });
});

// PUT /api/partner/applications/:id/interview - write the interview date and place
router.put('/applications/:id/interview', (req, res) => {
  const found = getMyApplication(req, res);
  if (!found) return;
  const { application, job } = found;

  if (application.status !== 'accepted' && application.status !== 'hired') {
    return res.status(400).json({ success: false, message: 'Shortlist the learner first' });
  }

  const note = String(req.body.note || '').trim().slice(0, 300);
  if (!note) {
    return res.status(400).json({ success: false, message: 'Write the date, time and place first' });
  }

  const updated = db.update('applications', application.id, { interviewNote: note });
  notify(application.userId, 'Interview details',
    job.company + ' (' + job.title + '): ' + note, '/application-chat/' + application.id, true);
  res.json({ success: true, message: 'The learner was told', data: updated });
});

// POST /api/partner/applications/:id/feedback - after a confirmed hire: was the learner really ready?
router.post('/applications/:id/feedback', (req, res) => {
  const found = getMyApplication(req, res);
  if (!found) return;
  const { application } = found;

  if (application.status !== 'hired' || application.hireConfirmed !== true) {
    return res.status(400).json({ success: false, message: 'You can give feedback after the learner confirmed the job' });
  }

  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'The rating must be from 1 to 5' });
  }

  const feedback = {
    rating,
    comment: String(req.body.comment || '').trim().slice(0, 500),
    at: new Date().toISOString()
  };
  const updated = db.update('applications', application.id, { feedback });
  res.json({ success: true, message: 'Thank you for your feedback', data: updated });
});

// GET /api/partner/learners - learners who have certificates (the talent list)
router.get('/learners', (req, res) => {
  const certificates = db.getAll('certificates');
  const learners = {};

  certificates.forEach(c => {
    if (!learners[c.userId]) {
      const user = db.findById('users', c.userId);
      // the contact details stay hidden, employers use the Contact button
      learners[c.userId] = {
        id: c.userId,
        name: c.learnerName,
        bio: user && user.bio ? user.bio : '',
        skills: [],
        certificates: []
      };
    }
    const learner = learners[c.userId];
    (c.skills || []).forEach(skill => {
      if (!learner.skills.includes(skill)) learner.skills.push(skill);
    });
    learner.certificates.push({
      code: c.code,
      tutorialTitle: c.tutorialTitle,
      pathName: c.pathName || '',
      projectLink: c.projectLink || '',
      issuedAt: c.issuedAt
    });
  });

  res.json({ success: true, data: Object.values(learners) });
});

// POST /api/partner/learners/:id/contact - tell a learner that I am interested
router.post('/learners/:id/contact', (req, res) => {
  const learner = db.findById('users', req.params.id);
  if (!learner || learner.role !== 'student') {
    return res.status(404).json({ success: false, message: 'Learner not found' });
  }

  const me = db.findById('users', req.user.id);
  const text = String(req.body.message || '').trim().slice(0, 500);
  if (!text) {
    return res.status(400).json({ success: false, message: 'Write a short message first' });
  }

  const company = me.companyName || me.name;
  notify(learner.id, 'An employer is interested', company + ' wrote: ' + text + ' (reply to ' + me.email + ')', '/notifications', true);
  res.json({ success: true, message: 'Message sent to ' + learner.name });
});

module.exports = router;
