# Quick Reference Card

## 🎯 What Was Done

Your React CRM frontend is now fully integrated with your Django authentication backend!

## 📦 New Files Created

1. **`src/services/authApi.js`** - API client with JWT handling
2. **`src/components/ProtectedRoute.jsx`** - Route protection component
3. **`AUTHENTICATION_INTEGRATION.md`** - Full documentation
4. **`INTEGRATION_COMPLETED.md`** - Integration summary
5. **`GOOGLE_OAUTH_SETUP.md`** - Google Sign-In guide

## 📝 Files Updated

1. **`src/utils/authStorage.js`** - Now handles JWT tokens
2. **`src/pages/Login.jsx`** - Uses authApiService
3. **`src/pages/Signup.jsx`** - Uses authApiService

## 🚀 How to Use

### Login Users
```javascript
import { authApiService } from "../services/authApi";
import { loginUser } from "../utils/authStorage";

const response = await authApiService.login(email, password);
loginUser(response.data);  // Stores tokens + user
```

### Signup Users
```javascript
const response = await authApiService.signup(email, password);
// User created, redirect to login
```

### Check if Authenticated
```javascript
import { isAuthenticated, getCurrentUser } from "../utils/authStorage";

if (isAuthenticated()) {
  const user = getCurrentUser();
  console.log(user.email, user.role);
}
```

### Logout User
```javascript
import { logoutUser } from "../utils/authStorage";

logoutUser();  // Clears tokens and redirects
```

## 🔐 Security Features Implemented

✅ JWT Token Storage (localStorage)
✅ Automatic Token Refresh
✅ Authorization Headers on All Requests
✅ 401 Error Handling
✅ Protected Routes
✅ Secure Password Requirements (8+ chars)
✅ CORS Support

## 📋 Backend Checklist

Before testing, ensure your Django backend has:

- [ ] User signup endpoint: `POST /api/signup/`
- [ ] User login endpoint: `POST /api/login/`
- [ ] Token refresh endpoint: `POST /api/token/refresh/`
- [ ] Google OAuth endpoint: `POST /api/auth/google/`
- [ ] CORS configured for `http://localhost:5173`
- [ ] JWT tokens included in responses
- [ ] User object with `id`, `email`, `role` fields

## 🧪 Testing Checklist

- [ ] Start Django: `python manage.py runserver`
- [ ] Start React: `npm run dev`
- [ ] Test signup at http://localhost:5173/signup
- [ ] Test login at http://localhost:5173/login
- [ ] Verify tokens in localStorage (DevTools → Application)
- [ ] Test logout clears tokens
- [ ] Test protected routes redirect to login

## 📱 localStorage Keys

After login, check DevTools → Application → localStorage:

```
access_token    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
refresh_token   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
crm_user        {"id":1,"email":"user@example.com","role":"User",...}
```

## 🔄 API Request Flow

```
Component calls authApiService.login()
    ↓
Request interceptor adds: Authorization: Bearer {token}
    ↓
Request sent to Django /api/login/
    ↓
Django returns: { access, refresh, user }
    ↓
Frontend stores tokens in localStorage
    ↓
All future requests include Bearer token
    ↓
If 401 error → Auto refresh → Retry request
```

## ⚙️ Configuration

### Backend
- **API Base URL**: `http://127.0.0.1:8000/api`
- **Access Token Lifetime**: 5 minutes (default)
- **Refresh Token Lifetime**: 1 day (default)

### Frontend
- **Token Storage**: localStorage
- **Auto Refresh**: Enabled on 401
- **CORS**: Configured in Django

## 🆘 Troubleshooting

### "Cannot read property 'access' of undefined"
→ Backend not returning correct response format
→ Check backend returns: `{ access, refresh, user }`

### "401 Unauthorized" errors
→ Token expired, auto-refresh should handle it
→ If persists, check token refresh endpoint

### CORS errors
→ Add frontend URL to Django `CORS_ALLOWED_ORIGINS`
→ Restart Django server

### Login page not redirecting
→ Check browser console for errors
→ Verify navigate("/dashboard") is being called
→ Check DashboardLayout component exists

## 📚 Documentation

- `AUTHENTICATION_INTEGRATION.md` - Complete guide
- `INTEGRATION_COMPLETED.md` - What was done
- `GOOGLE_OAUTH_SETUP.md` - Google Sign-In setup

## 🎁 Bonus: Google OAuth

Not implemented yet, but ready! See `GOOGLE_OAUTH_SETUP.md`:

1. Install `@react-oauth/google`
2. Add `GoogleOAuthProvider` to App.jsx
3. Add `<GoogleLogin>` component to Login.jsx
4. Done!

## 🔗 API Endpoints

Your backend needs these endpoints:

```
POST /api/signup/
  Body: { email, password }
  Response: { detail: "User registered successfully" }

POST /api/login/
  Body: { email, password }
  Response: { access, refresh, user }

POST /api/token/refresh/
  Body: { refresh: string }
  Response: { access: string }

POST /api/auth/google/
  Body: { id_token: string }
  Response: { access, refresh, user }
```

## 💡 Tips

1. **Token Debugging**: Open DevTools → Console → `localStorage.getItem('access_token')`
2. **Request Debugging**: Check Network tab to see Authorization header
3. **Error Debugging**: Check Network tab Response to see backend error message
4. **Storage Event**: Component reloads when token changes (auto-sync)

## 🎯 Next Steps

1. Verify all backend endpoints are working
2. Test signup and login flows
3. Implement Google OAuth (optional)
4. Add protected routes to your dashboard pages
5. Deploy to production (update API URL)

---

**Need Help?** Check the detailed documentation files or review the example implementations in Login.jsx and Signup.jsx!
