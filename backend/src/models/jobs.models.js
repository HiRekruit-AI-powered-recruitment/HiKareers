import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        default: null
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
        default: null
    },
    workMode: {
        type: String,
        enum: ['Remote', 'On-site', 'Hybrid'],
        default: null
    },
    experienceLevel: {
        type: String,
        enum: ['Fresher', 'Junior', 'Experienced', 'Entry Level', 'Mid-Senior Level', 'Director', 'Executive'],
        default: null
    },
    skills: {
        type: [String],
        default: []
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'CLOSED'],
        default: 'ACTIVE'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applicationCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export const Job = mongoose.model('Job', jobSchema, 'jobs');
