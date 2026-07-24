import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Intercepteur requête : ajoute le JWT automatiquement ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Intercepteur réponse : redirige vers /login si 401 ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  createAdmin: (data) => api.post('/auth/create-admin', data),
};

// ─────────────────────────────────────────────────────────
// JOB OFFERS
// ─────────────────────────────────────────────────────────
export const jobApi = {
  getAll: () => api.get('/job-offers'),
  getById: (id) => api.get(`/job-offers/${id}`),
  getByCompany: (companyId) => api.get(`/job-offers/company/${companyId}`),
  create: (companyId, data) => api.post(`/job-offers/company/${companyId}`, data),
  update: (id, data) => api.put(`/job-offers/${id}`, data),
  delete: (id) => api.delete(`/job-offers/${id}`),
};

// ─────────────────────────────────────────────────────────
// CANDIDATES
// ─────────────────────────────────────────────────────────
export const candidateApi = {
  getAll: () => api.get('/candidates'),
  getById: (id) => api.get(`/candidates/${id}`),
  getByUser: (userId) => api.get(`/candidates/user/${userId}`),
  update: (id, data) => api.put(`/candidates/${id}`, data),
};

// ─────────────────────────────────────────────────────────
// COMPANIES
// ─────────────────────────────────────────────────────────
export const companyApi = {
  getAll: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  getByUser: (userId) => api.get(`/companies/user/${userId}`),
  update: (id, data) => api.put(`/companies/${id}`, data),
};

// ─────────────────────────────────────────────────────────
// USERS (Admin only)
// ─────────────────────────────────────────────────────────
export const userApi = {
  get: (id) => api.get(`/users/${id}`),
  updateAvatar: (id, avatarBase64) => api.put(`/users/${id}/avatar`, { avatarBase64 }),
  delete: (id) => api.delete(`/users/${id}`),
};

// ─────────────────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────────────────
export const applicationApi = {
  apply: (candidateId, jobOfferId) =>
    api.post(`/applications/apply?candidateId=${candidateId}&jobOfferId=${jobOfferId}`),
  getByCandidate: (candidateId) => api.get(`/applications/candidate/${candidateId}`),
  getByJobOffer: (jobOfferId) => api.get(`/applications/job-offer/${jobOfferId}`),
  getAll: () => api.get('/applications'),
  updateStatus: (id, status) => api.put(`/applications/${id}/status?status=${status}`),
};

// ─────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────
export const statsApi = {
  get: () => api.get('/stats'),
};

export default api;
