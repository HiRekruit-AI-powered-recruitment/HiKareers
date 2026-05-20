import asyncHandler from '../utils/asyncHandler.utils.js';
import ApiError from '../utils/ApiError.utils.js';
import ApiResponse from '../utils/ApiResponse.utils.js';
import { Application } from '../models/applications.model.js';
import { Job } from '../models/jobs.models.js';
import { User } from '../models/users.models.js';
import UploadToCloudinary from '../utils/UploadToCloudinary.utils.js';
import { sendMail } from '../utils/SendEmail.utils.js';

export const createApplication = asyncHandler(async (req, res) => {
  const {
    jobId,
    fullName,
    email,
    mobileNumber,
    educationDetails,
    backlogs,
    resumeUrl,
  } = req.body;
  const userId = req.user._id;

  // Validation — required fields
  if (!jobId) {
    throw new ApiError(400, 'Job ID is required');
  }

  if (!fullName || !email || !mobileNumber) {
    throw new ApiError(400, 'Full name, email, and mobile number are required');
  }

  // Resume: either an uploaded file OR a pre-existing URL from user's profile
  if (!req.file && !resumeUrl) {
    throw new ApiError(400, 'Resume is required to apply for a job.');
  }

  // Check if job exists explicitly
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  const { title, company } = job;

  // Check job deadline
  const currentDate = new Date();
  if (job.endDate && new Date(job.endDate) < currentDate) {
    throw new ApiError(400, 'Job application deadline has passed');
  }

  // Check if user already applied
  const existingApplication = await Application.findOne({ jobId, userId });
  if (existingApplication) {
    throw new ApiError(400, 'You have already applied for this job');
  }

  // Parse educationDetails safely
  let parsedEducation = {};
  if (educationDetails) {
    try {
      parsedEducation =
        typeof educationDetails === 'string'
          ? JSON.parse(educationDetails)
          : educationDetails;
    } catch (_) {
      parsedEducation = {};
    }
  }

  // Map highestQualification from user-facing values to model enum
  const qualMap = {
    '10th': 'tenth',
    tenth: 'tenth',
    '12th': 'twelfth',
    twelfth: 'twelfth',
    graduation: 'graduation',
    Graduation: 'graduation',
    postgraduation: 'postgraduation',
    'Post Graduation': 'postgraduation',
  };
  const rawQual =
    parsedEducation.highestQualification || req.user.highestQualification;
  const highestQualification = qualMap[rawQual] || 'graduation';

  // Properly structure educationDetails based on schema
  const structuredEducation = {
    tenth: null,
    twelfth: null,
    graduation: null,
    postgraduation: null,
  };

  if (
    highestQualification &&
    (parsedEducation.percentage || parsedEducation.cgpa)
  ) {
    structuredEducation[highestQualification] = {
      percentage: parseFloat(parsedEducation.percentage) || null,
      cgpa: parseFloat(parsedEducation.cgpa) || null,
      endYear:
        parseInt(parsedEducation.yearOfPassing) ||
        parseInt(parsedEducation.endYear) ||
        null,
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
      currentStatus: 'APPLIED',
    });
    try {
      await sendMail({
        to: email,
        subject: `Your application for ${title} at ${company} is submitted!`,
        html: `<!DOCTYPE html>
          <html>
          <body style="margin:0;padding:30px;background:#f5f7fa;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td align="center">
                <table width="520" cellpadding="0" cellspacing="0" border="0"
                      style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
                  <tr><td style="height:4px;background:#2563eb;"></td></tr>
                  <tr>
                    <td style="padding:40px 44px;">
                      <p style="margin:0 0 28px;color:#2563eb;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">HaiKareer</p>

                      <h1 style="margin:0 0 12px;color:#111;font-size:24px;font-weight:700;">Application Submitted ✓</h1>
                      <p style="margin:0 0 32px;color:#555;font-size:15px;line-height:1.7;">
                        Hi ${fullName}, your application for <strong>${title}</strong> at <strong>${company}</strong> has been successfully submitted.
                      </p>

                      <a href="https://careers.hirekruit.com/jobs"
                        style="display:inline-block;padding:13px 30px;background:#2563eb;color:#fff;
                                text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
                        Browse More Jobs
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 44px;border-top:1px solid #f0f0f0;">
                      <p style="margin:0;color:#aaa;font-size:12px;">© 2025 HaiKareer · All rights reserved</p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>`,
      });
    } catch (err) {
      console.log('Email failed:', err.message);
    }

    // Increment application count for the job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    // populate with error handling
    try {
      await application.populate('jobId', 'title company location endDate');
    } catch (popErr) {
      console.error('Populate error:', popErr);
      // Non-critical, continue with unpopulated application
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, 'Application submitted successfully', application)
      );
  } catch (error) {
    console.error('Application submission error:', error);
    // Catch specific Mongoose validation errors or unique constraint violations
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, 'Validation Error: ' + messages.join(', '));
    }
    if (error.code === 11000) {
      throw new ApiError(400, 'You have already applied for this job');
    }
    throw new ApiError(400, error.message || 'Failed to submit application');
  }
});

