import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hr_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hr_token');
      localStorage.removeItem('hr_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register:    (data) => api.post('/auth/register', data),
  login:       (data) => api.post('/auth/login', data),
  getMe:       ()     => api.get('/auth/me'),
  createStaff: (data) => api.post('/auth/create-staff', data),
};

// ── Jobs ─────────────────────────────────────────────────────
export const jobsAPI = {
  getAll:  (params) => api.get('/jobs', { params }),
  getOne:  (id)     => api.get(`/jobs/${id}`),
  create:  (data)   => api.post('/jobs', data),
  update:  (id, data) => api.put(`/jobs/${id}`, data),
  delete:  (id)     => api.delete(`/jobs/${id}`),
};

// ── Applications ─────────────────────────────────────────────
export const applicationsAPI = {
  apply:       (formData) => api.post('/applications', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll:      (params)   => api.get('/applications', { params }),
  getOne:      (id)       => api.get(`/applications/${id}`),
  updateStatus:(id, data) => api.patch(`/applications/${id}/status`, data),
  getRanked:   (jobId)    => api.get(`/applications/job/${jobId}/ranked`),
  downloadCV:  (id)       => api.get(`/applications/${id}/cv`, { responseType: 'blob' }),
};

// ── Interviews ───────────────────────────────────────────────
export const interviewsAPI = {
  schedule: (data) => api.post('/interviews', data),
  getAll:   ()     => api.get('/interviews'),
  getOne:   (id)   => api.get(`/interviews/${id}`),
  update:   (id, data) => api.patch(`/interviews/${id}`, data),
  delete:   (id)   => api.delete(`/interviews/${id}`),
};

// ── Analytics ────────────────────────────────────────────────
export const analyticsAPI = {
  getOverview:        () => api.get('/analytics/overview'),
  getMonthlyApps:     () => api.get('/analytics/applications-per-month'),
  getJobDemand:       () => api.get('/analytics/job-demand'),
  getPipeline:        () => api.get('/analytics/pipeline'),
  getScoreDist:       () => api.get('/analytics/score-distribution'),
};

// ── Users ────────────────────────────────────────────────────
export const usersAPI = {
  getAll:       () => api.get('/users'),
  toggleActive: (id) => api.patch(`/users/${id}/toggle-active`),
  delete:       (id) => api.delete(`/users/${id}`),
};

export default api;
