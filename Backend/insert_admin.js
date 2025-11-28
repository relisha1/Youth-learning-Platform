const db = require('./models/database');
const bcrypt = require('bcryptjs');

try {
  const data = db.readData();
  const maxId = data && data.users ? data.users.reduce((m,u)=>Math.max(m,Number(u.id)||0),0) : 0;
  const user = {
    name: 'Auto Admin',
    email: 'auto.admin@test.local',
    password: bcrypt.hashSync('admin1234',10),
    role: 'admin',
    phone: '',
    language: 'en',
    skills: [],
    interests: [],
    bio: '',
    profileImage: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    id: (maxId + 1).toString()
  };

  const inserted = db.insert('users', user);
  console.log('Inserted user:', inserted.email, 'id=', inserted.id);
} catch (err) {
  console.error('Error inserting admin:', err);
  process.exit(1);
}
