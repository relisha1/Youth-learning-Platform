// Sends real SMS (Africa's Talking) and email (Resend) messages.
// Both are optional. If the keys are not in the .env file nothing is sent
// and the app still works with the notifications inside the website.

// +250788123456, 0788123456 and 250788123456 all become +250788123456
function fixPhone(phone) {
  if (!phone) return null;
  let number = String(phone).replace(/[\s\-()]/g, '');
  if (number.startsWith('00')) number = '+' + number.slice(2);
  else if (number.startsWith('0')) number = '+250' + number.slice(1);
  else if (number.startsWith('250')) number = '+' + number;
  return /^\+\d{9,15}$/.test(number) ? number : null;
}

function smsIsOn() {
  return Boolean(process.env.AT_USERNAME && process.env.AT_API_KEY);
}

function emailIsOn() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

async function sendSms(phone, text) {
  const to = fixPhone(phone);
  if (!smsIsOn() || !to) return;

  const baseUrl = process.env.AT_BASE_URL || 'https://api.africastalking.com';
  const body = new URLSearchParams({
    username: process.env.AT_USERNAME,
    to,
    message: text.slice(0, 300)
  });
  if (process.env.AT_SENDER_ID) body.append('from', process.env.AT_SENDER_ID);

  const response = await fetch(baseUrl + '/version1/messaging', {
    method: 'POST',
    headers: {
      apiKey: process.env.AT_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    },
    body
  });
  if (!response.ok) {
    throw new Error('SMS service answered ' + response.status);
  }
}

async function sendEmail(email, subject, text) {
  if (!emailIsOn() || !email) return;

  const baseUrl = process.env.RESEND_BASE_URL || 'https://api.resend.com';
  const response = await fetch(baseUrl + '/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject,
      text
    })
  });
  if (!response.ok) {
    throw new Error('Email service answered ' + response.status);
  }
}

module.exports = { fixPhone, smsIsOn, emailIsOn, sendSms, sendEmail };
