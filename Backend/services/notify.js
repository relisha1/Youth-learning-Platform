const db = require('../models/database');

// saves a notification for one user (they see it in the bell on the website)
function notify(userId, title, message, link) {
  try {
    db.insert('notifications', {
      userId,
      title,
      message,
      link: link || '',
      read: false
    });
  } catch (error) {
    // a notification problem must never stop the real action
    console.error('Could not save notification:', error.message);
  }
}

// sends the same notification to all approved facilitators
function notifyMentors(title, message, link) {
  const mentors = db.findMany('users', { role: 'mentor' });
  mentors
    .filter(m => m.approved !== false && m.isActive !== false)
    .forEach(m => notify(m.id, title, message, link));
}

module.exports = { notify, notifyMentors };
