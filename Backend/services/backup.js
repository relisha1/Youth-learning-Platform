const fs = require('fs');
const path = require('path');
const db = require('../models/database');

// keep this many daily copies
const KEEP = 7;

function backupFolder() {
  return path.join(path.dirname(db.dbPath), 'backups');
}

// makes today's copy of the database (once a day) and removes the old ones
function makeBackup() {
  const folder = backupFolder();
  fs.mkdirSync(folder, { recursive: true });

  const today = new Date().toISOString().slice(0, 10);
  const file = path.join(folder, 'youth-hub-' + today + '.db');
  if (!fs.existsSync(file)) {
    db.copyTo(file);
    console.log('Backup saved:', file);
  }

  // the names have the date inside so sorting them puts the newest last
  const copies = fs.readdirSync(folder).filter(name => /^youth-hub-.*\.db$/.test(name)).sort();
  copies.slice(0, Math.max(0, copies.length - KEEP)).forEach(name => {
    fs.unlinkSync(path.join(folder, name));
  });
  return file;
}

// one copy now and then one every day while the server is running
function startBackups() {
  try {
    makeBackup();
  } catch (err) {
    console.error('Backup failed:', err.message);
  }
  const timer = setInterval(() => {
    try {
      makeBackup();
    } catch (err) {
      console.error('Backup failed:', err.message);
    }
  }, 24 * 60 * 60 * 1000);
  timer.unref();
}

module.exports = { makeBackup, startBackups };
