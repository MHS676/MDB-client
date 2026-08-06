const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const EXPENDITURE_API_URL = import.meta.env.VITE_EXPENDITURE_API_URL || 'http://localhost:3000/expenditures';

// Get the JWT token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

const parseJsonPayload = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    const payload = JSON.parse(text);
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return payload.data;
    }
    return payload;
  } catch (error) {
    return text;
  }
};

// Make API calls with authorization
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

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
    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      const errorPayload = await parseJsonPayload(response);
      throw new Error((errorPayload && errorPayload.message) || 'API request failed');
    }

    return parseJsonPayload(response);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const expenditureRequest = async (path, method = 'GET', data = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const options = {
    method,
    headers,
  };

  if (data !== null) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${EXPENDITURE_API_URL}${path}`, options);
    const payload = await parseJsonPayload(response);

    if (!response.ok) {
      throw new Error((payload && payload.message) || 'Expenditure API request failed');
    }

    return payload;
  } catch (error) {
    console.error('Expenditure API Error:', error);
    throw error;
  }
};

// Financial Records API endpoints
export const financialRecordsAPI = {
  save: (data) => apiCall('/financial-records/save', 'POST', data),
  getPeriod: (month, year) =>
    apiCall(`/financial-records/period?month=${month}&year=${year}`, 'GET'),
  getSummary: () => apiCall('/financial-records/summary', 'GET'),
  getExecutiveReport: (month, year) =>
    apiCall(`/financial-records/executive-report?month=${month}&year=${year}`, 'GET'),
};

export const expenditureAPI = {
  getAll: () => expenditureRequest('', 'GET'),
  getById: (id) => expenditureRequest(`/${id}`, 'GET'),
  create: (data) => expenditureRequest('', 'POST', data),
  update: (id, data) => expenditureRequest(`/${id}`, 'PUT', data),
  delete: (id) => expenditureRequest(`/${id}`, 'DELETE'),
};

// Mock login - generates a simple token for testing
export const authAPI = {
  login: (email, password) => {
    const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('token', mockToken);
    return Promise.resolve({ token: mockToken, user: { email, name: email.split('@')[0] } });
  },
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
};

export default apiCall;

