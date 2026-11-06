const express = require('express');
const db = require('../models/database');
const { authMiddleware, isMentor } = require('../middleware/auth');
const { notify } = require('../services/notify');

const router = express.Router();

// only approved facilitators (mentors) and admins
router.use(authMiddleware, isMentor);

// makes a short code like SB-4F9A2C
function makeCode() {
  const letters = Math.random().toString(16).substring(2, 8).toUpperCase();
  return 'SB-' + letters;
}

// GET /api/mentor/submissions?status=pending - projects to check
router.get('/submissions', (req, res) => {
  let submissions = db.getAll('submissions');
  if (req.query.status) {
    submissions = submissions.filter(s => s.status === req.query.status);
  }
  // add the checklist of the tutorial so the facilitator can see what to look for
  const list = submissions.map(s => {
    const tutorial = db.findById('tutorials', s.tutorialId);
    return { ...s, rubric: tutorial && tutorial.rubric ? tutorial.rubric : [], projectBrief: tutorial ? tutorial.projectBrief : '' };
  });
  res.json({ success: true, data: list });
});

// PUT /api/mentor/submissions/:id - approve or reject a project
router.put('/submissions/:id', (req, res) => {
  const { status, feedback } = req.body;

  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
  }
  if (status === 'rejected' && !feedback) {
    return res.status(400).json({ success: false, message: 'Please tell the learner what to fix' });
  }

  const submission = db.findById('submissions', req.params.id);
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }
  if (submission.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'This project was already checked' });
  }

  const facilitator = db.findById('users', req.user.id);
  const updated = db.update('submissions', submission.id, {
    status,
    feedback: feedback || '',
    checkedBy: req.user.id,
    checkedAt: new Date().toISOString()
  });

  // the certificate is only made here, after the facilitator says yes
  let certificate = null;
  if (status === 'approved') {
    const tutorial = db.findById('tutorials', submission.tutorialId);
    certificate = db.insert('certificates', {
      code: makeCode(),
      userId: submission.userId,
      learnerName: submission.learnerName,
      tutorialId: submission.tutorialId,
      tutorialTitle: submission.tutorialTitle,
      pathName: tutorial ? (tutorial.path || tutorial.category) : '',
      skills: tutorial && tutorial.skills ? tutorial.skills : [],
      projectLink: submission.projectLink,
      issuedBy: facilitator ? facilitator.name : '',
      issuedAt: new Date().toISOString()
    });
  }

  if (status === 'approved') {
    notify(submission.userId, 'Project approved 🎉', 'Your ' + submission.tutorialTitle + ' project was approved. Your certificate code is ' + certificate.code, '/my-certificates', true);
  } else {
    notify(submission.userId, 'Project needs changes', 'The facilitator asked for changes on your ' + submission.tutorialTitle + ' project: ' + feedback, '/tutorials', true);
  }

  res.json({ success: true, message: 'Project ' + status, data: { submission: updated, certificate } });
});

// GET /api/mentor/profile - what students see about me
router.get('/profile', (req, res) => {
  const me = db.findById('users', req.user.id);
  res.json({ success: true, data: { bio: me.bio || '', skills: Array.isArray(me.skills) ? me.skills.join(', ') : (me.skills || '') } });
});

// PUT /api/mentor/profile
router.put('/profile', (req, res) => {
  const updates = {};
  ['bio', 'skills'].forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });
  db.update('users', req.user.id, updates);
  res.json({ success: true, message: 'Profile saved', data: updates });
});

// GET /api/mentor/requests - students who asked me to be their mentor
router.get('/requests', (req, res) => {
  const requests = db.findMany('mentorships', { mentorId: req.user.id });
  res.json({ success: true, data: requests });
});

// PUT /api/mentor/requests/:id - accept or decline
router.put('/requests/:id', (req, res) => {
  const { status } = req.body;
  if (status !== 'accepted' && status !== 'declined') {
    return res.status(400).json({ success: false, message: 'Status must be accepted or declined' });
  }

  const request = db.findById('mentorships', req.params.id);
  if (!request || String(request.mentorId) !== String(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }
  if (request.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'You already answered this request' });
  }

  const updated = db.update('mentorships', request.id, { status });
  const text = status === 'accepted' ? 'accepted your mentoring request' : 'could not accept your mentoring request';
  notify(request.studentId, 'Mentoring answer', request.mentorName + ' ' + text, '/find-mentor', true);
  res.json({ success: true, message: 'Request ' + status, data: updated });
});

module.exports = router;
