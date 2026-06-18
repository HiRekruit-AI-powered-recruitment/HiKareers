// src/features/superAdmin/api.js
import client, { handleRequest } from '../../api.js';

export const superAdminAPI = {
  // Admin management
  getAllAdmins: (status = '') =>
    handleRequest(
      client.get('/auth/admins', { params: status ? { status } : {} })
    ),
  updateApproval: (id, action) =>
    handleRequest(client.patch(`/auth/admins/${id}/approval`, { action })),
  revokeAdmin: (id) => handleRequest(client.patch(`/auth/admins/${id}/revoke`)),

  // Jobs — all jobs across all admins
  getAllJobs: () => handleRequest(client.get('/jobs/all')),
};
