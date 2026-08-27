# Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend running on http://localhost:3000

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## ⚙️ Configuration

### Environment Variables
Edit `.env` file to configure API endpoints:

```dotenv
# Main API Server
VITE_API_URL="http://localhost:3000"

# Auth endpoints
VITE_AUTH_API_URL="http://localhost:3000/auth"

# Financial records
VITE_FINANCIAL_RECORDS_API_URL="http://localhost:3000/financial-records"

# Expenditure
VITE_EXPENDITURE_API_URL="http://localhost:3000/expenditures"

# External data sources
VITE_POSTS_API_URL="http://localhost:5000/posts"
VITE_ATTENDANCE_API_URL="http://localhost:5000/attendance"
```

## 🔐 Authentication

### Login
1. Navigate to http://localhost:5173/login
2. Enter credentials:
   - Email: `yusuf@mdb.com`
   - Password: `admin123`
3. System will create JWT token automatically

### Logout
Click "LOGOUT" button in dashboard header to:
- Clear JWT token
- Clear user session
- Redirect to login page

## 📊 Using the Dashboard

### Data Entry Dashboard
- Revenue Billed - Track recurring and outstanding revenue
- Revenue Till End - Daily breakdown of collections
- Expenditure Summary - Budget vs actual spending
- VAT/TDS Compliance - Tax compliance tracking
- Escort Expenditure - Security escort costs

### Falcon Executive View
- Revenue & Expenditure Analytics
- Key Performance Indicators
- Guard Attendance Details
- Map CMC (Posts/Locations)
- Financial Compliance

## 🔄 Making API Calls

### Fetch Data
```javascript
import { financialRecordsAPI } from './services/api';

// Get all financial summary
const data = await financialRecordsAPI.getSummary();

// Get specific month data
const monthData = await financialRecordsAPI.getPeriod('08', '2026');

// Get executive report
const report = await financialRecordsAPI.getExecutiveReport('08', '2026');
```

### Save Data
```javascript
import { financialRecordsAPI } from './services/api';

const payload = {
  month: 'August',
  year: '2026',
  revenueBilledRecurringMonthly: 100000,
  // ... more fields
};

await financialRecordsAPI.save(payload);
```

### Handle Loading & Errors
```javascript
import { useApiData } from './hooks/useApi';
import { ErrorAlert, LoadingSkeleton } from './components/common/LoadingStates';

function MyComponent() {
  const { data, loading, error } = useApiData(
    () => financialRecordsAPI.getSummary()
  );
  
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorAlert message={error.message} />;
  
  return <div>{/* Display data */}</div>;
}
```

## 🐛 Troubleshooting

### Issue: "Cannot GET /login"
**Solution:** Make sure frontend is running on port 5173. Check terminal output.

### Issue: "Missing or invalid Authorization token"
**Solution:** 
- Try logging out and logging in again
- Clear browser localStorage: `localStorage.clear()`
- Check that backend is running on port 3000

### Issue: "Failed to fetch"
**Solution:**
- Check if backend server is running
- Verify VITE_API_URL in .env is correct
- Check network tab in browser DevTools

### Issue: CORS error
**Solution:**
- Ensure backend has CORS enabled
- Check VITE_API_URL points to correct domain
- For development, backend should have: `app.enableCors()`

### Issue: Blank page or white screen
**Solution:**
- Open browser console (F12) for error messages
- Check ErrorBoundary message
- Clear cache and refresh page

## 📱 API Testing

### Test Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yusuf@mdb.com","password":"admin123"}'
```

### Test Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Financial Records
```bash
curl http://localhost:3000/financial-records/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎨 Component Development

### Create New Page
```javascript
import React from 'react';
import { useApiData } from '../hooks/useApi';
import { LoadingSkeleton, ErrorAlert } from '../components/common/LoadingStates';

export default function MyPage() {
  const { data, loading, error } = useApiData(
    () => financialRecordsAPI.getDataI NeedHere()
  );

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorAlert message={error.message} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Your content here */}
    </div>
  );
}
```

### Add New API Endpoint
1. Add to `src/config/api.config.js`:
```javascript
MY_NEW_ENDPOINT: {
  BASE: import.meta.env.VITE_MY_NEW_API_URL || '...',
  GET_DATA: '/get-data',
}
```

2. Add to `src/services/api.js`:
```javascript
export const myNewAPI = {
  getData: () => apiCall('/get-data', 'GET'),
  saveData: (data) => apiCall('/save-data', 'POST', data),
};
```

3. Use in component:
```javascript
import { myNewAPI } from './services/api';
const data = await myNewAPI.getData();
```

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture guide
- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Summary of all improvements
- **[README.md](./README.md)** - Project overview

## 🚀 Production Deployment

### Build
```bash
npm run build
```

Output will be in `dist/` directory

### Environment Variables for Production
Create `.env.production`:
```
VITE_API_URL="https://api.production.com"
VITE_AUTH_API_URL="https://api.production.com/auth"
# ... other production URLs
```

### Deploy
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting
# Examples: Vercel, Netlify, AWS S3, etc.
```

## 🤝 Support & Issues

1. **Check Logs** - Open browser console (F12)
2. **Review ARCHITECTURE.md** - Contains troubleshooting section
3. **Check Backend** - Ensure backend is running and accessible
4. **Network Tab** - Check API requests in Network tab (F12)

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Start development | `npm run dev` |
| Build for production | `npm run build` |
| Preview production build | `npm run preview` |
| Lint code | `npm run lint` |
| Clear node_modules | `rm -rf node_modules && npm install` |

---

**Happy Coding! 🎉**

For detailed information, refer to [ARCHITECTURE.md](./ARCHITECTURE.md)
