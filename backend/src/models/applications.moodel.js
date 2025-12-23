import mongoose from 'mongoose';

const STATUS = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN', 'OFFERED', 'ACCEPTED'];

const StatusLogSchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUS, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  },
  { _id: false }
);

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'jobs', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    resumeUrl: { type: String, required: true },
    resumePublicId: { type: String },
    currentStatus: { type: String, enum: STATUS, default: 'APPLIED' },
    statusLogs: { type: [StatusLogSchema], default: [] },
    aiScore: { type: Number, min: 0, max: 100, default: null },
    rejectionReason: { type: String, default: null },
    // Application form data
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    educationDetails: {
      highestQualification: { type: String, enum: ['10th', '12th', 'graduation', 'postgraduation'] },
      percentage: { type: Number, min: 0, max: 100 },
      cgpa: { type: Number, min: 0, max: 10 },
      yearOfPassing: { type: Number }
    },
    backlogs: { 
      type: String, 
      enum: ['0', '1', '2+'],
      required: true 
    },
  },
  { timestamps: true }
);


ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

ApplicationSchema.index({ userId: 1, createdAt: -1 });
ApplicationSchema.index({ jobId: 1, currentStatus: 1, createdAt: -1 });

export const Application = mongoose.model('Application', ApplicationSchema, 'applications');
