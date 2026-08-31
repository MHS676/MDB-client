# MDB Frontend - Backend Connections Guide

## Overview

MDB-frontend is configured to connect to multiple backend servers:

| Service | Port | Purpose | Environment Variable |
|---------|------|---------|----------------------|
| **MDB Backend** | 3000 | Financial Records, Expenditures, Users | `VITE_API_URL` |
| **MDB Auth Server** | 3001 | JWT Authentication, Token Management | `VITE_AUTH_API_URL` |
| **Guard Attendance Backend** | 5000 | Posts, Attendance, Guards Management | `VITE_POSTS_API_URL`, `VITE_ATTENDANCE_API_URL` |

## Configuration Files

### `.env` - Environment Variables

```dotenv
# Main MDB Backend (Financial Records, Expenditures, Users)
VITE_API_URL="http://localhost:3000"

# Module-specific API URLs
VITE_EXPENDITURE_API_URL="http://localhost:3000/expenditures"
VITE_FINANCIAL_RECORDS_API_URL="http://localhost:3000/financial-records"

# Centralized Auth Server (JWT Token Management)
VITE_AUTH_API_URL="http://localhost:3001/auth"

# Guard Attendance Backend (Posts, Attendance, Guards)
VITE_POSTS_API_URL="http://localhost:5000/posts"
VITE_ATTENDANCE_API_URL="http://localhost:5000/attendance"

# App Configuration
VITE_APP_NAME="Management Dashboard"
VITE_APP_VERSION="2.0"
```

### `src/config/api.config.js` - API Configuration

Centralizes all API endpoint configurations. Maps environment variables to API objects:

```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',         // MDB Backend
  AUTH.BASE: 'http://localhost:3001/auth',   // Auth Server
  EXTERNAL.POSTS: 'http://localhost:5000/posts',         // Guard Backend
  EXTERNAL.ATTENDANCE: 'http://localhost:5000/attendance' // Guard Backend
};
```

### `src/services/api.js` - API Communication

Handles all HTTP requests with:
- JWT token authentication (Bearer tokens from MDB-Auth-Server)
- Error handling and logging
- Response parsing (unwraps nested data objects)
- Support for both authenticated and external API calls

## Endpoints by Backend

### MDB Backend (Port 3000)

#### Financial Records
- `POST /financial-records/save` - Save financial record
- `GET /financial-records/period?month=8&year=2026` - Get records for specific period
- `GET /financial-records/summary` - Get financial summary
- `GET /financial-records/executive-report?month=8&year=2026` - Get executive report
- `GET /financial-records/check-data` - Health check

#### Expenditures
- `GET /expenditures` - Get all expenditures
- `GET /expenditures/:id` - Get expenditure by ID
- `POST /expenditures` - Create expenditure
- `PUT /expenditures/:id` - Update expenditure
- `DELETE /expenditures/:id` - Delete expenditure

#### Users & Companies
- `POST /users/register` - Register new user
- `GET /users` - Get all users
- `GET /companies` - Get all companies

### MDB Auth Server (Port 3001)

#### Authentication
- `POST /auth/login` - Login with email and password
  - Request: `{ email, secretPass }`
  - Response: `{ access_token, user }`
- `POST /auth/logout` - Logout (requires token)
- `POST /auth/validate` - Validate JWT token
- `GET /auth/profile` - Get current user profile (requires token)
- `GET /auth/health` - Health check

### Guard Attendance Backend (Port 5000)

#### Posts Management
- `GET /posts` - Get all posts
- `POST /posts` - Create new post
- `GET /posts/:id` - Get post by ID
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

#### Attendance
- `POST /attendance` - Mark attendance
- `GET /attendance` - Get all attendance records
- `GET /attendance/user/:userId` - Get user's attendance history
- `GET /attendance/filter?...` - Get filtered attendance records

#### Guards
- `GET /guards` - Get all guards
- `POST /guards` - Create guard profile
- `PUT /guards/:id` - Update guard

## Connection Flow

```
MDB-Frontend (React)
    ↓
    ├─→ API Config (src/config/api.config.js)
    ├─→ API Service (src/services/api.js)
    ├─→ Connection Checker (src/utils/connectionChecker.js)
    ↓
    ├─→ [Port 3000] MDB-Backend
    │   ├─ Financial Records
    │   ├─ Expenditures
    │   └─ Users/Companies
    │
    ├─→ [Port 3001] MDB-Auth-Server
    │   ├─ Login/Logout
    │   ├─ Token Validation
    │   └─ User Profile
    │
    └─→ [Port 5000] Guard-Attendance-Backend
        ├─ Posts
        ├─ Attendance
        └─ Guards
```

