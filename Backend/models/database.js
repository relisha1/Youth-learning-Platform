const fs = require('fs');
const path = require('path');

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
      const initialData = {
        users: [],
        tutorials: [],
        mentorships: [],
        internships: [],
        applications: [],
        progress: []
      };
      this.writeData(initialData);
      console.log('Database initialized at', this.dbPath);
    }
  }

  readData() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
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

  findById(table, id) {
    const data = this.readData();
    if (!data) return null;
    return data[table].find(item => item.id === id);
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

    data[table].push(record);
    this.writeData(data);
    return record;
  }

  update(table, id, updates) {
    const data = this.readData();
    if (!data) return null;

    const item = data[table].find(i => i.id === id);
    if (!item) return null;

    Object.assign(item, updates);
    this.writeData(data);
    return item;
  }

  delete(table, id) {
    const data = this.readData();
    if (!data) return false;

    const index = data[table].findIndex(i => i.id === id);
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

const dbPath = path.join(__dirname, '../data/database.json');
const db = new Database(dbPath);

module.exports = db;
