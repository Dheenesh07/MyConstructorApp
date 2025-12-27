import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://construct.velandev.in/api/auth/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error reading token:', error);
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - could implement refresh logic here
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('login/', credentials),
  register: (userData) => api.post('signup/', userData),
  refreshToken: (refresh) => api.post('token/refresh/', { refresh }),
};

// User Management API
export const userAPI = {
  getAll: () => api.get('users/'),
  getById: (id) => api.get(`users/${id}/`),
  create: (user) => api.post('users/', user),
  update: (id, data) => api.patch(`users/${id}/`, data),
  delete: (id) => api.delete(`users/${id}/`),
};

// Project Management API
export const projectAPI = {
  getAll: () => api.get('projects/'),
  getById: (id) => api.get(`projects/${id}/`),
  create: (project) => api.post('projects/', project),
  update: (id, data) => api.patch(`projects/${id}/`, data),
  delete: (id) => api.delete(`projects/${id}/`),
};

// Task Management API
export const taskAPI = {
  getAll: () => api.get('tasks/'),
  getById: (id) => api.get(`tasks/${id}/`),
  getByProject: (projectId) => api.get(`tasks/?project=${projectId}`),
  getByUser: (userId) => api.get(`tasks/?assigned_to=${userId}`),
  create: (task) => api.post('tasks/', task),
  update: (id, data) => api.patch(`tasks/${id}/`, data),
  delete: (id) => api.delete(`tasks/${id}/`),
};

// Document Management API
export const documentAPI = {
  getAll: () => api.get('documents/'),
  getByProject: (projectId) => api.get(`documents/?project=${projectId}`),
  create: (document) => api.post('documents/', document),
  upload: (formData) => api.post('documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`documents/${id}/`),
};

// Vendor Management API
export const vendorAPI = {
  getAll: () => api.get('vendors/'),
  create: (vendor) => api.post('vendors/', vendor),
  update: (id, data) => api.patch(`vendors/${id}/`, data),
};

// Purchase Order API
export const purchaseOrderAPI = {
  getAll: () => api.get('purchaseorders/'),
  create: (po) => api.post('purchaseorders/', po),
  update: (id, data) => api.patch(`purchaseorders/${id}/`, data),
};

// Budget Management API
export const budgetAPI = {
  getAll: () => api.get('budgets/'),
  getByProject: (projectId) => api.get(`budgets/?project=${projectId}`),
  create: (budget) => api.post('budgets/', budget),
  update: (id, data) => api.patch(`budgets/${id}/`, data),
};

// Attendance API
export const attendanceAPI = {
  getAll: () => api.get('attendance/'),
  getByUser: (userId) => api.get(`attendance/?user=${userId}`),
  checkIn: (data) => api.post('attendance/', data),
  checkOut: (id, data) => api.patch(`attendance/${id}/`, data),
};

// Invoice API
export const invoiceAPI = {
  getAll: () => api.get('invoices/'),
  create: (invoice) => api.post('invoices/', invoice),
  update: (id, data) => api.patch(`invoices/${id}/`, data),
};

// Equipment API
export const equipmentAPI = {
  getAll: () => api.get('equipment/'),
  create: (equipment) => api.post('equipment/', equipment),
  update: (id, data) => api.patch(`equipment/${id}/`, data),
};

// Safety Incident API
export const safetyAPI = {
  getIncidents: () => api.get('incidents/'),
  reportIncident: (incident) => api.post('incidents/', incident),
  updateIncident: (id, data) => api.patch(`incidents/${id}/`, data),
};

// Communication API
export const communicationAPI = {
  getAll: () => api.get('communications/'),
  getByProject: (projectId) => api.get(`communications/?project=${projectId}`),
  getByUser: (userId) => api.get(`communications/?receivers=${userId}`),
  send: (message) => api.post('communications/', message),
};

// Material Request API
export const materialAPI = {
  getRequests: () => api.get('material-requests/'),
  createRequest: (request) => api.post('material-requests/', request),
  updateRequest: (id, data) => api.patch(`material-requests/${id}/`, data),
};

// Quality Inspection API
export const qualityAPI = {
  getInspections: () => api.get('quality-inspections/'),
  createInspection: (inspection) => api.post('quality-inspections/', inspection),
  updateInspection: (id, data) => api.patch(`quality-inspections/${id}/`, data),
};

export default api;