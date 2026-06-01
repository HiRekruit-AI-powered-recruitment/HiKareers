import asyncHandler from '../utils/asyncHandler.utils.js';
import ApiError from '../utils/ApiError.utils.js';
import ApiResponse from '../utils/ApiResponse.utils.js';
import { Job } from '../models/jobs.models.js';
import { Application } from '../models/applications.model.js';
import { User } from '../models/users.models.js';
import calculateMatchPercentage from '../utils/calSkillsMatchPercentage.js';
import { sendBulkMails } from '../utils/sendJobNotifications.js';
// Helper to strip currency symbols from salary
const sanitizeSalary = (salary) => {
  if (!salary) return salary;
  return salary.toString().replace(/[\$₹]/g, '').trim();
};

// POST /v1/jobs  — Create a new job (requires auth)
export const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    company,
    location,
    description,
    endDate,
    salary,
    jobType,
    workMode,
    experienceLevel,
    skills,
    jobId,
    role,
    numberOfPositions,
    hiringType,
    interviewRounds,
    startDate,
    driveVisibility,
  } = req.body;

  // Minimum required fields for backward compatibility
  if (!title || !location || !endDate) {
    throw new ApiError(400, 'title, location, and endDate are required');
  }

  const job = await Job.create({
    title,
    company: company || 'Unknown Company', // Fallback for old API calls if company missing
    location,
    description: description || '', // Fallback
    endDate: new Date(endDate),
    salary: sanitizeSalary(salary) || null,
    jobType: jobType || null,
    workMode: workMode || null,
    experienceLevel: experienceLevel || null,
    skills: Array.isArray(skills) ? skills : [],

    // New fields
    jobId: jobId || undefined,
    role: role || undefined,
    numberOfPositions: numberOfPositions || 1,
    hiringType: hiringType || 'Fresher',
    interviewRounds: Array.isArray(interviewRounds) ? interviewRounds : [],
    startDate: startDate ? new Date(startDate) : undefined,
    driveVisibility: driveVisibility || 'public',

    createdBy: req.user._id,
    status: 'ACTIVE',
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const applyLink = `${frontendUrl}/jobs/${job._id}`;

  const matchedUsers = [];
  const users = await User.find({ skills: { $exists: true, $ne: [] } });

  for (let user of users) {
    const match = calculateMatchPercentage(user.skills, skills);

    if (match >= 80) {
      matchedUsers.push({
        email: user.email,
        name: user.fullName,
      });
    }what
  }

  if (matchedUsers.length > 0) {
    await sendBulkMails({
      users: matchedUsers,
      applyLink,
      company: job.company,
      description: job.description,
    });
  }
  return res
    .status(201)
    .json(new ApiResponse(201, 'Job created successfully', { job, applyLink }));
});

// GET /v1/jobs  — Get all jobs with filtering (supports search, location, jobType, workMode, experienceLevel, createdBy, status)
export const getAllJobs = asyncHandler(async (req, res) => {
  const {
    search,
    location: loc,
    jobType,
    workMode,
    experienceLevel,
    createdBy,
    status = 'ACTIVE',
    page = 1,
    limit = 20,
  } = req.query;

  const query = {};

  // Only apply ACTIVE filter if not explicitly overridden (useful for admins)
  if (status) {
    query.status = status;
  }

  if (createdBy) {
    query.createdBy = createdBy;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { skills: { $elemMatch: { $regex: search, $options: 'i' } } },
    ];
  }

  if (loc) {
    query.location = { $regex: loc, $options: 'i' };
  }

  if (jobType) {
    query.jobType = jobType;
  }

  if (workMode) {
    query.workMode = workMode;
  }

  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Job.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(200, 'Jobs fetched successfully', {
      jobs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    })
  );
});

// GET /v1/jobs/:jobId  — Get a single job by ID (public)
export const getJobById = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId).lean();

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, 'Job fetched successfully', job));
});

// PUT /v1/jobs/:jobId  — Update an existing job (requires admin auth)
export const updateJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const {
    title,
    company,
    location,
    description,
    endDate,
    salary,
    jobType,
    workMode,
    experienceLevel,
    skills,
    status,
  } = req.body;

  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Check if user is the creator (or just allow if admin in this system)
  if (job.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this job');
  }

  const updatedJob = await Job.findByIdAndUpdate(
    jobId,
    {
      $set: {
        title,
        company,
        location,
        description,
        endDate,
        salary: salary !== undefined ? sanitizeSalary(salary) : job.salary,
        jobType: jobType !== undefined ? jobType : job.jobType,
        workMode: workMode !== undefined ? workMode : job.workMode,
        experienceLevel:
          experienceLevel !== undefined ? experienceLevel : job.experienceLevel,
        skills: skills !== undefined ? skills : job.skills,
        status: status !== undefined ? status : job.status,
      },
    },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Job updated successfully', updatedJob));
});

// DELETE /v1/jobs/:jobId  — Delete a job (requires admin auth)
export const deleteJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  if (job.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this job');
  }

  await Job.findByIdAndDelete(jobId);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Job deleted successfully', null));
});

// GET /v1/jobs/admin/stats — Get recruiter stats (requires admin auth)
export const getAdminStats = asyncHandler(async (req, res) => {
  const adminId = req.user._id;

  const jobs = await Job.find({ createdBy: adminId });

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.status === 'ACTIVE').length,
    totalApplications: jobs.reduce(
      (acc, job) => acc + (job.applicationCount || 0),
      0
    ),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, 'Admin stats fetched successfully', stats));
});

export const getAllResumes = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  if (job.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to get data for this job');
  }

  const applications = await Application.find(
    { jobId },
    { resumeUrl: 1, _id: 0 }
  );

  const allResumes = applications.map((app) => app.resumeUrl);
  if (!applications.length) {
    return res.status(200).json(new ApiResponse(200, 'No resumes found', []));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, 'All resumes fetched successfully', allResumes));
});

export const saveJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const user = await User.findById(req.user._id);

  if (!user.savedJobs.includes(jobId)) {
    user.savedJobs.push(jobId);

    await user.save();
  }

  return res.status(200).json(new ApiResponse(200, 'Job saved successfully'));
});

export const removeSavedJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const user = await User.findById(req.user._id);

  user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, 'Job removed from saved jobs'));
});

export const getAllSavedJobs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedJobs');

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'All saved jobs retrieved successfully',
        user.savedJobs
      )
    );
});
