const fs = require('fs');
const path = require('path');

// all the tables the app uses
const TABLES = ['users', 'tutorials', 'mentorships', 'internships', 'applications', 'progress', 'certificates', 'submissions'];

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

    if (!fs.existsSync(this.dbPath)) {
      // start from the sample tutorials and internships if the file is there
      const samplePath = path.join(__dirname, '../data/sample-data.json');
      let initialData = {};
      if (fs.existsSync(samplePath)) {
        initialData = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
      }
      TABLES.forEach(table => {
        if (!initialData[table]) initialData[table] = [];
      });
      this.writeData(initialData);
      console.log('Database created at', this.dbPath);
    }
  }

  readData() {
    try {
      const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
      // old data files may not have every table yet
      TABLES.forEach(table => {
        if (!data[table]) data[table] = [];
      });
      return data;
    } catch (error) {
      console.error('Error reading database:', error);
      return null;
    }
  }

  writeData(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing database:', error);
      return false;
    }
  }

  getAll(table) {
    const data = this.readData();
    return data ? data[table] : [];
  }

  // ids can be numbers or strings, so compare them as text
  findById(table, id) {
    const data = this.readData();
    if (!data) return null;
    return data[table].find(item => String(item.id) === String(id));
  }

  findOne(table, criteria) {
    const data = this.readData();
    if (!data) return null;
    return data[table].find(item => {
      return Object.keys(criteria).every(key => item[key] === criteria[key]);
    });
  }

  findMany(table, criteria) {
    const data = this.readData();
    if (!data) return [];
    return data[table].filter(item => {
      return Object.keys(criteria).every(key => item[key] === criteria[key]);
    });
  }

  insert(table, record) {
    const data = this.readData();
    if (!data) return null;

    if (!record.id) {
      const maxId = data[table].reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
      record.id = maxId + 1;
    }

    // the date fields are filled in here so every record has them
    if (!record.createdAt) record.createdAt = new Date().toISOString();

    data[table].push(record);
    this.writeData(data);
    return record;
  }

  update(table, id, updates) {
    const data = this.readData();
    if (!data) return null;

    const item = data[table].find(i => String(i.id) === String(id));
    if (!item) return null;

    Object.assign(item, updates);
    this.writeData(data);
    return item;
  }

  delete(table, id) {
    const data = this.readData();
    if (!data) return false;

    const index = data[table].findIndex(i => String(i.id) === String(id));
    if (index === -1) return false;

    data[table].splice(index, 1);
    this.writeData(data);
    return true;
  }

  count(table, criteria = {}) {
    const data = this.readData();
    if (!data) return 0;

    if (Object.keys(criteria).length === 0) {
      return data[table].length;
    }

    return data[table].filter(item => {
      return Object.keys(criteria).every(key => item[key] === criteria[key]);
    }).length;
  }
}

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '../data/database.json');
const db = new Database(dbPath);

module.exports = db;
