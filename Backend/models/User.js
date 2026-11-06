const bcrypt = require('bcryptjs');
const db = require('./database.js');

// take the secret fields out before a user is sent anywhere
function clean(user) {
  if (!user) return user;
  delete user.password;
  delete user.resetHash;
  delete user.resetExpires;
  delete user.verifyHash;
  return user;
}

class User {
  static clean(user) {
    return clean(user);
  }

  // Create new user
  static async create(userData) {
    try {
      // Check if user already exists
      const existingUser = db.findOne('users', { email: userData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user object
      const newUser = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'student',
        phone: userData.phone || '',
        skills: userData.skills || [],
        interests: userData.interests || [],
        bio: userData.bio || '',
        profileImage: userData.profileImage || '',
        isActive: true,
        // mentors and partners must be approved by an admin first
        approved: userData.role === 'mentor' || userData.role === 'partner' ? false : true
      };

      // Insert into database
      const user = db.insert('users', newUser);
      
      return clean(user);
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static findById(id) {
    return clean(db.findById('users', id));
  }

  // Find user by email
  static findByEmail(email) {
    return db.findOne('users', { email });
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      if (!hashedPassword || typeof hashedPassword !== 'string') return false;
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (err) {
      return false;
    }
  }

  // Update user
  static update(id, updates) {
    // Don't allow direct password updates through this method
    if (updates.password) {
      delete updates.password;
    }
    
    return clean(db.update('users', id, updates));
  }

  // Change password
  static async changePassword(id, oldPassword, newPassword) {
    const user = db.findById('users', id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isValid = await this.verifyPassword(oldPassword, user.password);
    if (!isValid) {
      throw new Error('Invalid old password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    return db.update('users', id, { password: hashedPassword });
  }

  // Get all users by role
  static getAllByRole(role) {
    const users = db.findMany('users', { role });
    return users.map(clean);
  }

  // Get all users (for admin)
  static getAll() {
    const users = db.getAll('users');
    return users.map(clean);
  }

  // Delete user
  static delete(id) {
    return db.delete('users', id);
  }

  // Search users
  static search(query) {
    const users = db.getAll('users');
    const searchLower = query.toLowerCase();
    
    const results = users.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.bio && user.bio.toLowerCase().includes(searchLower))
    );

    return results.map(clean);
  }

  // Get user statistics
  static getStats() {
    const allUsers = db.getAll('users');
    return {
      total: allUsers.length,
      students: allUsers.filter(u => u.role === 'student').length,
      mentors: allUsers.filter(u => u.role === 'mentor').length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      partners: allUsers.filter(u => u.role === 'partner').length,
      active: allUsers.filter(u => u.isActive).length
    };
  }
}

module.exports = User;
