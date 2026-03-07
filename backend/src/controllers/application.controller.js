import asyncHandler from "../utils/asyncHandler.utils.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import { Application } from "../models/applications.model.js";
import { Job } from "../models/jobs.models.js";
import { User } from "../models/users.models.js";
import UploadToCloudinary from "../utils/UploadToCloudinary.utils.js";

export const createApplication = asyncHandler(async (req, res) => {
    const {
        jobId,
        fullName,
        email,
        mobileNumber,
        educationDetails,
        backlogs,
        resumeUrl  // fallback: URL of a resume already on Cloudinary (from user profile)
    } = req.body;
    const userId = req.user._id;

    // Validation — required fields
    if (!jobId) {
        throw new ApiError(400, "Job ID is required");
    }

    if (!fullName || !email || !mobileNumber) {
        throw new ApiError(400, "Full name, email, and mobile number are required");
    }

    // Resume: either an uploaded file OR a pre-existing URL from user's profile
    if (!req.file && !resumeUrl) {
        throw new ApiError(400, "Resume is required to apply for a job.");
    }

    // Check if job exists explicitly
    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Check job deadline
    const currentDate = new Date();
    if (job.endDate && new Date(job.endDate) < currentDate) {
        throw new ApiError(400, "Job application deadline has passed");
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) {
        throw new ApiError(400, "You have already applied for this job");
    }

    // Parse educationDetails safely
    let parsedEducation = {};
    if (educationDetails) {
        try {
            parsedEducation = typeof educationDetails === 'string'
                ? JSON.parse(educationDetails)
                : educationDetails;
        } catch (_) {
            parsedEducation = {};
        }
    }

    // Map highestQualification from user-facing values to model enum
    const qualMap = {
        '10th': 'tenth',
        'tenth': 'tenth',
        '12th': 'twelfth',
        'twelfth': 'twelfth',
        'graduation': 'graduation',
        'Graduation': 'graduation',
        'postgraduation': 'postgraduation',
        'Post Graduation': 'postgraduation'
    };
    const rawQual = parsedEducation.highestQualification || req.user.highestQualification;
    const highestQualification = qualMap[rawQual] || 'graduation';

    // Properly structure educationDetails based on schema
    const structuredEducation = {
        tenth: null,
        twelfth: null,
        graduation: null,
        postgraduation: null
    };

    if (highestQualification && (parsedEducation.percentage || parsedEducation.cgpa)) {
        structuredEducation[highestQualification] = {
            percentage: parseFloat(parsedEducation.percentage) || null,
            cgpa: parseFloat(parsedEducation.cgpa) || null,
            endYear: parseInt(parsedEducation.yearOfPassing) || parseInt(parsedEducation.endYear) || null
        };
    }

    // Sanitize backlogs safely (handles "2+", null, etc)
    const backlogsNumber = parseInt(backlogs) || 0;

    let finalResumeUrl = resumeUrl;
    let finalResumePublicId = null;

    // If a file was uploaded, upload it to Cloudinary
    if (req.file) {
        const uploadResult = await UploadToCloudinary(
            req.file.buffer,
            `resumes/${jobId}`,
            `${userId}_${Date.now()}`
        );
        finalResumeUrl = uploadResult.secure_url;
        finalResumePublicId = uploadResult.public_id;
    }

    try {
        // Create application
        const application = await Application.create({
            jobId,
            userId,
            fullName,
            email,
            mobileNumber: String(mobileNumber), // Ensure String format
            highestQualification,
            educationDetails: structuredEducation,
            backlogs: backlogsNumber,
            resumeUrl: finalResumeUrl,
            resumePublicId: finalResumePublicId,
            currentStatus: 'APPLIED'
        });

        // Increment application count for the job
        await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

        // populate with error handling
        try {
            await application.populate('jobId', 'title company location endDate');
        } catch (popErr) {
            console.error("Populate error:", popErr);
            // Non-critical, continue with unpopulated application
        }

        return res
            .status(201)
            .json(new ApiResponse(201, "Application submitted successfully", application));

    } catch (error) {
        console.error("Application submission error:", error);
        // Catch specific Mongoose validation errors or unique constraint violations
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            throw new ApiError(400, "Validation Error: " + messages.join(", "));
        }
        if (error.code === 11000) {
            throw new ApiError(400, "You have already applied for this job");
        }
        throw new ApiError(400, error.message || "Failed to submit application");
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

// Get all applications (Admin use)
export const getAllApplications = asyncHandler(async (req, res) => {
    const { jobId, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (jobId) query.jobId = jobId;
    if (status) query.currentStatus = status;
    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
        Application.find(query)
            .populate('jobId', 'title company')
            .populate('userId', 'fullName email userName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        Application.countDocuments(query)
    ]);

    return res.status(200).json(new ApiResponse(200, "Applications fetched successfully", {
        applications,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
    }));
});


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

    const validStatuses = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN', 'OFFERED', 'ACCEPTED', 'INTERVIEW', 'HIRED'];

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



