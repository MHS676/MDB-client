const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Get the JWT token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
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

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Financial Records API endpoints
export const financialRecordsAPI = {
  save: (data) => apiCall('/financial-records/save', 'POST', data),
  getPeriod: (month, year) =>
    apiCall(`/financial-records/period?month=${month}&year=${year}`, 'GET'),
  getSummary: () => apiCall('/financial-records/summary', 'GET'),
};

// Mock login - generates a simple token for testing
export const authAPI = {
  login: (email, password) => {
    // Mock login - in production, this would call a backend endpoint
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

