const db = require('../models/database');

// turns two numbers into a percent like 62 (or 0 when there is nothing to divide)
function percent(part, total) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

// how many different people are in a list of records
function countPeople(records) {
  return new Set(records.map(r => r.userId)).size;
}

// the Monday of the week of a date, as text like 2026-11-02
function weekStart(date) {
  const d = new Date(date);
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

// all the numbers for the pilot report
function buildReport() {
  const users = db.getAll('users');
  const submissions = db.getAll('submissions');
  const certificates = db.getAll('certificates');
  const jobs = db.getAll('internships');
  const applications = db.getAll('applications');
  const mentorships = db.getAll('mentorships');
  const tutorials = db.getAll('tutorials');

  const learners = users.filter(u => u.role === 'student');
  const approvedSubs = submissions.filter(s => s.status === 'approved');
  const rejectedSubs = submissions.filter(s => s.status === 'rejected');
  const pendingSubs = submissions.filter(s => s.status === 'pending');

  // how many days the facilitators take to check a project
  const checked = submissions.filter(s => s.checkedAt);
  let totalDays = 0;
  checked.forEach(s => {
    totalDays += (new Date(s.checkedAt) - new Date(s.createdAt)) / (1000 * 60 * 60 * 24);
  });

  // accepted means the employer said yes, hired means the learner really got the job
  const acceptedApps = applications.filter(a => a.status === 'accepted' || a.status === 'hired');
  // only hires that the learner confirmed are counted
  const hiredApps = applications.filter(a => a.status === 'hired' && a.hireConfirmed === true);
  const hiredWaiting = applications.filter(a => a.status === 'hired' && a.hireConfirmed !== true);
  const rated = applications.filter(a => a.feedback && a.feedback.rating);
  const ratingTotal = rated.reduce((sum, a) => sum + a.feedback.rating, 0);
  const certifiedIds = new Set(certificates.map(c => c.userId));
  const applicantsWithCertificate = new Set(
    applications.filter(a => certifiedIds.has(a.userId)).map(a => a.userId)
  ).size;

  const report = {
    generatedAt: new Date().toISOString(),
    people: {
      learners: learners.length,
      learnersWhoSentAProject: countPeople(submissions),
      learnersWithCertificate: certifiedIds.size,
      facilitators: users.filter(u => u.role === 'mentor' && u.approved !== false).length,
      employers: users.filter(u => u.role === 'partner' && u.approved !== false).length,
      waitingForApproval: users.filter(u => u.approved === false).length
    },
    projects: {
      sent: submissions.length,
      waiting: pendingSubs.length,
      approved: approvedSubs.length,
      sentBack: rejectedSubs.length,
      approvalRatePercent: percent(approvedSubs.length, approvedSubs.length + rejectedSubs.length),
      averageDaysToCheck: checked.length === 0 ? 0 : Math.round((totalDays / checked.length) * 10) / 10
    },
    certificatesIssued: certificates.length,
    jobs: {
      posted: jobs.length,
      open: jobs.filter(j => j.status !== 'closed').length,
      applications: applications.length,
      learnersWhoApplied: countPeople(applications),
      applicantsWithCertificate,
      accepted: acceptedApps.length,
      hired: hiredApps.length,
      hiredWaitingConfirmation: hiredWaiting.length,
      employerFeedbackCount: rated.length,
      employerRatingAverage: rated.length === 0 ? 0 : Math.round((ratingTotal / rated.length) * 10) / 10,
      hiredLearners: countPeople(hiredApps),
      hiredPercentOfCertified: percent(countPeople(hiredApps.filter(a => certifiedIds.has(a.userId))), certifiedIds.size),
      rejected: applications.filter(a => a.status === 'rejected').length,
      waiting: applications.filter(a => a.status === 'pending').length,
      acceptedPercent: percent(acceptedApps.length, applications.length)
    },
    mentoring: {
      requests: mentorships.length,
      accepted: mentorships.filter(m => m.status === 'accepted').length,
      declined: mentorships.filter(m => m.status === 'declined').length,
      waiting: mentorships.filter(m => m.status === 'pending').length
    }
  };

  // one line for every learning path
  report.paths = tutorials.map(t => {
    const subs = submissions.filter(s => s.tutorialId === t.id);
    return {
      title: t.title,
      sent: subs.length,
      approved: subs.filter(s => s.status === 'approved').length,
      sentBack: subs.filter(s => s.status === 'rejected').length,
      waiting: subs.filter(s => s.status === 'pending').length,
      certificates: certificates.filter(c => c.tutorialId === t.id).length
    };
  });

  // one line for every job
  report.jobList = jobs.map(j => {
    const apps = applications.filter(a => a.internshipId === j.id);
    return {
      title: j.title,
      company: j.company,
      status: j.status || 'open',
      applications: apps.length,
      accepted: apps.filter(a => a.status === 'accepted' || a.status === 'hired').length,
      hired: apps.filter(a => a.status === 'hired' && a.hireConfirmed === true).length
    };
  });

  // the last 8 weeks, to see if the pilot is growing
  const weeks = {};
  const addToWeek = (date, field) => {
    const key = weekStart(date);
    if (!weeks[key]) weeks[key] = { week: key, newLearners: 0, projectsSent: 0, certificates: 0, applications: 0 };
    weeks[key][field]++;
  };
  learners.forEach(u => addToWeek(u.createdAt, 'newLearners'));
  submissions.forEach(s => addToWeek(s.createdAt, 'projectsSent'));
  certificates.forEach(c => addToWeek(c.issuedAt || c.createdAt, 'certificates'));
  applications.forEach(a => addToWeek(a.createdAt, 'applications'));
  report.weeks = Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week)).slice(-8);

  return report;
}

// the same report as a CSV text (opens in Excel). Every line is: group, name, value
function reportToCsv(report) {
  const lines = [['Group', 'Name', 'Value']];
  const add = (group, name, value) => lines.push([group, name, value]);

  add('Report', 'Created at', report.generatedAt);
  Object.entries(report.people).forEach(([k, v]) => add('People', k, v));
  Object.entries(report.projects).forEach(([k, v]) => add('Projects', k, v));
  add('Certificates', 'issued', report.certificatesIssued);
  Object.entries(report.jobs).forEach(([k, v]) => add('Jobs', k, v));
  Object.entries(report.mentoring).forEach(([k, v]) => add('Mentoring', k, v));
  report.paths.forEach(p => {
    add('Path: ' + p.title, 'projects sent', p.sent);
    add('Path: ' + p.title, 'approved', p.approved);
    add('Path: ' + p.title, 'sent back', p.sentBack);
    add('Path: ' + p.title, 'waiting', p.waiting);
    add('Path: ' + p.title, 'certificates', p.certificates);
  });
  report.jobList.forEach(j => {
    add('Job: ' + j.title + ' (' + j.company + ')', 'applications', j.applications);
    add('Job: ' + j.title + ' (' + j.company + ')', 'accepted', j.accepted);
    add('Job: ' + j.title + ' (' + j.company + ')', 'hired', j.hired);
  });
  report.weeks.forEach(w => {
    add('Week ' + w.week, 'new learners', w.newLearners);
    add('Week ' + w.week, 'projects sent', w.projectsSent);
    add('Week ' + w.week, 'certificates', w.certificates);
    add('Week ' + w.week, 'applications', w.applications);
  });

  // put quotes around every cell so commas in names do not break the columns
  return lines.map(line => line.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n');
}

module.exports = { buildReport, reportToCsv };
