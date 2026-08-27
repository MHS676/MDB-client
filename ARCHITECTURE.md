# Frontend Architecture & Configuration Guide

## Overview
This frontend application has been professionally restructured with centralized API configuration, improved data handling, and comprehensive error management.

## Configuration Management

### Environment Variables (.env)
All API URLs are now defined in environment variables for easy configuration across environments:

```dotenv
# Main API Configuration
VITE_API_URL="http://localhost:3000"

# Module-specific API URLs
VITE_EXPENDITURE_API_URL="http://localhost:3000/expenditures"
VITE_FINANCIAL_RECORDS_API_URL="http://localhost:3000/financial-records"
VITE_AUTH_API_URL="http://localhost:3000/auth"

# External Data Sources
VITE_POSTS_API_URL="http://localhost:5000/posts"
VITE_ATTENDANCE_API_URL="http://localhost:5000/attendance"

# App Configuration
VITE_APP_NAME="Management Dashboard"
VITE_APP_VERSION="2.0"
```

### Configuration Service
`src/config/api.config.js` - Centralized API endpoint configuration

- All URLs are loaded from environment variables
- Provides `buildUrl()` and `getConfig()` utilities
- Single source of truth for API endpoints

## API Service Layer

### Professional API Service
`src/services/api.js` - Handles all API communication

**Features:**
- Centralized API calls with proper error handling
- JWT authentication token management
- Consistent response parsing
- Professional error messages
- Support for both authenticated and external APIs

**API Groups:**
- `authAPI` - Login and logout
- `financialRecordsAPI` - Revenue, expenditure, VAT, TDS data
- `expenditureAPI` - Expenditure management
- `externalAPI` - Posts, Attendance data

**Example Usage:**
```javascript
import { financialRecordsAPI, authAPI } from './services/api';

// Fetch data
const data = await financialRecordsAPI.getSummary();

// Save data
await financialRecordsAPI.save(payload);

// Authentication
await authAPI.login(email, password);
await authAPI.logout();
```

## Professional Utilities

### Custom Hooks (`src/hooks/useApi.js`)

**useApiData** - Fetch data with automatic loading/error states
```javascript
const { data, loading, error, refetch } = useApiData(
  () => financialRecordsAPI.getSummary(),
  [dependencies]
);
```

**useApiMutation** - Handle form submissions and mutations
```javascript
const { mutate, loading, error } = useApiMutation(
  (payload) => financialRecordsAPI.save(payload)
);

const handleSubmit = async () => {
  await mutate(formData);
};
```

**usePagination** - Manage pagination state
```javascript
const { currentPage, totalPages, paginatedItems, goToPage } = usePagination(
  items,
  10 // items per page
);
```

### Logger & Error Handling (`src/utils/logger.js`)

**Professional Logging:**
```javascript
import { logger } from './utils/logger';

logger.info('Data loaded', data);
logger.error('API failed', error);
logger.warn('Invalid input', value);
logger.debug('Debugging info', debugData);
```

**Error Handling:**
```javascript
import { handleApiError } from './utils/logger';

try {
  // API call
} catch (error) {
  const userMessage = handleApiError(error);
  // Show to user
}
```

**Retry Mechanism:**
```javascript
import { retryAsync } from './utils/logger';

const data = await retryAsync(() => fetchData(), 3, 1000);
```

## UI Components

### Error Boundary (`src/components/common/ErrorBoundary.jsx`)
- Catches React errors and displays graceful error UI
- Automatically wraps the entire app
- Shows development error details in dev mode

### Loading States (`src/components/common/LoadingStates.jsx`)
- **LoadingSkeleton** - Generic loading skeleton
- **TableLoadingSkeleton** - Table row skeletons
- **CardLoadingSkeleton** - Card loading state
- **LoadingOverlay** - Full-screen loading indicator
- **ErrorAlert** - Dismissible error message
- **SuccessAlert** - Dismissible success message

**Example:**
```javascript
import { ErrorAlert, SuccessAlert, LoadingOverlay } from './components/common/LoadingStates';

{error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
{success && <SuccessAlert message={success} />}
{loading && <LoadingOverlay message="Loading data..." />}
```

## Code Organization

