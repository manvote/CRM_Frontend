# Django Authentication Integration Guide

## Overview
Your React frontend is now fully integrated with the Django backend for user authentication. The integration includes:
- ✅ User Signup (email & password)
- ✅ User Login (email & password)
- ✅ JWT Token Management (Access & Refresh tokens)
- ✅ Protected Routes (authentication check)
- ✅ User Logout
- ✅ Google OAuth support (ready)

## Architecture

### Files Created/Modified

#### 1. **`src/services/authApi.js`** (NEW)
- Centralized API client for authentication
- Handles JWT token management
- Automatic token refresh on 401 errors
- Interceptors for adding auth headers

**Key Functions:**
```javascript
authApiService.signup(email, password)    // Register new user
authApiService.login(email, password)     // Login user
authApiService.googleLogin(idToken)       // Google OAuth login
authApiService.logout()                   // Logout and clear tokens
```

#### 2. **`src/utils/authStorage.js`** (UPDATED)
- Enhanced to handle JWT tokens (access & refresh)
- User data persistence in localStorage
- New utility functions:
  - `loginUser(data)` - Stores tokens and user info
  - `logoutUser()` - Clears all auth data
  - `getCurrentUser()` - Get current logged-in user
  - `isAuthenticated()` - Check if user is authenticated
  - `getAccessToken()` - Get JWT access token
  - `getRefreshToken()` - Get JWT refresh token

#### 3. **`src/pages/Login.jsx`** (UPDATED)
- Now uses `authApiService` instead of direct axios
- Properly handles backend response with tokens
- Error handling for invalid credentials

#### 4. **`src/pages/Signup.jsx`** (UPDATED)
- Now uses `authApiService` instead of direct axios
- Removed full_name field (backend doesn't use it)
- Shows success message before redirecting to login
- Better error handling

#### 5. **`src/components/ProtectedRoute.jsx`** (NEW)
- Route wrapper for pages that require authentication
- Redirects to login if user is not authenticated

## Data Flow

### Login Flow
```
User enters email/password
         ↓
Login.jsx calls authApiService.login()
         ↓
Django backend validates credentials
         ↓
Backend returns: { access, refresh, user }
         ↓
loginUser() stores tokens & user in localStorage
         ↓
User redirected to /dashboard
```

### Signup Flow
```
User enters email/password
         ↓
Signup.jsx calls authApiService.signup()
         ↓
Django backend creates User
         ↓
Backend returns: { detail: "User registered successfully" }
         ↓
Frontend shows success message
         ↓
User redirected to /login (after 2 seconds)
```

### API Request Flow
```
Component calls authApiService.login()
         ↓
Request interceptor adds: Authorization: Bearer {access_token}
         ↓
Request sent to Django API
         ↓
If 401 error → Automatically refresh token and retry
         ↓
Response returned to component
```

## Backend Configuration Requirements

Your Django backend should have:

1. **JWT Settings** (settings.py)
```python
INSTALLED_APPS = [
    ...
    'rest_framework_simplejwt',
    'drf_spectacular',
]

SIMPLE_JWT = {
    'ALGORITHM': 'HS256',
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}
```

2. **CORS Settings** (settings.py)
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:3000",  # Alternative
]
```

3. **Token Endpoint** (urls.py)
The API service expects: `POST /api/token/refresh/`
```python
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('api/token/refresh/', TokenRefreshView.as_view()),
    # ... your auth endpoints
]
```

## Usage Examples

### Example 1: Manual Login
```jsx
import { authApiService } from "../services/authApi";
import { loginUser } from "../utils/authStorage";

const handleLogin = async () => {
  try {
    const response = await authApiService.login("user@example.com", "password123");
    loginUser(response.data);  // Store tokens and user
    navigate("/dashboard");
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

### Example 2: Protected Component
```jsx
import { useEffect, useState } from "react";
import { getCurrentUser, isAuthenticated } from "../utils/authStorage";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setUser(getCurrentUser());
  }, []);

  return <div>Welcome, {user?.email}!</div>;
};
```

### Example 3: Using Protected Routes
```jsx
// Update App.jsx to wrap dashboard routes
import ProtectedRoute from "./components/ProtectedRoute";

<Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/leads" element={<Leads />} />
  {/* ... other routes */}
</Route>
```

### Example 4: Logout
```jsx
import { logoutUser } from "../utils/authStorage";
import { useNavigate } from "react-router-dom";

const handleLogout = () => {
  logoutUser();
  navigate("/login");
};
```

## Authentication Headers

All API requests (except login/signup) automatically include:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

This is added by the request interceptor in `authApi.js`.

## Error Handling

### Common Errors

**401 Unauthorized**
- If token is expired → Automatic refresh attempted
- If refresh fails → User logged out, redirected to login

**400 Bad Request**
- Invalid email format
- Password too short (< 8 chars)
- Missing required fields

**500 Server Error**
- Django API error
- Database error
- Validation error

## localStorage Keys

```javascript
"access_token"    // JWT access token (expires in 5 mins)
"refresh_token"   // JWT refresh token (expires in 1 day)
"crm_user"        // User object with id, email, role, name, avatar
```

## Next Steps

1. ✅ **Verify Backend is Running**
   ```bash
   python manage.py runserver
   # Should be running on http://127.0.0.1:8000/
   ```

2. ✅ **Test Signup**
   - Navigate to http://localhost:5173/signup
   - Create account with valid email
   - Should redirect to login

3. ✅ **Test Login**
   - Navigate to http://localhost:5173/login
   - Login with credentials
   - Should redirect to /dashboard

4. ✅ **Implement Google OAuth** (Optional)
   - Get Google Client ID
   - Add Google Sign-In button to Login.jsx
   - Call `authApiService.googleLogin(idToken)`

5. ✅ **API Error Interceptor**
   - Consider adding global error handling
   - Toast notifications for API errors

## Troubleshooting

### "Cannot find module 'authApi'"
- Ensure `src/services/authApi.js` was created
- Check import path: `../services/authApi`

### "401 Unauthorized" on every request
- Check if token is being stored in localStorage
- Verify CORS settings in Django
- Check Authorization header format

### CORS Errors
- Add frontend URL to Django `CORS_ALLOWED_ORIGINS`
- Restart Django development server

### Login not redirecting to dashboard
- Check browser console for errors
- Verify `navigate("/dashboard")` is being called
- Check DashboardLayout component exists

## Security Considerations

1. ✅ **HTTPS in Production** - Change to HTTPS URLs
2. ✅ **Secure Tokens** - Use HttpOnly cookies instead of localStorage (future enhancement)
3. ✅ **CORS Validation** - Restrict to specific origins
4. ✅ **Rate Limiting** - Consider adding rate limits to auth endpoints
5. ✅ **Input Validation** - Backend validates, frontend shows errors

## Testing Checklist

- [ ] User can sign up with valid email and password
- [ ] Duplicate email signup shows error
- [ ] Short password (<8 chars) shows error
- [ ] User can login with correct credentials
- [ ] Wrong password shows "Invalid credentials"
- [ ] Non-existent email shows "Invalid credentials"
- [ ] After login, redirects to dashboard
- [ ] JWT token is stored in localStorage
- [ ] User info persists on page refresh
- [ ] Logout clears tokens and redirects to login
- [ ] Protected routes redirect to login if not authenticated
