import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://construct.velandev.in/api/auth/';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Helper function to get headers with token
const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('access');
    if (!token) {
      console.warn('⚠️ No token found in AsyncStorage');
      return {};
    }
    console.log('✅ Token retrieved:', token.substring(0, 20) + '...');
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.error('❌ Error getting token:', error);
    return {};
  }
};

// Wrapper for GET requests
const authGet = async (url, config = {}) => {
  const authHeaders = await getAuthHeaders();
  const headers = { ...config.headers, ...authHeaders };
  return api.get(url, { ...config, headers });
};

// Wrapper for POST requests
const authPost = async (url, data, config = {}) => {
  const authHeaders = await getAuthHeaders();
  const headers = { ...config.headers, ...authHeaders };
  return api.post(url, data, { ...config, headers });
};

// Wrapper for PATCH requests
const authPatch = async (url, data, config = {}) => {
  const authHeaders = await getAuthHeaders();
  const headers = { ...config.headers, ...authHeaders };
  return api.patch(url, data, { ...config, headers });
};

// Wrapper for DELETE requests
const authDelete = async (url, config = {}) => {
  const authHeaders = await getAuthHeaders();
  const headers = { ...config.headers, ...authHeaders };
  return api.delete(url, { ...config, headers });
};

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - Token may be expired or invalid');
      // Don't try to refresh if endpoint doesn't exist
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
  getAll: () => authGet('users/'),
  getById: (id) => authGet(`users/${id}/`),
  create: (user) => authPost('users/', user),
  update: (id, data) => authPatch(`users/${id}/`, data),
  delete: (id) => authDelete(`users/${id}/`),
};

// Project Management API
export const projectAPI = {
  getAll: () => authGet('projects/'),
  getById: (id) => authGet(`projects/${id}/`),
  create: (project) => authPost('projects/', project),
  update: (id, data) => authPatch(`projects/${id}/`, data),
  delete: (id) => authDelete(`projects/${id}/`),
};

// Task Management API
export const taskAPI = {
  getAll: () => authGet('tasks/'),
  getById: (id) => authGet(`tasks/${id}/`),
  getByProject: (projectId) => authGet(`tasks/?project=${projectId}`),
  getByUser: (userId) => authGet(`tasks/?assigned_to=${userId}`),
  create: (task) => authPost('tasks/', task),
  update: (id, data) => authPatch(`tasks/${id}/`, data),
  delete: (id) => authDelete(`tasks/${id}/`),
};

// Document Management API
export const documentAPI = {
  getAll: () => authGet('documents/'),
  getByProject: (projectId) => authGet(`documents/?project=${projectId}`),
  create: (document) => authPost('documents/', document),
  upload: async (formData) => {
    const token = await AsyncStorage.getItem('access');
    if (!token) throw new Error('No authentication token found');
    
    return api.post('documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      timeout: 60000
    });
  },
  delete: (id) => authDelete(`documents/${id}/`),
};

// Vendor Management API
export const vendorAPI = {
  getAll: () => authGet('vendors/'),
  create: (vendor) => authPost('vendors/', vendor),
  update: (id, data) => authPatch(`vendors/${id}/`, data),
};

// Purchase Order API
export const purchaseOrderAPI = {
  getAll: () => authGet('purchaseorders/'),
  create: (po) => authPost('purchaseorders/', po),
  update: (id, data) => authPatch(`purchaseorders/${id}/`, data),
};

// Budget Management API
export const budgetAPI = {
  getAll: () => authGet('budgets/'),
  getByProject: (projectId) => authGet(`budgets/?project=${projectId}`),
  create: (budget) => authPost('budgets/', budget),
  update: (id, data) => authPatch(`budgets/${id}/`, data),
};

// Attendance API
export const attendanceAPI = {
  getAll: () => authGet('attendance/'),
  getByUser: (userId) => authGet(`attendance/?user=${userId}`),
  checkIn: (data) => authPost('attendance/', data),
  checkOut: (id, data) => authPatch(`attendance/${id}/`, data),
};

// Invoice API
export const invoiceAPI = {
  getAll: () => authGet('invoices/'),
  create: (invoice) => authPost('invoices/', invoice),
  update: (id, data) => authPatch(`invoices/${id}/`, data),
};

// Equipment API
export const equipmentAPI = {
  getAll: () => authGet('equipment/'),
  create: (equipment) => authPost('equipment/', equipment),
  update: (id, data) => authPatch(`equipment/${id}/`, data),
};

// Safety Incident API
export const safetyAPI = {
  getIncidents: () => authGet('incidents/'),
  reportIncident: (incident) => authPost('incidents/', incident),
  updateIncident: (id, data) => authPatch(`incidents/${id}/`, data),
};

// Communication API
export const communicationAPI = {
  getAll: () => authGet('communications/'),
  getByProject: (projectId) => authGet(`communications/?project=${projectId}`),
  getByUser: (userId) => authGet(`communications/?receivers=${userId}`),
  send: (message) => authPost('communications/', message),
};

// Material Request API
export const materialAPI = {
  getRequests: () => authGet('material-requests/'),
  createRequest: (request) => authPost('material-requests/', request),
  updateRequest: (id, data) => authPatch(`material-requests/${id}/`, data),
};

// Quality Inspection API
export const qualityAPI = {
  getInspections: () => authGet('quality-inspections/'),
  createInspection: (inspection) => authPost('quality-inspections/', inspection),
  updateInspection: (id, data) => authPatch(`quality-inspections/${id}/`, data),
};

export default api;