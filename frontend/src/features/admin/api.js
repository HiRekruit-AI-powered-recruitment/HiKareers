// src/features/admin/api.js
import client, { handleRequest } from '../../api.js';

export const adminAPI = {
  getAdminJobs: (adminId) =>
    handleRequest(client.get(`/jobs?createdBy=${adminId}&status=ACTIVE`)),
  getAdminJobsAll: (adminId) =>
    handleRequest(client.get(`/jobs?createdBy=${adminId}&status=`)), // empty status gets all for this admin
  getJobDetails: (jobId) => handleRequest(client.get(`/jobs/${jobId}`)),
  getApplicationDetails: (applicationId) =>
    handleRequest(client.get(`/application/${applicationId}`)),
  getApplicationsForJob: (jobId, status = '') =>
    handleRequest(
      client.get(
        `/application/job/${jobId}${status ? `?status=${status}` : ''}`
      )
    ),
  getAllApplications: (params = {}) =>
    handleRequest(client.get('/application', { params })),
  createJob: (jobData) => handleRequest(client.post('/jobs', jobData)),
  updateJob: (jobId, jobData) =>
    handleRequest(client.put(`/jobs/${jobId}`, jobData)),
  deleteJob: (jobId) => handleRequest(client.delete(`/jobs/${jobId}`)),
  getAdminStats: () => handleRequest(client.get('/jobs/admin/stats')),
  updateApplicationStatus: (applicationId, status, rejectionReason) =>
    handleRequest(
      client.patch(`/application/${applicationId}/status`, {
        newStatus: status,
        rejectionReason,
      })
    ),
};
