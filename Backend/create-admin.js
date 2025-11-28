const bcrypt = require('bcryptjs');
const db = require('./models/database');
const User = require('./models/User');

// Create admin user
async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@youthtech.com',
      password: 'Admin@123456', // Change this password!
      role: 'admin',
      phone: '+250780000000',
      language: 'en'
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('========================');
    console.log('Email: admin@youthtech.com');
    console.log('Password: Admin@123456');
    console.log('========================');
    console.log('\n🔐 User Details:');
    console.log(JSON.stringify(adminUser, null, 2));
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
