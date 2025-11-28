const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('JWT_SECRET present at startup:', !!process.env.JWT_SECRET);

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const devRoutes = require('./routes/dev');
const db = require('./models/database');

const app = express();

app.use(cors());
app.use(express.json());

// --- Development: only create default admin if no users exist, don't reset ---
if (process.env.NODE_ENV !== 'production') {
  try {
    const data = db.readData() || {};
    const defaultAdmin = {
      name: 'Local Admin',
      email: 'admin@local.test',
      password: bcrypt.hashSync('admin1234', 10),
      role: 'admin',
      phone: '',
      language: 'en',
      skills: [],
      interests: [],
      bio: '',
      profileImage: '',
      isActive: true,
      id: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Only create default admin if no users exist
    if (!data.users || data.users.length === 0) {
      data.users = [defaultAdmin];
      db.writeData(data);
      console.log('Created default admin (admin@local.test)');
    } else {
      console.log('Using existing users from database');
    }

    // Create a dev admin token file to make it easy to paste into localStorage
    if (process.env.JWT_SECRET) {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: defaultAdmin.id, email: defaultAdmin.email, role: defaultAdmin.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const tokenPath = path.join(__dirname, 'dev_admin_token.txt');
      try {
        fs.writeFileSync(tokenPath, token, { encoding: 'utf8' });
        console.log('Wrote dev admin token to', tokenPath);
      } catch (err) {
        console.error('Could not write dev admin token file:', err && err.stack ? err.stack : err);
      }
    }
  } catch (err) {
    console.error('Error resetting users for dev:', err && err.stack ? err.stack : err);
  }
}

app.get('/', (req, res) => res.json({ success: true, message: 'Youth Tech Hub API', version: '1.0.0' }));

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/dev', devRoutes);

app.get('/health', (req, res) => res.json({ success: true, message: 'ok' }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error('Server error:', err && err.stack ? err.stack : err);
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

module.exports = app;