export const updateApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user._id;

  if (!req.file) {
    throw new ApiError(400, 'Resume file is required');
  }

  const application = await Application.findById(applicationId);
  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  if (application.userId.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      'You are not authorized to update this application'
    );
  }

  if (application.currentStatus !== 'APPLIED') {
    throw new ApiError(
      400,
      'Cannot update application. Current status is not APPLIED'
    );
  }

  const job = await Job.findById(application.jobId);
  if (!job) {
    throw new ApiError(404, 'Associated job not found');
  }

  const currentDate = new Date();
  if (new Date(job.endDate) < currentDate) {
    throw new ApiError(
      400,
      'Cannot update application. Job deadline has passed'
    );
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
    .json(
      new ApiResponse(200, 'Application updated successfully', application)
    );
});

export const withdrawApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user._id;

  const application = await Application.findById(applicationId);
  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  if (application.userId.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      'You are not authorized to withdraw this application'
    );
  }

  const allowedStatuses = ['APPLIED', 'UNDER_REVIEW'];
  if (!allowedStatuses.includes(application.currentStatus)) {
    throw new ApiError(
      400,
      `Cannot withdraw application with status: ${application.currentStatus}`
    );
  }

  const job = await Job.findById(application.jobId);
  if (!job) {
    throw new ApiError(404, 'Associated job not found');
  }

  const currentDate = new Date();
  if (new Date(job.endDate) < currentDate) {
    throw new ApiError(
      400,
      'Cannot withdraw application. Job deadline has passed'
    );
  }

  application.currentStatus = 'WITHDRAWN';
  await application.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, 'Application withdrawn successfully', application)
    );
});

export const getMyApplications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const applications = await Application.find({ userId })
    .populate('jobId', 'title company location endDate')
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, 'Applications fetched successfully', applications)
    );
});

export const getApplicationById = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user._id;

  const application = await Application.findById(applicationId).populate(
    'jobId',
    'title company location endDate'
  );

  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  if (application.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You are not authorized to view this application');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, 'Application fetched successfully', application)
    );
});

export const acceptApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user._id;

  const application = await Application.findById(applicationId);
  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  if (application.userId.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      'You are not authorized to accept this application'
    );
  }

  if (application.currentStatus !== 'OFFERED') {
    throw new ApiError(
      400,
      `Cannot accept application. Current status is ${application.currentStatus}, expected OFFERED`
    );
  }

  application.currentStatus = 'ACCEPTED';

  application.statusLogs.push({
    status: 'ACCEPTED',
    updatedAt: new Date(),
    updatedBy: userId,
  });

  await application.save();

  return res
    .status(200)
    .json(new ApiResponse(200, 'Offer accepted successfully', application));
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
      { email: { $regex: search, $options: 'i' } },
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
    Application.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(200, 'Applications fetched successfully', {
      applications,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    })
  );
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
    .json(
      new ApiResponse(
        200,
        'Job applications fetched successfully',
        applications
      )
    );
});

// Update application status (HR use)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  const { newStatus, rejectionReason } = req.body;

  const updatedBy = req.user._id;

  const validStatuses = [
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

  if (!newStatus || !validStatuses.includes(newStatus)) {
    throw new ApiError(400, 'Valid status is required');
  }

  const application = await Application.findById(applicationId)
    .populate('userId')
    .populate('jobId');
  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  // Update status
  application.currentStatus = newStatus;

  // Save rejection reason
  if (newStatus === 'REJECTED' && rejectionReason) {
    application.rejectionReason = rejectionReason;
  }

  // Status logs
  application.statusLogs.push({
    status: newStatus,
    updatedAt: new Date(),
    updatedBy,
  });

  await application.save();

  const userEmail = application.email;

  const userName = application.fullName || 'Candidate';

  const jobTitle = application.jobId?.title || 'Job Role';
  console.log(rejectionReason);
  const companyName = application.jobId?.company || 'Company';
  if (newStatus === 'SHORTLISTED') {
    await sendMail({
      to: userEmail,

      subject: 'Congratulations! You have been shortlisted',

      html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color:#2563eb;">
              Congratulations ${userName} 
            </h2>

            <p>
              You have been shortlisted for the role of
              <strong>${jobTitle}</strong>
              at
              <strong>${companyName}</strong>.
            </p>

            <p>
              Our team will contact you soon regarding
              the next steps in the hiring process.
            </p>

            <br />

            <p>
              Best wishes,
              <br />
              ${companyName}
            </p>
          </div>
        `,
    });
  }

  if (newStatus === 'REJECTED') {
    await sendMail({
      to: userEmail,

      subject: 'Application Status Update',

      html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color:#dc2626;">
              Application Update
            </h2>

            <p>
              Hello ${userName},
            </p>

            <p>
              Thank you for applying for the role of
              <strong>${jobTitle}</strong>
              at
              <strong>${companyName}</strong>.
            </p>

            <p>
              After careful consideration,
              we regret to inform you that
              your application was not selected.
            </p>

            ${
              rejectionReason
                ? `
                <div style="
                  background:#f3f4f6;
                  padding:15px;
                  border-radius:8px;
                  margin-top:15px;
                ">
                  <strong>Reason:</strong>
                  <p>${rejectionReason}</p>
                </div>
              `
                : ''
            }

            <p style="margin-top:20px;">
              We appreciate your interest and encourage
              you to apply for future opportunities.
            </p>

            <br />

            <p>
              Best regards,
              <br />
              ${companyName}
            </p>
          </div>
        `,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'Application status updated successfully',
        application
      )
    );
});