```
src/
├── config/
│   └── api.config.js           # Centralized API configuration
├── services/
│   └── api.js                  # Professional API service layer
├── hooks/
│   └── useApi.js              # Custom hooks for data fetching
├── utils/
│   └── logger.js              # Logging and error handling utilities
├── components/
│   └── common/
│       ├── ErrorBoundary.jsx  # Error boundary wrapper
│       ├── LoadingStates.jsx  # Loading & alert components
│       ├── Header.jsx         # Header component
│       └── Sidebar.jsx        # Sidebar component
├── features/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── FalconLoginPage.jsx
│   ├── dashboard/
│   │   ├── NewDashboard.jsx
│   │   ├── RevenueBilledPage.jsx
│   │   ├── RevenueTillEndPage.jsx
│   │   ├── ExpenditurePage.jsx
│   │   ├── VatPage.jsx
│   │   ├── TdsPage.jsx
│   │   ├── EscortExpenditureDataEntryPage.jsx
│   │   ├── EscortExpenditureSummaryPage.jsx
│   │   └── AttendanceDetailsPage.jsx
│   ├── falcon/
│   │   ├── FalconDashboard.jsx
│   │   └── FalconLoginPage.jsx
├── pages/
│   ├── RevenueExpenditurePage.jsx
│   ├── FinancialCompliancePage.jsx
│   ├── KpiAnalyticsPage.jsx
│   ├── MapCmcPage.jsx
│   └── FinancialDashboard.jsx
└── App.jsx                     # Wrapped with ErrorBoundary
```

## API Endpoints Reference

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout (requires JWT)

### Financial Records
- `POST /financial-records/save` - Save financial data
- `GET /financial-records/period?month={month}&year={year}` - Get period data
- `GET /financial-records/summary` - Get summary data
- `GET /financial-records/executive-report?month={month}&year={year}` - Get executive report
- `GET /financial-records/check-data` - Check data availability

### Expenditure
- `GET /expenditures` - Get all expenditures
- `GET /expenditures/:id` - Get specific expenditure
- `POST /expenditures` - Create expenditure
- `PUT /expenditures/:id` - Update expenditure
- `DELETE /expenditures/:id` - Delete expenditure

### External Data
- `GET /posts` (localhost:5000) - Get posts
- `GET /attendance` (localhost:5000) - Get attendance logs

## Best Practices

### 1. Always Use API Service Layer
❌ **Don't:**
```javascript
const response = await fetch('http://localhost:3000/some-endpoint');
```

✅ **Do:**
```javascript
import { financialRecordsAPI } from './services/api';
const data = await financialRecordsAPI.getSummary();
```

### 2. Use Custom Hooks for Data Fetching
❌ **Don't:**
```javascript
useEffect(() => {
  setState(null);
  fetch('/endpoint').then(r => r.json()).then(setState);
}, []);
```

✅ **Do:**
```javascript
const { data, loading, error } = useApiData(
  () => financialRecordsAPI.getData()
);
```

### 3. Handle Errors Properly
❌ **Don't:**
```javascript
try {
  await api.call();
} catch (e) {
  console.log('error');
}
```

✅ **Do:**
```javascript
import { handleApiError } from './utils/logger';
try {
  await api.call();
} catch (e) {
  const message = handleApiError(e);
  setError(message); // Show to user
}
```

### 4. Use Environment Variables
❌ **Don't:**
```javascript
const url = 'http://localhost:3000/endpoint';
```

✅ **Do:**
```javascript
import API_CONFIG from './config/api.config';
const url = `${API_CONFIG.BASE_URL}/endpoint`;
```

## Troubleshooting

### "Missing or invalid Authorization token" Error
- Ensure you're logged in and token is stored in localStorage
- Check if `authAPI.login()` was called successfully
- Clear browser storage and login again

### API calls failing with 401 status
- Token has expired - user will be redirected to login
- This is handled automatically by the API service

### CORS errors
- Ensure backend has CORS enabled
- Check that API_URL points to the correct backend server
- Verify backend is running on the expected port

## Performance Considerations

1. **API Debouncing** - Use debouncing for search/filter inputs
2. **Pagination** - Use `usePagination` hook for large datasets
3. **Caching** - Consider caching frequently accessed data
4. **Lazy Loading** - Load pages/data on demand
5. **Error Retry** - Use `retryAsync` for failed API calls

## Security Best Practices

1. **JWT Token Storage** - Token is stored in localStorage
   - Consider using secure cookies for production
   
2. **Authorization** - Check authorization before sensitive operations
   
3. **Input Validation** - Validate all user inputs before sending to API
   
4. **HTTPS Only** - Use HTTPS in production environments

5. **Environment Secrets** - Never commit API keys or secrets to version control

## Development Workflow

1. **Add New API Endpoint:**
   - Add to `src/config/api.config.js`
   - Create method in `src/services/api.js`
   - Use in components via imported API

2. **Handle Data Loading:**
   - Use `useApiData` hook
   - Show loading skeleton
   - Show error alert if needed

3. **Handle Form Submission:**
   - Use `useApiMutation` hook
   - Show loading state
   - Show success/error message

4. **Add New Page:**
   - Create in `src/features/` or `src/pages/`
   - Use API service for data
   - Use custom hooks for state management
   - Wrap with ErrorBoundary automatically

## Further Improvements

Consider implementing:
- Request timeout configuration
- Request/Response interceptors for logging
- Local caching mechanism
- Optimistic updates
- WebSocket support for real-time data
- GraphQL integration
- Mock data for testing
