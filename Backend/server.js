const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const learnerRoutes = require('./routes/learner');
const partnerRoutes = require('./routes/partner');
const db = require('./models/database');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('change')) {
  console.error('JWT_SECRET is missing or too weak. Run "npm run secret" and put the result in your .env file.');
  process.exit(1);
}

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000']
}));
app.use(express.json());

// make the first admin from the .env values if there are no users yet
if (db.count('users') === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  db.insert('users', {
    name: 'Admin',
    email: process.env.ADMIN_EMAIL,
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
    role: 'admin',
    phone: '',
    language: 'en',
    skills: [],
    interests: [],
    bio: '',
    profileImage: '',
    isActive: true
  });
  console.log('First admin created for', process.env.ADMIN_EMAIL);
}

app.get('/', (req, res) => res.json({ success: true, message: 'Youth Tech Hub API', version: '1.0.0' }));
app.get('/health', (req, res) => res.json({ success: true, message: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/partner', partnerRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

module.exports = app;
