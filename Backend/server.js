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
const simpleAdminRoutes = require('./routes/simpleAdmin');
const db = require('./models/database');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', '*'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

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

// Simple fallback HTML page if React frontend is down
app.get('/fallback', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Youth Tech Hub</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    h1 { color: #333; }
    .button { display: inline-block; margin: 10px 5px 10px 0; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; border: none; cursor: pointer; font-size: 16px; }
    .button:hover { background: #764ba2; }
    .info { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background: #667eea; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Youth Tech Hub</h1>
    <p>Welcome! The React frontend may still be loading. If so, just wait and refresh.</p>
    
    <div class="info">
      <h3>Quick Links:</h3>
      <a href="http://localhost:3000" class="button">Go to Main Site (Port 3000)</a>
      <a href="http://localhost:5000/simple-admin" class="button">View Users</a>
      <a href="http://localhost:5000/health" class="button">API Health</a>
    </div>

    <div class="info">
      <h3>Test Credentials:</h3>
      <p><strong>Email:</strong> admin@local.test</p>
      <p><strong>Password:</strong> admin1234</p>
    </div>
  </div>
</body>
</html>`);
});

app.get('/', (req, res) => res.json({ success: true, message: 'Youth Tech Hub API', version: '1.0.0' }));

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/dev', devRoutes);
app.use('/simple-admin', simpleAdminRoutes);

app.get('/health', (req, res) => res.json({ success: true, message: 'ok' }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error('Server error:', err && err.stack ? err.stack : err);
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

module.exports = app;