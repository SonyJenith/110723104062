/**
 * Notifications API module
 * Handles all API communication with Bearer token authentication
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('notification_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const fetchNotifications = async (params = {}) => {
  try {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Fetch notifications error:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch notifications');
  }
};
export const setAuthToken = (token) => {
  localStorage.setItem('notification_token', token);
};

/**
 * Get authentication token from localStorage
 * @returns {string|null} Token or null if not set
 */
export const getAuthToken = () => {
  return localStorage.getItem('notification_token');
};

/**
 * Clear authentication token
 */
export const clearAuthToken = () => {
  localStorage.removeItem('notification_token');
};

export default apiClient;
