import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  isProfileCompleted,
  isQualificationCompleted,
} from './helperFunctions.models.js';
import { watchedFields } from './constants.models.js';

const resume = mongoose.Schema(
  {
    url: String,
    publicId: String,
    fileName: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      index: true,
    },
    userType: {
      type: String,
      enum: ['applicant', 'admin'],
      default: 'applicant',
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: null,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      trim: true,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
    profilePhoto: {
      imageUrl: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    resumes: {
      1: { type: resume, default: null },
      2: { type: resume, default: null },
      3: { type: resume, default: null },
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeText: {
      type: String,
      default: '',
    },
    highestQualification: {
      type: String,
      enum: ['tenth', 'twelfth', 'graduation', 'postgraduation', null],
      default: null,
    },
    qualifications: {
      tenth: {
        completed: { type: Boolean, default: false },
        institutionName: { type: String, default: null },
        startYear: { type: Number, default: null },
        endYear: { type: Number, default: null },
        percentage: { type: Number, min: 0, max: 100 },
        cgpa: { type: Number, min: 0, max: 10 },
      },
      twelfth: {
        completed: { type: Boolean, default: false },
        institutionName: { type: String, default: null },
        startYear: { type: Number, default: null },
        endYear: { type: Number, default: null },
        percentage: { type: Number, min: 0, max: 100 },
        cgpa: { type: Number, min: 0, max: 10 },
      },
      graduation: {
        completed: { type: Boolean, default: false },
        institutionName: { type: String, default: null },
        courseName: { type: String, default: null },
        startYear: { type: Number, default: null },
        endYear: { type: Number, default: null },
        cgpa: { type: Number, min: 0, max: 10 },
        percentage: { type: Number, min: 0, max: 100 },
        specialization: { type: String, default: null },
      },
      postgraduation: {
        completed: { type: Boolean, default: false },
        institutionName: { type: String, default: null },
        courseName: { type: String, default: null },
        startYear: { type: Number, default: null },
        endYear: { type: Number, default: null },
        percentage: { type: Number, min: 0, max: 100 },
        cgpa: { type: Number, min: 0, max: 10 },
        specialization: { type: String, default: null },
      },
    },
    refreshToken: String,
    passwordResetToken: String,
    passwordResetExpiry: Date,
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.isPasswordCorrect = async function (password) {
  if (!password) return false;

  return await bcrypt.compare(password, this.password);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.pre('save', function () {
  if (!this.isModified('qualifications')) return;
  const q = this.qualifications;

  if (!q) return;

  q.tenth.completed = isQualificationCompleted('tenth', q.tenth);
  q.twelfth.completed = isQualificationCompleted('twelfth', q.twelfth);
  q.graduation.completed = isQualificationCompleted('graduation', q.graduation);
  q.postgraduation.completed = isQualificationCompleted(
    'postgraduation',
    q.postgraduation
  );
});

userSchema.pre('save', function () {
  if (!watchedFields.some((f) => this.isModified(f))) {
    return;
  }
  this.profileCompleted = isProfileCompleted(this);
});

userSchema.methods.generateRefreshToken = async function () {
  const payload = {
    _id: this._id,
    email: this.email,
  };

  const options = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    algorithm: 'HS256',
  };

  const refreshToken = await jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET,
    options
  );

  return refreshToken;
};

userSchema.methods.generateAccessToken = async function () {
  const payload = {
    _id: this._id,
    email: this.email,
  };

  const options = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    algorithm: 'HS256',
  };

  const accessToken = await jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET,
    options
  );

  return accessToken;
};

export const User = mongoose.model('User', userSchema);