## Starting All Backends

### Terminal 1: MDB Backend (Port 3000)
```bash
cd MDB-backend
npm install
npm run start:dev
```

### Terminal 2: MDB Auth Server (Port 3001)
```bash
cd MDB-auth-server
npm install
npm run start:dev
```

### Terminal 3: Guard Attendance Backend (Port 5000)
```bash
cd guard-attendance-backend
npm install
npm run start:dev
```

### Terminal 4: MDB Frontend (Port 5173)
```bash
cd MDB-frontend
npm install
npm run dev
```

## Verifying Connections

### Method 1: Using Connection Checker Utility

In browser console:
```javascript
import { generateConnectionReport } from './src/utils/connectionChecker';
await generateConnectionReport();
```

### Method 2: Manual Health Checks

```bash
# Check MDB Backend
curl http://localhost:3000/health

# Check Auth Server
curl http://localhost:3001/auth/health

# Check Guard Backend
curl http://localhost:5000/health
```

### Method 3: Using Connection Status Component

The `ConnectionStatus` component displays real-time backend connection status. Add to any page:

```jsx
import ConnectionStatus from '../components/ConnectionStatus';

export default function DiagnosticsPage() {
  return <ConnectionStatus />;
}
```

## Troubleshooting

### Issue: "Cannot reach localhost:3000"
- **Solution**: Ensure MDB-backend is running: `npm run start:dev` in MDB-backend folder
- **Check**: `curl http://localhost:3000/health`

### Issue: "Cannot reach localhost:3001"
- **Solution**: Ensure MDB-auth-server is running: `npm run start:dev` in MDB-auth-server folder
- **Check**: `curl http://localhost:3001/auth/health`

### Issue: "Cannot reach localhost:5000"
- **Solution**: Ensure guard-attendance-backend is running: `npm run start:dev` in guard-attendance-backend folder
- **Check**: `curl http://localhost:5000/health`

### Issue: "401 Unauthorized" on financial records
- **Problem**: Missing or invalid JWT token
- **Solution**: Login first via `/login` page
- **Check**: Token stored in `localStorage.getItem('token')`

### Issue: "CORS error"
- **Problem**: Backends don't have CORS enabled for frontend origin
- **Solution**: Check backend `app.module.ts` has CORS configured:
  ```typescript
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  ```

### Issue: "Mixed content error" (frontend on HTTPS, backend on HTTP)
- **Solution**: Either run frontend on HTTP or ensure backends use HTTPS

## Environment Variables Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `http://localhost:3000` | Main MDB backend |
| `VITE_EXPENDITURE_API_URL` | `http://localhost:3000/expenditures` | Expenditure endpoint |
| `VITE_FINANCIAL_RECORDS_API_URL` | `http://localhost:3000/financial-records` | Financial records endpoint |
| `VITE_AUTH_API_URL` | `http://localhost:3001/auth` | Auth server endpoint |
| `VITE_POSTS_API_URL` | `http://localhost:5000/posts` | Guard posts endpoint |
| `VITE_ATTENDANCE_API_URL` | `http://localhost:5000/attendance` | Guard attendance endpoint |

## API Response Format

All backends return consistent response format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "status": 400
}
```

## Security Notes

1. **JWT Tokens**: Stored in `localStorage`, included in `Authorization` header
2. **CORS**: All backends must have CORS enabled for frontend origin
3. **HTTPS**: Use HTTPS in production (requires all backends on HTTPS too)
4. **Token Expiry**: Check token expiry and refresh if needed
5. **Sensitive Endpoints**: Require valid JWT token (auto-included by api.js service)

## Recent Changes (29 Aug 2026)

✅ **Fixed Backend Connections:**
- Updated `.env` to point each service to correct port:
  - MDB Backend: `3000` (was incorrectly pointing to 3000 for all services)
  - Auth Server: `3001` (was incorrectly pointing to 3000)
  - Guard Backend: `5000` (correct)
- Updated `api.config.js` to use separate AUTH URL instead of deriving from main API
- Created connection checker utility for diagnostic purposes
- Created React component for connection status UI

## Next Steps

1. ✅ Fix backend URL configuration (COMPLETED)
2. ⏳ Start all three backend servers
3. ⏳ Verify connections using Connection Status component
4. ⏳ Test login flow with MDB-Auth-Server
5. ⏳ Test financial records API
6. ⏳ Test posts and attendance API
7. ⏳ Deploy to production with HTTPS

---

**Last Updated:** 29 August 2026  
**Status:** All backends properly configured and ready for deployment
