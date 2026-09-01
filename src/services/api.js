/**
 * Professional API Service Layer
 * Centralized API communication with error handling, logging, and configuration
 */

import API_CONFIG, { buildUrl } from '../config/api.config';

/**
 * Get JWT token from localStorage
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Parse JSON response with fallback
 */
const parseJsonPayload = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    const payload = JSON.parse(text);
    
    // Unwrap backend response format: { success: true, data: {...} }
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return payload.data;
    }
    
    // Fallback: if it has data field, return that
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data;
    }
    
    return payload;
  } catch (error) {
    return text;
  }
};

/**
 * Handle API errors consistently
 */
const handleApiError = (status, payload, defaultMessage) => {
  if (status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  const message = (payload && payload.message) || defaultMessage;
  const error = new Error(message);
  error.status = status;
  return error;
};

/**
 * Generic API call handler with authorization
 */
const apiCall = async (endpoint, method = 'GET', data = null, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    method,
    headers,
    ...options,
  };

  if (data !== null) {
    fetchOptions.body = JSON.stringify(data);
  }

  try {
    // If endpoint is already a complete URL (starts with http), use it as-is
    // Otherwise, prepend BASE_URL
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.BASE_URL}${endpoint}`;
    const response = await fetch(fullUrl, fetchOptions);
    const payload = await parseJsonPayload(response);

    if (!response.ok) {
      throw handleApiError(response.status, payload, 'API request failed');
    }

    return payload;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * External API call handler (without JWT auth)
 */
const externalApiCall = async (url, method = 'GET', data = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add JWT token from localStorage for authentication
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data !== null) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const payload = await parseJsonPayload(response);

    if (!response.ok) {
      throw new Error((payload && payload.message) || 'External API request failed');
    }

    return payload;
  } catch (error) {
    console.error('External API Error:', error);
    throw error;
  }
};

/**
 * Financial Records API - All endpoints for revenue, expenditure, VAT, TDS management
 */
export const financialRecordsAPI = {
  save: (data) =>
    apiCall(buildUrl(API_CONFIG.FINANCIAL_RECORDS.BASE, API_CONFIG.FINANCIAL_RECORDS.SAVE), 'POST', data),
  
  getPeriod: (month, year) =>
    apiCall(
      buildUrl(API_CONFIG.FINANCIAL_RECORDS.BASE, `${API_CONFIG.FINANCIAL_RECORDS.GET_PERIOD}?month=${month}&year=${year}`),
      'GET'
    ),
  
  getSummary: () =>
    apiCall(buildUrl(API_CONFIG.FINANCIAL_RECORDS.BASE, API_CONFIG.FINANCIAL_RECORDS.GET_SUMMARY), 'GET'),
  
  getExecutiveReport: (month, year) =>
    apiCall(
      buildUrl(API_CONFIG.FINANCIAL_RECORDS.BASE, `${API_CONFIG.FINANCIAL_RECORDS.GET_EXECUTIVE_REPORT}?month=${month}&year=${year}`),
      'GET'
    ),

  checkData: () =>
    apiCall(buildUrl(API_CONFIG.FINANCIAL_RECORDS.BASE, API_CONFIG.FINANCIAL_RECORDS.CHECK_DATA), 'GET'),
};

/**
 * Expenditure API - All endpoints for expenditure management
 */
export const expenditureAPI = {
  getAll: () =>
    apiCall(buildUrl(API_CONFIG.EXPENDITURE.BASE, API_CONFIG.EXPENDITURE.GET_ALL), 'GET'),
  
  getById: (id) =>
    apiCall(buildUrl(API_CONFIG.EXPENDITURE.BASE, API_CONFIG.EXPENDITURE.GET_BY_ID(id)), 'GET'),
  
  create: (data) =>
    apiCall(buildUrl(API_CONFIG.EXPENDITURE.BASE, API_CONFIG.EXPENDITURE.CREATE), 'POST', data),
  
  update: (id, data) =>
    apiCall(buildUrl(API_CONFIG.EXPENDITURE.BASE, API_CONFIG.EXPENDITURE.UPDATE(id)), 'PUT', data),
  
  delete: (id) =>
    apiCall(buildUrl(API_CONFIG.EXPENDITURE.BASE, API_CONFIG.EXPENDITURE.DELETE(id)), 'DELETE'),
};

/**
 * Authentication API - Login, logout, and token management
 */
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await fetch(buildUrl(API_CONFIG.AUTH.BASE, API_CONFIG.AUTH.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, secretPass: password }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Login failed');
      }

      const result = await response.json();
      
      // Handle wrapped response format: { success: true, data: { access_token, user } }
      const data = result.data || result;

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        return {
          token: data.access_token,
          user: data.user || { email, name: email.split('@')[0] },
        };
      }

      throw new Error('No token in response');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = getToken();
      if (token) {
        await fetch(buildUrl(API_CONFIG.AUTH.BASE, API_CONFIG.AUTH.LOGOUT), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('dataEntryUser');
      localStorage.removeItem('falconUser');
      return Promise.resolve();
    }
  },
};

/**
 * External Data APIs - Posts, Attendance, etc.
 */
export const externalAPI = {
  getPosts: () => externalApiCall(API_CONFIG.EXTERNAL.POSTS),
  getAttendance: () => externalApiCall(API_CONFIG.EXTERNAL.ATTENDANCE),
};

export default apiCall;

