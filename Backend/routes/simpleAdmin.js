const express = require('express');
const db = require('../models/database');

const router = express.Router();

// Simple, unauthenticated HTML page that lists users (dev helper)
router.get('/', (req, res) => {
  try {
    const users = db.getAll('users') || [];
    let rows = users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${u.name || ''}</td>
        <td>${u.email || ''}</td>
        <td>${u.role || ''}</td>
        <td>${u.isActive ? 'Active' : 'Inactive'}</td>
      </tr>
    `).join('\n');

    const html = `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Simple Admin - Users</title>
      <style>body{font-family:Arial,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px}th{background:#f4f4f4}</style>
    </head>
    <body>
      <h1>Users (${users.length})</h1>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>`;
    res.send(html);
  } catch (err) {
    res.status(500).send('Error generating page');
  }
});

module.exports = router;
