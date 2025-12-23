import client, { handleRequest, authHeaders } from '../../api.js';

export const applicationAPI = {
  createApplication: (payload) => handleRequest(client.post('/application', payload, { headers: authHeaders() })),
  getMyApplications: () => handleRequest(client.get('/application/me', { headers: authHeaders() })),
  withdrawApplication: (applicationId) => handleRequest(client.patch(`/application/${applicationId}/withdraw`, {}, { headers: authHeaders() })),
  getApplicationById: (id) => handleRequest(client.get(`/application/${id}`, { headers: authHeaders() })),
};
