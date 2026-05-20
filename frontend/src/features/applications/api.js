import client, { handleRequest, authHeaders } from '../../api.js';

export const applicationAPI = {
  createApplication: (payload) =>
    handleRequest(
      client.post('/application', payload, { headers: authHeaders() })
    ),
  createApplicationWithFile: (formData) =>
    handleRequest(
      client.post('/application', formData, {
        headers: {
          ...authHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      })
    ),
  getMyApplications: () =>
    handleRequest(client.get('/application/me', { headers: authHeaders() })),
  withdrawApplication: (applicationId) =>
    handleRequest(
      client.patch(
        `/application/${applicationId}/withdraw`,
        {},
        { headers: authHeaders() }
      )
    ),
  getApplicationById: (id) =>
    handleRequest(client.get(`/application/${id}`, { headers: authHeaders() })),
};

export const jobAPI = {
  getAllJobs: (params = {}) => handleRequest(client.get('/jobs', { params })),
  getJobById: (jobId) => handleRequest(client.get(`/jobs/${jobId}`)),
  getSavedJobs: () => handleRequest(client.get('/jobs/get-saved-jobs')),
  saveJob: (jobId) => handleRequest(client.post(`/jobs/save-job/${jobId}`)),
  removeJob: (jobId) => handleRequest(client.post(`/jobs/remove-job/${jobId}`)),
};
