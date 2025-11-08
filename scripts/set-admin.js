// Script to set admin role for a user
// Usage: node set-admin.js <email>

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const User = require('../models/User');

async function setAdminRole(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find and update user
    const user = await User.findOneAndUpdate(
      { email: email },
      { 
        $set: { 
          role: 'admin',
          isActive: true 
        } 
      },
      { new: true }
    );

    if (!user) {
      console.log('❌ User not found with email:', email);
      console.log('\n💡 Tips:');
      console.log('1. Make sure the user has logged in at least once');
      console.log('2. Check if email is correct');
      process.exit(1);
    }

    console.log('\n✅ User updated successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 Role:', user.role);
    console.log('✓ Active:', user.isActive);
    console.log('\n🎉 You can now access admin panel at: http://localhost:3001/admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Get email from command line or use default
const email = process.argv[2] || 'milhamsyahr07@gmail.com';
console.log('🔧 Setting admin role for:', email);
setAdminRole(email);
