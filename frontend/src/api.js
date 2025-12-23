import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})



// Helper to set Authorization header per-tab from sessionStorage
const setAuthHeaderFromSession = () => {  
    try {
      const token = sessionStorage.getItem('accessToken')
      if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      else delete api.defaults.headers.common['Authorization']
    } catch (e) { delete api.defaults.headers.common['Authorization'] }
  }

// Initialize header for the current tab
setAuthHeaderFromSession()

// Ensure every request uses the latest token stored in sessionStorage for this tab
api.interceptors.request.use((config) => {
  try {
    const token = sessionStorage.getItem('accessToken')
    if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` }
  } catch (e) { }
  return config
}, (err) => Promise.reject(err))

// ============= AUTH APIs =============

export const authAPI = {
  signup: async (payload) => {
    console.log(api.defaults.baseURL);
    const response = await api.post('/auth/register', payload)
    if (response.data?.data?.accessToken) {
      sessionStorage.setItem('accessToken', response.data.data.accessToken)
      sessionStorage.setItem('user', JSON.stringify(response.data.data.user))
      setAuthHeaderFromSession()
    }
    return response.data
  },

  login: async (payload) => {
    const response = await api.post('/auth/login', payload)
    if (response.data?.data?.accessToken) {
      sessionStorage.setItem('accessToken', response.data.data.accessToken)
      sessionStorage.setItem('user', JSON.stringify(response.data.data.user))
      setAuthHeaderFromSession()
    }
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    return response.data
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token')
    if (response.data?.data?.accessToken) {
      sessionStorage.setItem('accessToken', response.data.data.accessToken)
      setAuthHeaderFromSession()
    }
    return response.data
  }
}

// ============= USER APIs =============

export const userAPI = {
  getCurrentUser: async () => {
    console.log("Fetching current user");   
    const response = await api.get('/user/me')
    console.log("Current user data:", response);
    return response.data
  },

  getUserById: async (userId) => {
    const response = await api.get(`/user/${userId}`)
    return response.data
  },

  updateProfile: async (payload) => {
    const response = await api.patch('/user/profile', payload)
    return response.data
  },

  uploadResume: async (formData) => {
    const response = await api.patch('/user/resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.patch('/user/change-password', {
      oldPassword,
      newPassword
    })
    return response.data
  },

  deleteAccount: async () => {
    const response = await api.delete('/user/delete-account')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    return response.data
  }
}

// ============= APPLICATION APIs =============

export const applicationAPI = {
  createApplication: async (payload) => {
    const response = await api.post('/application', payload)
    return response.data
  },

  // Get all my applications
  getMyApplications: async () => {
    const response = await api.get('/application/me')
    return response.data
  },

  // Get application by ID
  getApplicationById: async (applicationId) => {
    const response = await api.get(`/application/${applicationId}`)
    return response.data
  },

  // Update application resume
  updateApplication: async (applicationId, resumeFile) => {
    const formData = new FormData()
    formData.append('resume', resumeFile)

    const response = await api.patch(`/application/${applicationId}/resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Withdraw application
  withdrawApplication: async (applicationId) => {
    const response = await api.patch(`/application/${applicationId}/withdraw`)
    return response.data
  },

  // Accept application (user action)
  acceptApplication: async (applicationId) => {
    const response = await api.patch(`/application/${applicationId}/accept`)
    return response.data
  },

  // Get all applications for a job (HR only)
  getJobApplications: async (jobId) => {
    const response = await api.get(`/application/job/${jobId}`)
    return response.data
  },

  // Update application status (HR only)    
  updateApplicationStatus: async (applicationId, status) => {
    const response = await api.patch(`/application/${applicationId}/status`, { status })
    return response.data
  }
}

export default api