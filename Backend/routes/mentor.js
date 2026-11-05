const express = require('express');
const db = require('../models/database');
const { authMiddleware, isMentor } = require('../middleware/auth');

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
  res.json({ success: true, data: submissions });
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
    certificate = db.insert('certificates', {
      code: makeCode(),
      userId: submission.userId,
      learnerName: submission.learnerName,
      tutorialId: submission.tutorialId,
      tutorialTitle: submission.tutorialTitle,
      issuedBy: facilitator ? facilitator.name : '',
      issuedAt: new Date().toISOString()
    });
  }

  res.json({ success: true, message: 'Project ' + status, data: { submission: updated, certificate } });
});

module.exports = router;
