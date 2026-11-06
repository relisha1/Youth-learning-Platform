import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (updates) => api.put('/auth/profile', updates),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
};

export const learnerAPI = {
  getProgress: () => api.get('/learner/progress'),
  submit: (tutorialId, projectLink, notes) => api.post(`/learner/submit/${tutorialId}`, { projectLink, notes }),
  getSubmissions: () => api.get('/learner/submissions'),
  getCertificates: () => api.get('/learner/certificates'),
  apply: (jobId, message) => api.post(`/learner/apply/${jobId}`, { message }),
  getApplications: () => api.get('/learner/applications'),
  getMentors: () => api.get('/learner/mentors'),
  askMentor: (mentorId, message) => api.post(`/learner/mentorship/${mentorId}`, { message }),
  getMentorships: () => api.get('/learner/mentorships'),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read'),
};

export const mentorAPI = {
  getSubmissions: (status) => api.get('/mentor/submissions', { params: { status } }),
  review: (id, status, feedback) => api.put(`/mentor/submissions/${id}`, { status, feedback }),
  getProfile: () => api.get('/mentor/profile'),
  saveProfile: (profile) => api.put('/mentor/profile', profile),
  getRequests: () => api.get('/mentor/requests'),
  answerRequest: (id, status) => api.put(`/mentor/requests/${id}`, { status }),
};

export const partnerAPI = {
  getProfile: () => api.get('/partner/profile'),
  saveProfile: (profile) => api.put('/partner/profile', profile),
  getJobs: () => api.get('/partner/jobs'),
  postJob: (job) => api.post('/partner/jobs', job),
  updateJob: (id, updates) => api.put(`/partner/jobs/${id}`, updates),
  deleteJob: (id) => api.delete(`/partner/jobs/${id}`),
  getApplicants: (id) => api.get(`/partner/jobs/${id}/applicants`),
  setStatus: (appId, status) => api.put(`/partner/applications/${appId}`, { status }),
  getLearners: () => api.get('/partner/learners'),
};

export const publicAPI = {
  getTutorials: () => api.get('/public/tutorials'),
  getJobs: () => api.get('/public/internships'),
  verify: (code) => api.get(`/public/verify/${code}`),
};

export const setAuthToken = (token) => localStorage.setItem('token', token);
export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export default api;
