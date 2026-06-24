import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User } from '../models/users.models.js';
import { connectDB } from '../db/index.js';

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const superAdminEmail = 'admin@hikareers.com';
    const superAdminData = {
      fullName: 'HiKareers Super Admin',
      email: superAdminEmail,
      password: 'Admin@123',
      userType: 'super-admin',
      emailVerified: true,
      approvalStatus: 'approve',
    };

    const existing = await User.findOne({ email: superAdminEmail });

    if (existing) {
      console.log('Super admin already exists. Ensuring correct userType...');
      existing.userType = 'super-admin';
      existing.approvalStatus = 'approve';
      await existing.save();
      console.log('Super admin updated successfully.');
    } else {
      console.log('Creating new super admin user...');
      await User.create(superAdminData);
      console.log('Super admin created successfully.');
    }

    console.log('\nSuper Admin Credentials:');
    console.log('Email:    ' + superAdminEmail);
    console.log('Password: SuperAdmin@123');
  } catch (error) {
    console.error('Error seeding super admin:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

seedSuperAdmin();
