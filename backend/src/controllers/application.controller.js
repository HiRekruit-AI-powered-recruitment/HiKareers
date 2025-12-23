import asyncHandler from "../utils/asyncHnadler.utils.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import { Application } from "../models/applications.moodel.js";
import { Job } from "../models/jobs.models.js";
import { User } from "../models/users.models.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import UploadToCloudinary from "../utils/UploadToCloudinary.utils.js";
import axios from "axios";

export const createApplication = asyncHandler(async (req, res) => {
    const { 
        jobId, 
        fullName, 
        email, 
        mobileNumber, 
        educationDetails, 
        backlogs,
        resumeUrl 
    } = req.body;
    const userId = req.user._id;

    // Validation
    if (!jobId) {
        throw new ApiError(400, "Job ID is required");
    }

    if (!fullName || !email || !mobileNumber) {
        throw new ApiError(400, "Full name, email, and mobile number are required");
    }

    if (!backlogs || !['0', '1', '2+'].includes(backlogs)) {
        throw new ApiError(400, "Valid backlogs value is required (0, 1, or 2+)");
    }

    if (!resumeUrl) {
        throw new ApiError(400, "Resume URL is required");
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Check job deadline
    const currentDate = new Date();
    if (new Date(job.endDate) < currentDate) {
        throw new ApiError(400, "Job application deadline has passed");
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) {
        throw new ApiError(400, "You have already applied for this job");
    }

    try {
        // Fetch resume from provided URL
        const resumeResponse = await axios.get(resumeUrl, {
            responseType: 'arraybuffer',
            timeout: 10000
        });

        const resumeBuffer = Buffer.from(resumeResponse.data);

        // Upload resume to Cloudinary
        const uploadResult = await UploadToCloudinary(
            resumeBuffer,
            `resumes/${jobId}`,
            `${userId}`
        );

        // Create application
        const application = await Application.create({
            jobId,
            userId,
            fullName,
            email,
            mobileNumber,
            educationDetails: educationDetails || {},
            backlogs,
            resumeUrl: uploadResult.secure_url,
            resumePublicId: uploadResult.public_id,
            currentStatus: 'APPLIED'
        });

        // Populate user details before sending response
        await application.populate('jobId', 'title company location endDate');

        return res
            .status(201)
            .json(new ApiResponse(201, "Application submitted successfully", application));

    } catch (error) {
        if (error.response) {
            throw new ApiError(400, "Failed to fetch resume from provided URL");
        }
        throw error;
    }
});


export const updateApplication = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const userId = req.user._id;

    if (!req.file) {
        throw new ApiError(400, "Resume file is required");
    }


    const application = await Application.findById(applicationId);
    if (!application) {
        throw new ApiError(404, "Application not found");
    }


    if (application.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this application");
    }


    if (application.currentStatus !== 'APPLIED') {
        throw new ApiError(400, "Cannot update application. Current status is not APPLIED");
    }


    const job = await Job.findById(application.jobId);
    if (!job) {
        throw new ApiError(404, "Associated job not found");
    }

    const currentDate = new Date();
    if (new Date(job.endDate) < currentDate) {
        throw new ApiError(400, "Cannot update application. Job deadline has passed");
    }

    const result = await UploadToCloudinary(
        req.file.buffer,
        `resumes/${application.jobId}`,
        `${req.user._id}`
    );
    application.resumeUrl = result.secure_url;
    application.resumePublicId = result.public_id;
    await application.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Application updated successfully", application));
});


export const withdrawApplication = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const userId = req.user._id;

    const application = await Application.findById(applicationId);
    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    if (application.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to withdraw this application");
    }

    const allowedStatuses = ['APPLIED', 'UNDER_REVIEW'];
    if (!allowedStatuses.includes(application.currentStatus)) {
        throw new ApiError(400, `Cannot withdraw application with status: ${application.currentStatus}`);
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
        throw new ApiError(404, "Associated job not found");
    }

    const currentDate = new Date();
    if (new Date(job.endDate) < currentDate) {
        throw new ApiError(400, "Cannot withdraw application. Job deadline has passed");
    }

    application.currentStatus = 'WITHDRAWN';
    await application.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Application withdrawn successfully", application));
});


export const getMyApplications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const applications = await Application.find({ userId })
        .populate('jobId', 'title company location endDate')
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, "Applications fetched successfully", applications));
});


export const getApplicationById = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const userId = req.user._id;

    const application = await Application.findById(applicationId)
        .populate('jobId', 'title company location endDate');

    if (!application) {
        throw new ApiError(404, "Application not found");
    }


    if (application.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to view this application");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Application fetched successfully", application));
});


export const acceptApplication = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const userId = req.user._id;

    const application = await Application.findById(applicationId);
    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    if (application.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to accept this application");
    }

    if (application.currentStatus !== 'OFFERED') {
        throw new ApiError(400, `Cannot accept application. Current status is ${application.currentStatus}, expected OFFERED`);
    }

    application.currentStatus = 'ACCEPTED';
    
    application.statusLogs.push({
        status: 'ACCEPTED',
        updatedAt: new Date(),
        updatedBy: userId
    });

    await application.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Offer accepted successfully", application));
});



//---------------------------------Just Added For HR/Admin Use Cases but must be handled in main module---------------------------------//

// Get applications for a specific job (HR use)
export const getJobApplications = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { status } = req.query;

    const query = { jobId };
    if (status) {
        query.currentStatus = status;
    }

    const applications = await Application.find(query)
        .populate('userId', 'fullName email userName')
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, "Job applications fetched successfully", applications));
});

// Update application status (HR use)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { newStatus, rejectionReason } = req.body;
    const updatedBy = req.user._id;

    const validStatuses = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN', 'OFFERED', 'ACCEPTED'];
    
    if (!newStatus || !validStatuses.includes(newStatus)) {
        throw new ApiError(400, "Valid status is required");
    }

    const application = await Application.findById(applicationId);
    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    // Update status
    application.currentStatus = newStatus;
    
    // Add rejection reason if status is REJECTED
    if (newStatus === 'REJECTED' && rejectionReason) {
        application.rejectionReason = rejectionReason;
    }

    // Add to status logs
    application.statusLogs.push({
        status: newStatus,
        updatedAt: new Date(),
        updatedBy: updatedBy
    });

    await application.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Application status updated successfully", application));
});



