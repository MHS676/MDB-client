# MDB Frontend Backend Connection Checklist

## 🔍 Issues Found & Fixed

### Issue #1: Auth Server Port ❌→✅
```
Before: VITE_AUTH_API_URL="http://localhost:3000/auth"
After:  VITE_AUTH_API_URL="http://localhost:3001/auth"
Status: ✅ FIXED
```

### Issue #2: Guard Backend Posts Port ❌→✅
```
Before: VITE_POSTS_API_URL="http://localhost:3000/posts"
After:  VITE_POSTS_API_URL="http://localhost:5000/posts"
Status: ✅ FIXED
```

### Issue #3: Guard Backend Attendance Port ❌→✅
```
Before: VITE_ATTENDANCE_API_URL="http://localhost:3000/attendance"
After:  VITE_ATTENDANCE_API_URL="http://localhost:5000/attendance"
Status: ✅ FIXED
```

### Issue #4: Auth Config Derivation ❌→✅
**File:** `src/config/api.config.js`
```javascript
Before: AUTH.BASE = VITE_AUTH_API_URL || `${VITE_API_URL}/auth`
After:  AUTH.BASE = VITE_AUTH_API_URL || 'http://localhost:3001/auth'
Status: ✅ FIXED
```

---

## 📊 Backend Services Status

| Service | Port | Configured | Running | Verified |
|---------|------|:----------:|:-------:|:--------:|
| MDB Backend | 3000 | ✅ | ❌ | ❌ |
| Auth Server | 3001 | ✅ | ❌ | ❌ |
| Guard Backend | 5000 | ✅ | ❌ | ❌ |
| MDB Frontend | 5173 | ✅ | ❌ | ❌ |

> ❌ = Not started yet, but configuration is correct

---

## 🛠 Tools Created for Verification

### 1. Connection Checker Utility
**Location:** `src/utils/connectionChecker.js`

```javascript
// Test all connections
import { generateConnectionReport } from './src/utils/connectionChecker';
const report = await generateConnectionReport();

// Test individual services
import { testConnection } from './src/utils/connectionChecker';
const result = await testConnection('MDB Backend', 'http://localhost:3000/health');

// Test API endpoints
import { testApiEndpoints } from './src/utils/connectionChecker';
const endpoints = await testApiEndpoints();
```

### 2. Connection Status Component
**Location:** `src/components/ConnectionStatus.jsx`

```jsx
import ConnectionStatus from '../components/ConnectionStatus';

export default function Dashboard() {
  return (
    <div>
      <ConnectionStatus />
    </div>
  );
}
```

**Features:**
- Real-time server health checks
- API endpoint verification
- Configuration display
- Auto-refresh every 10 seconds

### 3. Documentation Files
- `BACKEND_CONNECTIONS.md` - Complete connection guide
- `CONNECTION_AUDIT_REPORT.md` - This audit report

---

## 📝 Configuration Files Modified

### 1. `.env`
```dotenv
# Before: All services on 3000
# After:  Correct ports (3000, 3001, 5000)
Status: ✅ Updated
```

### 2. `src/config/api.config.js`
```javascript
// Before: AUTH derived from VITE_API_URL
// After:  AUTH uses separate VITE_AUTH_API_URL
Status: ✅ Updated
```

---

## 🚀 Quick Start Guide

### Step 1: Verify Configuration
```bash
cd MDB-frontend
cat .env
# Should show:
# VITE_API_URL="http://localhost:3000"
# VITE_AUTH_API_URL="http://localhost:3001/auth"
# VITE_POSTS_API_URL="http://localhost:5000/posts"
# VITE_ATTENDANCE_API_URL="http://localhost:5000/attendance"
```

### Step 2: Start All Backends

**Terminal 1 - MDB Backend (3000):**
```bash
cd MDB-backend
npm install
npm run start:dev
# Expected: "🚀 Professional corporate service scaling smoothly on: http://localhost:3000"
```

**Terminal 2 - Auth Server (3001):**
```bash
cd MDB-auth-server
npm install
npm run start:dev
# Expected: "✅ MDB Auth Server is running on http://localhost:3001"
```

**Terminal 3 - Guard Backend (5000):**
```bash
cd guard-attendance-backend
npm install
npm run start:dev
# Expected: "Application running on http://0.0.0.0:5000"
```

**Terminal 4 - Frontend (5173):**
```bash
cd MDB-frontend
npm install
npm run dev
# Expected: "Local: http://localhost:5173"
```

