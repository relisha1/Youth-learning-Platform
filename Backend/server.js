const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const learnerRoutes = require('./routes/learner');
const partnerRoutes = require('./routes/partner');
const mentorRoutes = require('./routes/mentor');
const notificationRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chat');
const accountRoutes = require('./routes/account');
const { startBackups } = require('./services/backup');
const db = require('./models/database');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('change')) {
  console.error('JWT_SECRET is missing or too weak. Run "npm run secret" and put the result in your .env file.');
  process.exit(1);
}

const app = express();

// when the website is online the backend serves it too, so CORS is only needed while developing
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);

// the host puts a proxy in front of the app, so we trust it to get the real address of the visitor
app.set('trust proxy', 1);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// make the first admin from the .env values if there are no users yet
if (db.count('users') === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  db.insert('users', {
    name: 'Admin',
    email: process.env.ADMIN_EMAIL,
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
    role: 'admin',
    phone: '',
    skills: [],
    interests: [],
    bio: '',
    profileImage: '',
    isActive: true
  });
  console.log('First admin created for', process.env.ADMIN_EMAIL);
}

app.get('/api', (req, res) => res.json({ success: true, message: 'Youth Tech Hub API', version: '1.0.0' }));
app.get('/health', (req, res) => res.json({ success: true, message: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/account', accountRoutes);

// if the website was built (Frontend/dist), serve it. Any page that is not /api opens the website.
const websiteFolder = path.join(__dirname, '../Frontend/dist');
if (fs.existsSync(websiteFolder)) {
  app.use(express.static(websiteFolder));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(websiteFolder, 'index.html'));
  });
  console.log('Serving the website from', websiteFolder);
}

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
  startBackups();
});

module.exports = app;
