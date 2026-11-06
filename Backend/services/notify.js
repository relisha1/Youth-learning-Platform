const db = require('../models/database');
const { sendSms, sendEmail } = require('./messenger');

// saves a notification for one user (they see it in the bell on the website).
// It also sends an email, and an SMS when sms is true (we use SMS only for the important ones).
function notify(userId, title, message, link, sms) {
  try {
    db.insert('notifications', {
      userId,
      title,
      message,
      link: link || '',
      read: false
    });

    const user = db.findById('users', userId);
    if (!user) return;

    // we do not wait for these, and a failure is only written in the log
    sendEmail(user.email, title + ' - Youth Tech Hub', message + '\n\nOpen the website to see more.')
      .catch(error => console.error('Email not sent:', error.message));

    if (sms) {
      sendSms(user.phone, 'Youth Tech Hub: ' + title + '. ' + message)
        .catch(error => console.error('SMS not sent:', error.message));
    }
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
    .forEach(m => notify(m.id, title, message, link, false));
}

module.exports = { notify, notifyMentors };
