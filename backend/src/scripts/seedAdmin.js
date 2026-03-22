import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User } from '../models/users.models.js';
import { connectDB } from '../db/index.js';

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@hikareers.com';
    const adminData = {
      userName: 'hikareers_admin',
      email: adminEmail,
      fullName: 'HiKareers Admin',
      password: 'Admin@123',
      userType: 'admin',
      emailVerified: true,
    };

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(
        "Admin user already exists. Updating role ensuring it is 'admin'..."
      );
      existingAdmin.userType = 'admin';
      await existingAdmin.save();
      console.log('Admin user updated successfully.');
    } else {
      console.log('Creating new admin user...');
      await User.create(adminData);
      console.log('Admin user created successfully.');
    }

    console.log('\nAdmin Credentials:');
    console.log('Email: ' + adminEmail);
    console.log('Password: Admin@123');
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

seedAdmin();
