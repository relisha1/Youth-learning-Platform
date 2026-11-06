const fs = require('fs');
const path = require('path');

// SQLite is built into Node 22.13 and newer, so there is no package to install
let DatabaseSync;
try {
  DatabaseSync = require('node:sqlite').DatabaseSync;
} catch (error) {
  console.error('This app needs Node.js 22.13 or newer (it uses the built in SQLite).');
  console.error('Your version is ' + process.version + '. Please update Node.js from https://nodejs.org');
  process.exit(1);
}

// all the tables the app uses
const TABLES = [
  'users', 'tutorials', 'mentorships', 'internships', 'applications',
  'progress', 'certificates', 'submissions', 'notifications'
];

// every table has an id and the rest of the record saved as text (JSON)
class Database {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.initDatabase();
  }

  initDatabase() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const isNew = !fs.existsSync(this.dbPath);
    this.db = new DatabaseSync(this.dbPath);
    this.db.exec('PRAGMA journal_mode = WAL');

    TABLES.forEach(table => {
      this.db.exec(
        `CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL)`
      );
    });

    if (isNew) {
      console.log('Database created at', this.dbPath);
      this.importOldJson();
    }
    this.addSampleData();
  }

  // if the old database.json is next to the new file, copy its data in once
  importOldJson() {
    const oldPath = path.join(path.dirname(this.dbPath), 'database.json');
    if (!fs.existsSync(oldPath)) return;

    try {
      const old = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
      TABLES.forEach(table => {
        (old[table] || []).forEach(record => this.insert(table, record));
      });
      console.log('Copied the data from the old database.json');
    } catch (error) {
      console.error('Could not read the old database.json:', error.message);
    }
  }

  // tutorials and jobs to start with, only when there are none
  addSampleData() {
    const samplePath = path.join(__dirname, '../data/sample-data.json');
    if (!fs.existsSync(samplePath)) return;

    const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
    ['tutorials', 'internships'].forEach(table => {
      if (this.count(table) === 0) {
        (sample[table] || []).forEach(record => this.insert(table, record));
      }
    });
  }

  checkTable(table) {
    if (!TABLES.includes(table)) {
      throw new Error('Unknown table: ' + table);
    }
  }

  // turns a row from the table back into a normal object
  toObject(row) {
    return { ...JSON.parse(row.data), id: row.id };
  }

  getAll(table) {
    this.checkTable(table);
    const rows = this.db.prepare(`SELECT id, data FROM ${table} ORDER BY id`).all();
    return rows.map(row => this.toObject(row));
  }

  // ids are numbers, but they can come from the URL as text
  findById(table, id) {
    this.checkTable(table);
    const number = Number(id);
    if (!Number.isInteger(number)) return undefined;

    const row = this.db.prepare(`SELECT id, data FROM ${table} WHERE id = ?`).get(number);
    return row ? this.toObject(row) : undefined;
  }

  findOne(table, criteria) {
    return this.getAll(table).find(item => {
      return Object.keys(criteria).every(key => item[key] === criteria[key]);
    });
  }

  findMany(table, criteria) {
    return this.getAll(table).filter(item => {
      return Object.keys(criteria).every(key => item[key] === criteria[key]);
    });
  }

  insert(table, record) {
    this.checkTable(table);

    const { id, ...rest } = record;
    // the date field is filled in here so every record has it
    if (!rest.createdAt) rest.createdAt = new Date().toISOString();

    let newId;
    if (id) {
      this.db.prepare(`INSERT INTO ${table} (id, data) VALUES (?, ?)`).run(Number(id), JSON.stringify(rest));
      newId = Number(id);
    } else {
      const result = this.db.prepare(`INSERT INTO ${table} (data) VALUES (?)`).run(JSON.stringify(rest));
      newId = Number(result.lastInsertRowid);
    }

    return { ...rest, id: newId };
  }

  update(table, id, updates) {
    const item = this.findById(table, id);
    if (!item) return null;

    const { id: itemId, ...rest } = { ...item, ...updates };
    this.db.prepare(`UPDATE ${table} SET data = ? WHERE id = ?`).run(JSON.stringify(rest), item.id);
    return { ...rest, id: item.id };
  }

  delete(table, id) {
    this.checkTable(table);
    const result = this.db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(Number(id));
    return result.changes > 0;
  }

  count(table, criteria = {}) {
    this.checkTable(table);
    if (Object.keys(criteria).length === 0) {
      return this.db.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get().total;
    }
    return this.findMany(table, criteria).length;
  }
}

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '../data/youth-hub.db');
const db = new Database(dbPath);

module.exports = db;
