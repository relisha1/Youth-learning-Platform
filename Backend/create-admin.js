// run with: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=something node create-admin.js
const User = require('./models/User');

async function createAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('Set ADMIN_EMAIL and ADMIN_PASSWORD first.');
    process.exit(1);
  }

  try {
    await User.create({ name: 'Admin', email, password, role: 'admin' });
    console.log('Admin created for', email);
    process.exit(0);
  } catch (error) {
    console.log('Could not create admin:', error.message);
    process.exit(1);
  }
}

createAdminUser();
