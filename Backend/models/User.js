const bcrypt = require('bcryptjs');
const db = require('./database.js');

class User {
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
        isActive: true
      };

      // Insert into database
      const user = db.insert('users', newUser);
      
      // Remove password from returned object
      delete user.password;
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static findById(id) {
    const user = db.findById('users', id);
    if (user) {
      delete user.password;
    }
    return user;
  }

  // Find user by email
  static findByEmail(email) {
    return db.findOne('users', { email });
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    // For local development we allow plain-text stored passwords so beginners
    // can inspect and set simple values without needing to generate bcrypt hashes.
    // In production this branch is not used; stored passwords should always be bcrypt hashes.
    try {
      if (!hashedPassword || typeof hashedPassword !== 'string') return false;
      // bcrypt hashes usually start with $2a$ or $2b$ etc.
      if (process.env.NODE_ENV !== 'production' && !hashedPassword.startsWith('$2')) {
        return plainPassword === hashedPassword;
      }
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
    
    const user = db.update('users', id, updates);
    if (user) {
      delete user.password;
    }
    return user;
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
    return users.map(user => {
      delete user.password;
      return user;
    });
  }

  // Get all users (for admin)
  static getAll() {
    const users = db.getAll('users');
    return users.map(user => {
      delete user.password;
      return user;
    });
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

    return results.map(user => {
      delete user.password;
      return user;
    });
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