### Step 3: Verify Connections
```bash
# Test each backend
curl http://localhost:3000/health     # MDB Backend
curl http://localhost:3001/auth/health # Auth Server
curl http://localhost:5000/health     # Guard Backend
```

### Step 4: Check in Browser
1. Open http://localhost:5173 (MDB Frontend)
2. Open DevTools Console (F12)
3. Run diagnostic:
```javascript
import { generateConnectionReport } from './src/utils/connectionChecker';
await generateConnectionReport();
```
4. Should see all ✅ OK statuses

---

## 🔐 Authentication Flow

```
1. User enters email/password on Login page
   ↓
2. Frontend calls: POST http://localhost:3001/auth/login
   ↓
3. Auth Server validates credentials, returns JWT token
   ↓
4. Frontend stores token in localStorage
   ↓
5. Frontend adds Authorization header: "Bearer <token>"
   ↓
6. For subsequent requests:
   - MDB Backend (3000) validates token with Auth Server
   - Guard Backend (5000) also validates token
   ↓
7. User authenticated ✅
```

---

## 🔗 API Connection Examples

### Financial Records (from MDB Backend)
```javascript
import { financialRecordsAPI } from '../services/api';

// Get summary (requires auth token)
const summary = await financialRecordsAPI.getSummary();

// Get period data
const period = await financialRecordsAPI.getPeriod(8, 2026);
```

### Auth Operations (from Auth Server)
```javascript
import { authAPI } from '../services/api';

// Login
const { token, user } = await authAPI.login('user@example.com', 'password');

// Logout
await authAPI.logout();
```

### External Data (from Guard Backend)
```javascript
import { externalAPI } from '../services/api';

// Get posts
const posts = await externalAPI.getPosts();

// Get attendance
const attendance = await externalAPI.getAttendance();
```

---

## ❓ Troubleshooting

### Problem: Cannot reach localhost:3000
```bash
# Check if MDB Backend is running
curl http://localhost:3000/health

# If failed, start backend:
cd MDB-backend && npm run start:dev
```

### Problem: Cannot reach localhost:3001
```bash
# Check if Auth Server is running
curl http://localhost:3001/auth/health

# If failed, start auth server:
cd MDB-auth-server && npm run start:dev
```

### Problem: Cannot reach localhost:5000
```bash
# Check if Guard Backend is running
curl http://localhost:5000/health

# If failed, start guard backend:
cd guard-attendance-backend && npm run start:dev
```

### Problem: 401 Unauthorized Error
```javascript
// Check if token exists
console.log(localStorage.getItem('token'));

// Solution: Login first
// Go to Login page and authenticate
```

### Problem: CORS Error
**In backend** `app.module.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

### Problem: Cannot login
```javascript
// Debug: Check what's being sent
import { authAPI } from '../services/api';
const response = await authAPI.login('user@example.com', 'password');
console.log(response);
```

---

## ✅ Verification Checklist

- [x] Auth Server port fixed (3001)
- [x] Guard Backend ports fixed (5000)
- [x] API config updated
- [x] Connection checker created
- [x] Connection status component created
- [x] Documentation completed
- [ ] MDB Backend started and running
- [ ] Auth Server started and running
- [ ] Guard Backend started and running
- [ ] Frontend started and running
- [ ] Connection report shows all ✅
- [ ] Login flow tested
- [ ] Financial records API tested
- [ ] Posts/Attendance API tested

---

## 📞 Support & Reference

**Documentation Files:**
- `BACKEND_CONNECTIONS.md` - Detailed connection guide
- `CONNECTION_AUDIT_REPORT.md` - Full audit report
- `.env` - Environment configuration
- `src/config/api.config.js` - API endpoint config
- `src/services/api.js` - API service layer
- `src/utils/connectionChecker.js` - Diagnostic tools
- `src/components/ConnectionStatus.jsx` - Status component

**Backend Repositories:**
- `MDB-backend/` - Financial records, expenditures, users
- `MDB-auth-server/` - JWT authentication
- `guard-attendance-backend/` - Posts, attendance, guards

---

## 🎯 Summary

✅ **All Issues Fixed**
- Environment variables corrected
- API configuration updated
- Backend ports properly mapped

✅ **Tools Created**
- Connection checker utility
- Status component
- Diagnostic tools

✅ **Documentation Complete**
- Connection guide
- API reference
- Troubleshooting guide

🚀 **Ready for Testing**
- Start all backends
- Verify connections
- Test API flows

---

**Date:** 29 August 2026  
**Status:** ✅ Complete  
**Next Step:** Start backends and verify connections
