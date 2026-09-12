import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parish-website');
    console.log('Connected to MongoDB');

    const identifier = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin123';

    // The login page routes email-formatted inputs to the email field and plain
    // ones to the username field. Store the identifier in the matching field so
    // login works with exactly what was typed here.
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const query = isEmail
      ? { email: identifier.toLowerCase() }
      : { username: identifier };

    // Check if user already exists
    const existingUser = await User.findOne(query);
    if (existingUser) {
      console.log(`User ${identifier} already exists`);
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const user = new User({
      ...query,
      passwordHash,
      role: 'admin'
    });

    await user.save();
    console.log(`Admin user created successfully!`);
    console.log(`${isEmail ? 'Email' : 'Username'}: ${isEmail ? identifier.toLowerCase() : identifier}`);
    console.log(`Password: ${password}`);
    console.log('\nPlease change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();


