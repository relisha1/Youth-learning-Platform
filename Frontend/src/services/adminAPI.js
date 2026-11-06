import axios from 'axios';
import { API_URL } from '../config';

function authHeader() {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getUsers = () => axios.get(`${API_URL}/admin/users`, { headers: { ...authHeader() } });
export const getUserStats = () => axios.get(`${API_URL}/admin/users/stats`, { headers: { ...authHeader() } });
export const getUser = (id) => axios.get(`${API_URL}/admin/users/${id}`, { headers: { ...authHeader() } });
export const deleteUser = (id) => axios.delete(`${API_URL}/admin/users/${id}`, { headers: { ...authHeader() } });
export const updateUserRole = (id, role) => axios.put(`${API_URL}/admin/users/${id}/role`, { role }, { headers: { ...authHeader() } });

export const approveUser = (id, approved) => axios.put(`${API_URL}/admin/users/${id}/approve`, { approved }, { headers: { ...authHeader() } });

export const getReport = () => axios.get(`${API_URL}/admin/report`, { headers: { ...authHeader() } });
export const getReportCsv = () => axios.get(`${API_URL}/admin/report.csv`, { headers: { ...authHeader() }, responseType: 'blob' });

export const getBackup = () => axios.get(`${API_URL}/admin/backup`, { headers: { ...authHeader() }, responseType: 'blob' });

export const getTutorials = () => axios.get(`${API_URL}/admin/tutorials`, { headers: { ...authHeader() } });
export const createTutorial = (data) => axios.post(`${API_URL}/admin/tutorials`, data, { headers: { ...authHeader() } });
export const updateTutorial = (id, data) => axios.put(`${API_URL}/admin/tutorials/${id}`, data, { headers: { ...authHeader() } });
export const deleteTutorial = (id) => axios.delete(`${API_URL}/admin/tutorials/${id}`, { headers: { ...authHeader() } });

export const getInternships = () => axios.get(`${API_URL}/admin/internships`, { headers: { ...authHeader() } });
export const createInternship = (data) => axios.post(`${API_URL}/admin/internships`, data, { headers: { ...authHeader() } });
export const updateInternship = (id, data) => axios.put(`${API_URL}/admin/internships/${id}`, data, { headers: { ...authHeader() } });
export const deleteInternship = (id) => axios.delete(`${API_URL}/admin/internships/${id}`, { headers: { ...authHeader() } });

export const getApplications = () => axios.get(`${API_URL}/admin/applications`, { headers: { ...authHeader() } });
export const updateApplicationStatus = (id, status) => axios.put(`${API_URL}/admin/applications/${id}/status`, { status }, { headers: { ...authHeader() } });

export const getAdminStats = () => axios.get(`${API_URL}/admin/stats`, { headers: { ...authHeader() } });

export default {
  getUsers,
  getUserStats,
  getUser,
  deleteUser,
  updateUserRole,
  getTutorials,
  createTutorial,
  updateTutorial,
  deleteTutorial,
  getInternships,
  createInternship,
  updateInternship,
  deleteInternship,
  getApplications,
  updateApplicationStatus,
  getAdminStats
};
