/**
 * Centralized API Configuration
 * All API URLs are managed through environment variables
 * This ensures single source of truth for all endpoints
 */

const API_CONFIG = {
  // Main API Base URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',

  // Module-specific endpoints
  AUTH: {
    BASE: import.meta.env.VITE_AUTH_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth`,
    LOGIN: '/login',
    LOGOUT: '/logout',
  },

  FINANCIAL_RECORDS: {
    BASE: import.meta.env.VITE_FINANCIAL_RECORDS_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/financial-records`,
    SAVE: '/save',
    GET_PERIOD: '/period',
    GET_SUMMARY: '/summary',
    GET_EXECUTIVE_REPORT: '/executive-report',
    CHECK_DATA: '/check-data',
  },

  EXPENDITURE: {
    BASE: import.meta.env.VITE_EXPENDITURE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/expenditures`,
    GET_ALL: '',
    GET_BY_ID: (id) => `/${id}`,
    CREATE: '',
    UPDATE: (id) => `/${id}`,
    DELETE: (id) => `/${id}`,
  },

  EXTERNAL: {
    POSTS: import.meta.env.VITE_POSTS_API_URL || 'http://localhost:5000/posts',
    ATTENDANCE: import.meta.env.VITE_ATTENDANCE_API_URL || 'http://localhost:5000/attendance',
  },
};

/**
 * Builds complete URL for an endpoint
 * @param {string} baseUrl - Base URL or config group
 * @param {string} endpoint - Endpoint path
 * @returns {string} Complete URL
 */
export const buildUrl = (baseUrl, endpoint = '') => {
  if (!baseUrl) return endpoint;
  return `${baseUrl}${endpoint}`;
};

/**
 * Get config value with type safety
 * @param {string} path - Dot notation path (e.g., 'AUTH.LOGIN')
 * @returns {string} Configuration value
 */
export const getConfig = (path) => {
  const keys = path.split('.');
  let value = API_CONFIG;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      console.warn(`API Config not found: ${path}`);
      return null;
    }
  }
  return value;
};

export default API_CONFIG;
