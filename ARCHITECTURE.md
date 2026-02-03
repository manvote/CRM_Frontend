# Architecture Diagram & API Reference

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React CRM Frontend                        │
│                    (http://localhost:5173)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐        ┌─────────────────────────┐   │
│  │   Login.jsx          │        │   Signup.jsx            │   │
│  ├──────────────────────┤        ├─────────────────────────┤   │
│  │ • Email input        │        │ • Full Name input       │   │
│  │ • Password input     │        │ • Email input           │   │
│  │ • Submit button      │        │ • Password input        │   │
│  │ • Error display      │        │ • Error/Success display │   │
│  └──────────┬───────────┘        └──────────┬──────────────┘   │
│             │                               │                   │
│             ▼                               ▼                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │      authApiService (src/services/authApi.js)          │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ • login(email, password)                               │   │
│  │ • signup(email, password)                              │   │
│  │ • googleLogin(idToken)                                 │   │
│  │ • logout()                                             │   │
│  └──────────┬──────────────────────────┬──────────────────┘   │
│             │                          │                       │
│      ┌──────▼────────┐         ┌──────▼──────────┐            │
│      │  Request      │         │  Response       │            │
│      │ Interceptor   │         │ Interceptor     │            │
│      ├───────────────┤         ├─────────────────┤            │
│      │ Add Bearer    │         │ Auto-refresh    │            │
│      │ token to      │         │ on 401 error    │            │
│      │ headers       │         │                 │            │
│      └──────┬────────┘         └────────┬────────┘            │
│             │                          │                      │
│             └──────────────┬───────────┘                      │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                   HTTP/CORS  │  
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Django REST API                            │
│                (http://127.0.0.1:8000/api)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  /signup/    │  │  /login/     │  │ /token/refresh/    │   │
│  ├──────────────┤  ├──────────────┤  ├────────────────────┤   │
│  │ POST         │  │ POST         │  │ POST               │   │
│  │ email        │  │ email        │  │ refresh token      │   │
│  │ password     │  │ password     │  │                    │   │
│  │              │  │              │  │ Returns:           │   │
│  │ Returns:     │  │ Returns:     │  │ access token       │   │
│  │ {detail}     │  │ {access,     │  │                    │   │
│  │              │  │  refresh,    │  │                    │   │
│  │              │  │  user}       │  │                    │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────┐  ┌────────────────────────────┐ │
│  │   /auth/google/          │  │  Other API Endpoints       │ │
│  ├──────────────────────────┤  ├────────────────────────────┤ │
│  │ POST                     │  │ All require Bearer token   │ │
│  │ id_token (Google)        │  │ Authorization: Bearer ... │ │
│  │                          │  │                            │ │
│  │ Returns: {access,        │  │ Example:                   │ │
│  │           refresh,       │  │ GET /leads/ (list leads)   │ │
│  │           user}          │  │ POST /leads/ (create lead) │ │
│  └──────────────────────────┘  └────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Django User Model                          │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ • id (primary key)                                     │   │
│  │ • username (set to email)                              │   │
│  │ • email                                                │   │
│  │ • password (hashed)                                    │   │
│  │ • is_active                                            │   │
│  │ • is_superuser (for role)                              │   │
│  │ • date_joined                                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App.jsx
├── AuthLayout
│   ├── Login
│   │   └── authApiService.login()
│   ├── Signup
│   │   └── authApiService.signup()
│   └── ForgotPassword
│
└── DashboardLayout (with ProtectedRoute wrapper)
    ├── Dashboard
    ├── Leads
    ├── LeadProfile
    ├── AddLead
    ├── Deals
    ├── Tasks
    ├── Calendar
    ├── Notifications
    └── (all use loginUser, getCurrentUser, logoutUser)
```

---

## Data Flow - Complete Request Cycle

### Login Request Flow

```
┌─ User clicks "Sign In" button
│
├─ handleSubmit() calls authApiService.login(email, password)
│
├─ authApi.post("/login/", {email, password})
│
├─ REQUEST INTERCEPTOR
│   ├─ Check localStorage for access_token
│   ├─ If exists: add to headers
│   │  Authorization: Bearer eyJhbGc...
│   └─ Send request
│
├─ DJANGO BACKEND
│   ├─ /api/login/ endpoint
│   ├─ Validate email exists
│   ├─ Validate password
│   ├─ Generate JWT tokens
│   ├─ Return response:
│   │  {
│   │    "access": "eyJhbGc...",
│   │    "refresh": "eyJhbGc...",
│   │    "user": {
│   │      "id": 1,
│   │      "email": "user@example.com",
│   │      "role": "User"
│   │    }
│   │  }
│   └─ Send response
│
├─ RESPONSE INTERCEPTOR
│   ├─ Check response status
│   ├─ If 200 OK: pass through
│   └─ If 401: attempt refresh
│
├─ Component receives response
│
├─ loginUser(response.data)
│   ├─ localStorage.setItem("access_token", access)
│   ├─ localStorage.setItem("refresh_token", refresh)
│   ├─ localStorage.setItem("crm_user", {id, email, role, ...})
│   └─ window.dispatchEvent("storage")
│
├─ navigate("/dashboard")
│
└─ ✅ User logged in!
```

### Subsequent API Request Flow

```
┌─ Component calls: await authApi.get("/leads/")
│
├─ REQUEST INTERCEPTOR
│   ├─ Get access_token from localStorage
│   ├─ Add to headers:
│   │  Authorization: Bearer eyJhbGc...
│   └─ Send request
│
├─ DJANGO BACKEND
│   ├─ Verify JWT token
│   ├─ Extract user from token
│   ├─ Process request (/leads/)
│   ├─ Return response (200 OK)
│   └─ Send response
│
└─ ✅ Component receives data
```

### Token Refresh Flow (when access token expires)

```
┌─ Component calls: await authApi.get("/leads/")
│
├─ REQUEST INTERCEPTOR
│   ├─ Get access_token from localStorage
│   ├─ Add to headers: Authorization: Bearer eyJhbGc...
│   └─ Send request
│
├─ DJANGO BACKEND
│   ├─ Verify JWT token
│   ├─ Token is EXPIRED ❌
│   └─ Return 401 Unauthorized
│
├─ RESPONSE INTERCEPTOR
│   ├─ Detect 401 error
│   ├─ Get refresh_token from localStorage
│   ├─ POST /api/token/refresh/
│   │  {refresh: "eyJhbGc..."}
│   │
│   ├─ DJANGO BACKEND
│   │  ├─ Verify refresh token
│   │  ├─ Generate NEW access token
│   │  └─ Return {access: "new_eyJhbGc..."}
│   │
│   ├─ Update localStorage
│   │  localStorage.setItem("access_token", new_access)
│   │
│   ├─ Retry original request
│   │  With new token in Authorization header
│   │
│   ├─ DJANGO BACKEND
│   │  ├─ Verify NEW token ✅
│   │  ├─ Process request (/leads/)
│   │  └─ Return response
│   │
│   └─ Pass response to component
│
└─ ✅ Component receives data (automatic refresh!)
```

---

## Token Structure

### Access Token (JWT)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOjEsImlhdCI6MTcwMzk5NjMwMCwiZXhwIjoxNzAzOTk2NjAwfQ.
[signature]

Header: {alg: "HS256", typ: "JWT"}
Payload: {
  sub: 1 (user id),
  iat: 1703996300 (issued at),
  exp: 1703996600 (expires in 5 minutes)
}
Signature: HMAC-SHA256(header.payload, secret_key)
```

### Refresh Token (JWT)
```
Longer expiration (24 hours)
Can only be used to get new access tokens
Cannot access protected endpoints directly
```

---

## localStorage Schema

```javascript
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "crm_user": {
    "id": 1,
    "email": "user@example.com",
    "role": "Admin" | "User",
    "name": "user",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=..."
  }
}
```

---

## HTTP Headers

### Request Headers
```
POST /api/login/ HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json
Content-Length: 47

{"email": "user@example.com", "password": "pass123"}
```

### Response Headers (Login)
```
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:5173

{
  "access": "eyJhbGc...",
  "refresh": "eyJhbGc...",
  "user": {...}
}
```

### Request Headers (with Bearer Token)
```
GET /api/leads/ HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## Error Response Codes

```
200 OK
├─ Login/Signup successful
├─ API call successful
└─ Token refresh successful

201 Created
├─ User account created
└─ Resource created

400 Bad Request
├─ Invalid email format
├─ Password too short (< 8 chars)
├─ Missing required fields
└─ Invalid request data

401 Unauthorized
├─ Invalid credentials (wrong password)
├─ Token expired
├─ Invalid/malformed token
└─ Missing Authorization header

403 Forbidden
├─ Insufficient permissions
└─ Access to resource denied

404 Not Found
└─ Endpoint not found

500 Server Error
├─ Database error
├─ Server error
└─ Unexpected error
```

---

## CORS Flow

```
┌─ Browser detects Cross-Origin request
│  (http://localhost:5173 → http://127.0.0.1:8000)
│
├─ Browser sends OPTIONS request (preflight)
│  OPTIONS /api/login/
│  Origin: http://localhost:5173
│  Access-Control-Request-Method: POST
│
├─ Django processes preflight
│  ├─ Checks CORS_ALLOWED_ORIGINS
│  ├─ Verifies method is allowed
│  └─ Sends CORS headers back
│
├─ Browser receives CORS headers
│  Access-Control-Allow-Origin: http://localhost:5173
│  Access-Control-Allow-Methods: GET, POST, etc.
│
├─ If preflight passes: browser sends actual request
│  ├─ POST /api/login/
│  ├─ With credentials (Authorization header)
│  └─ Request proceeds
│
├─ Django handles actual request
│  ├─ Processes login
│  ├─ Returns response with CORS headers
│  └─ Response delivered to frontend
│
└─ ✅ Request/response successful
```

**Required Django Configuration:**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
```

---

## State Management Flow

```
Login Form
  │ input: email, password
  │ state: {email, password, loading, error}
  │
  ├─ User clicks "Sign In"
  │  └─ handleSubmit() → authApiService.login()
  │
  └─ Response
     ├─ Success: loginUser(response.data)
     │  ├─ Store in localStorage
     │  ├─ Fire "storage" event
     │  └─ navigate("/dashboard")
     │
     └─ Error: setError(error_message)
        └─ Display error to user
```

---

## Security Considerations

```
┌─ User Authentication
│  ├─ Password hashed in Django (bcrypt/PBKDF2)
│  ├─ Never transmitted in plain text
│  ├─ HTTPS required in production
│  └─ Minimum 8 characters enforced
│
├─ Token Security
│  ├─ Access tokens short-lived (5 mins)
│  ├─ Refresh tokens longer-lived (1 day)
│  ├─ Both stored in localStorage (XSS vulnerable)
│  ├─ Should use HttpOnly cookies in production
│  └─ Signed with secret key (HS256)
│
├─ Communication Security
│  ├─ HTTPS/TLS encryption
│  ├─ CORS validation
│  ├─ User-Agent validation (optional)
│  └─ Rate limiting (recommended)
│
├─ Session Security
│  ├─ Tokens tied to user ID
│  ├─ Invalid token = logout + redirect
│  ├─ Token revocation on logout
│  └─ Automatic refresh without user action
│
└─ Production Recommendations
   ├─ Use HttpOnly Secure cookies
   ├─ Implement CSRF tokens
   ├─ Add rate limiting
   ├─ Monitor failed login attempts
   ├─ Implement 2FA (optional)
   └─ Regular security audits
```

---

## Performance Optimization

```
Request Performance
├─ Token validation in memory (< 1ms)
├─ No DB call for every request
├─ JWT decoded locally on backend
├─ Minimal overhead (~5-10ms per request)
│
Token Refresh Optimization
├─ Automatic in background
├─ No user interruption
├─ One retry per request
├─ Prevents multiple refresh attempts
│
localStorage Performance
├─ Immediate read/write
├─ No network latency
├─ Synced across browser tabs
├─ Cleared on logout
└─ ~1-2ms per operation
```

---

**This architecture ensures secure, scalable, and efficient authentication across your CRM application.**
