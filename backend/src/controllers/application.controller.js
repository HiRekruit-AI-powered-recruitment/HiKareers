import asyncHandler from "../utils/asyncHnadler.utils.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import { Application } from "../models/applications.moodel.js";
import { Job } from "../models/jobs.models.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import UploadToCloudinary from "../utils/UploadToCloudinary.utils.js";

export const createApplication = asyncHandler(async (req, res) => {
    const { jobId } = req.body;
    const userId = req.user._id;

    if (!jobId) {
        throw new ApiError(400, "Job ID is required");
    }

    if (!req.file) {
        throw new ApiError(400, "Resume file is required");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    const currentDate = new Date();
    if (new Date(job.endDate) < currentDate) {
        throw new ApiError(400, "Job application deadline has passed");
    }


    const folder = `resumes/${jobId}`;
    const publicId = `${userId}`;

    const result = await UploadToCloudinary(
        req.file.buffer,
        jobId,
        req.user._id
    );

    const application = await Application.create({
        jobId,
        userId,
        resumeUrl: result.secure_url,
        resumePublicId: result.public_id,   // Note result.public_id also includes folder path so do not directly use {publicId} here
        currentStatus: 'APPLIED'
    });

    return res
        .status(201)
        .json(new ApiResponse(201, "Application submitted successfully", application));
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
        application.jobId,
        req.user._id
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



