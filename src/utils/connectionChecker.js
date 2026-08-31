/**
 * Backend Connection Checker
 * Verifies all backend servers are reachable and responding correctly
 */

import API_CONFIG from '../config/api.config';

export const connectionTests = {
  mdbBackend: {
    name: 'MDB Backend (Financial Records, Expenditures, Users)',
    url: API_CONFIG.BASE_URL,
    endpoint: '/health',
  },
  authServer: {
    name: 'MDB Auth Server',
    url: API_CONFIG.AUTH.BASE.replace('/auth', ''),
    endpoint: '/health',
  },
  guardBackend: {
    name: 'Guard Attendance Backend',
    url: 'http://localhost:5000',
    endpoint: '/health',
  },
};

/**
 * Test a single backend connection
 */
export const testConnection = async (name, fullUrl) => {
  try {
    const response = await fetch(fullUrl, { method: 'GET' });
    return {
      service: name,
      status: response.ok ? '✅ OK' : `❌ Error ${response.status}`,
      url: fullUrl,
      success: response.ok,
    };
  } catch (error) {
    return {
      service: name,
      status: `❌ Failed: ${error.message}`,
      url: fullUrl,
      success: false,
    };
  }
};

/**
 * Test all backend connections
 */
export const testAllConnections = async () => {
  const results = [];

  for (const [key, config] of Object.entries(connectionTests)) {
    const fullUrl = `${config.url}${config.endpoint}`;
    const result = await testConnection(config.name, fullUrl);
    results.push(result);
  }

  return results;
};

/**
 * Test API endpoints specific to each backend
 */
export const testApiEndpoints = async () => {
  const token = localStorage.getItem('token');
  const results = [];

  // Test Financial Records API
  try {
    const response = await fetch(
      `${API_CONFIG.FINANCIAL_RECORDS.BASE}${API_CONFIG.FINANCIAL_RECORDS.GET_SUMMARY}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    results.push({
      endpoint: 'GET /financial-records/summary',
      status: response.ok ? '✅ OK' : `❌ ${response.status}`,
      requiresAuth: true,
    });
  } catch (error) {
    results.push({
      endpoint: 'GET /financial-records/summary',
      status: `❌ ${error.message}`,
      requiresAuth: true,
    });
  }

  // Test Expenditure API
  try {
    const response = await fetch(`${API_CONFIG.EXPENDITURE.BASE}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    results.push({
      endpoint: 'GET /expenditures',
      status: response.ok ? '✅ OK' : `❌ ${response.status}`,
      requiresAuth: true,
    });
  } catch (error) {
    results.push({
      endpoint: 'GET /expenditures',
      status: `❌ ${error.message}`,
      requiresAuth: true,
    });
  }

  // Test Auth Health
  try {
    const response = await fetch(`${API_CONFIG.AUTH.BASE}/health`);
    results.push({
      endpoint: 'GET /auth/health',
      status: response.ok ? '✅ OK' : `❌ ${response.status}`,
      requiresAuth: false,
    });
  } catch (error) {
    results.push({
      endpoint: 'GET /auth/health',
      status: `❌ ${error.message}`,
      requiresAuth: false,
    });
  }

  // Test Posts API
  try {
    const response = await fetch(API_CONFIG.EXTERNAL.POSTS);
    results.push({
      endpoint: 'GET /posts',
      status: response.ok ? '✅ OK' : `❌ ${response.status}`,
      requiresAuth: false,
    });
  } catch (error) {
    results.push({
      endpoint: 'GET /posts',
      status: `❌ ${error.message}`,
      requiresAuth: false,
    });
  }

  // Test Attendance API
  try {
    const response = await fetch(API_CONFIG.EXTERNAL.ATTENDANCE);
    results.push({
      endpoint: 'GET /attendance',
      status: response.ok ? '✅ OK' : `❌ ${response.status}`,
      requiresAuth: false,
    });
  } catch (error) {
    results.push({
      endpoint: 'GET /attendance',
      status: `❌ ${error.message}`,
      requiresAuth: false,
    });
  }

  return results;
};

/**
 * Generate a human-readable report of connection status
 */
export const generateConnectionReport = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 BACKEND CONNECTION DIAGNOSTIC REPORT');
  console.log('='.repeat(60) + '\n');

  console.log('📡 Server Health Checks:');
  console.log('-'.repeat(60));
  const healthChecks = await testAllConnections();
  healthChecks.forEach((result) => {
    console.log(`${result.status} ${result.service}`);
    console.log(`   URL: ${result.url}`);
  });

  console.log('\n📊 API Endpoint Tests:');
  console.log('-'.repeat(60));
  const apiTests = await testApiEndpoints();
  apiTests.forEach((result) => {
    const authLabel = result.requiresAuth ? ' (requires auth)' : '';
    console.log(`${result.status} ${result.endpoint}${authLabel}`);
  });

  console.log('\n💡 Configuration Summary:');
  console.log('-'.repeat(60));
  console.log(`MDB Backend:        ${API_CONFIG.BASE_URL}`);
  console.log(`Auth Server:        ${API_CONFIG.AUTH.BASE.replace('/auth', '')}`);
  console.log(`Guard Backend:      http://localhost:5000`);

  const allSuccess = healthChecks.every((r) => r.success);
  console.log('\n' + '='.repeat(60));
  if (allSuccess) {
    console.log('✅ All backend servers are connected and responding!');
  } else {
    console.log('⚠️  Some backend servers are not responding.');
    console.log('Please ensure all backends are running:');
    console.log('  - npm run start (in MDB-backend) - runs on port 3000');
    console.log('  - npm run start (in MDB-auth-server) - runs on port 3001');
    console.log('  - npm run start (in guard-attendance-backend) - runs on port 5000');
  }
  console.log('='.repeat(60) + '\n');

  return { allSuccess, healthChecks, apiTests };
};
