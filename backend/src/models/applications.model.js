import mongoose from 'mongoose';

const STATUS = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'REJECTED',
  'WITHDRAWN',
  'OFFERED',
  'ACCEPTED',
  'INTERVIEW',
  'HIRED',
];

const StatusLogSchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUS, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeUrl: { type: String, required: true },
    resumePublicId: { type: String },
    currentStatus: { type: String, enum: STATUS, default: 'APPLIED' },
    statusLogs: { type: [StatusLogSchema], default: [] },
    aiScore: { type: Number, min: 0, max: 100, default: null },
    rejectionReason: { type: String, default: null },
    // Application form data
    email: { type: String, required: true, trim: true, lowercase: true },
    fullName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true },
    highestQualification: {
      type: String,
      enum: ["tenth", "twelfth", "graduation", "postgraduation"],
      required: true,
    },
    educationDetails: {
      tenth: {
        startYear: { type: Number, default: null },
        endYear: { type: Number, default: null },
        percentage: { type: Number, min: 0, max: 100 },
        cgpa: { type: Number, min: 0, max: 10 },
      },
      twelfth: {
        startYear: { type: Number, default: null },
        endYear: { type: Number, default: null },
        percentage: { type: Number, min: 0, max: 100 },
        cgpa: { type: Number, min: 0, max: 10 }
      },
      graduation: {
        courseName: { type: String, default: null },
        startYear: { type: Number, default: null },
        endYear: { type: Number, default: null },
        cgpa: { type: Number, min: 0, max: 10 },
        degree: { type: String, default: null },
        specialization: { type: String, default: null },
      },
      postgraduation: {
        courseName: { type: String, default: null },
        startYear: { type: Number, default: null },
        endYear: { type: Number, default: null },
        cgpa: { type: Number, min: 0, max: 10 },
        degree: { type: String, default: null },
        specialization: { type: String, default: null },
      },
    },
    backlogs: {
      type: Number,
      min: 0,
      default: 0
    },
  },
  { timestamps: true }
);

ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

ApplicationSchema.index({ userId: 1, createdAt: -1 });
ApplicationSchema.index({ jobId: 1, currentStatus: 1, createdAt: -1 });

export const Application = mongoose.model(
  'Application',
  ApplicationSchema,
  'applications'
);
