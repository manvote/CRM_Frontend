# Google OAuth Integration Guide

## Backend Setup (Django)

Your backend already has Google OAuth support! The endpoint is ready at:
```
POST /api/auth/google/
```

### Required Backend Configuration

1. **Install Google Auth Library:**
```bash
pip install google-auth-oauthlib
```

2. **Settings.py:**
```python
# settings.py
GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID_FROM_GOOGLE_CONSOLE.apps.googleusercontent.com"
```

3. **Update views.py** (if needed):
```python
# Your backend already has this!
class GoogleLoginAPIView(APIView):
    def post(self, request):
        token = request.data.get("id_token")
        # ... validation and user creation ...
        return Response({
            "message": "Google login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {...},
        })
```

## Frontend Setup (React)

### Step 1: Install Google OAuth Library

```bash
npm install @react-oauth/google
```

### Step 2: Update App.jsx

Wrap your app with GoogleOAuthProvider:

```jsx
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="YOUR_CLIENT_ID.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
```

### Step 3: Add Google Sign-In Button to Login.jsx

Add this after your password input field:

```jsx
import { GoogleLogin } from '@react-oauth/google';

// Inside Login component, after password field:
<div className="mt-6">
  <GoogleLogin
    onSuccess={(credentialResponse) => {
      handleGoogleLogin(credentialResponse.credential);
    }}
    onError={() => {
      setError("Google login failed. Please try again.");
    }}
  />
</div>

// Add this function:
const handleGoogleLogin = async (idToken) => {
  setLoading(true);
  setError("");
  
  try {
    const response = await authApiService.googleLogin(idToken);
    loginUser(response.data);
    navigate("/dashboard");
  } catch (err) {
    setError(
      err.response?.data?.detail ||
        "Google login failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};
```

### Step 4: Update Signup.jsx (Optional)

Add Google Sign-Up option:

```jsx
import { GoogleLogin } from '@react-oauth/google';

// Inside Signup component form:
<div className="mt-6">
  <div className="relative mb-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300"></div>
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-gray-500">Or sign up with</span>
    </div>
  </div>
  
  <GoogleLogin
    onSuccess={(credentialResponse) => {
      handleGoogleSignup(credentialResponse.credential);
    }}
    onError={() => {
      setError("Google signup failed. Please try again.");
    }}
  />
</div>

// Add this function:
const handleGoogleSignup = async (idToken) => {
  setLoading(true);
  setError("");
  
  try {
    const response = await authApiService.googleLogin(idToken);
    loginUser(response.data);
    navigate("/dashboard");
  } catch (err) {
    setError(
      err.response?.data?.detail ||
        "Google signup failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};
```

## Get Your Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project

3. Enable Google+ API:
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "Credentials" in left sidebar
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000`
     - `http://localhost:5173` (if using Vite)
     - `http://127.0.0.1:5173`
   - Copy the "Client ID"

5. Update your code:
   - Add CLIENT_ID to both backend and frontend
   - Backend: `settings.py` → `GOOGLE_CLIENT_ID`
   - Frontend: `App.jsx` or `main.jsx` → `GoogleOAuthProvider`

## Complete Example: Updated Login.jsx

```jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { loginUser } from "../utils/authStorage";
import { authApiService } from "../services/authApi";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await authApiService.login(email, password);
      loginUser(response.data);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken) => {
    setLoading(true);
    setError("");
    
    try {
      const response = await authApiService.googleLogin(idToken);
      loginUser(response.data);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Google login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in-up">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Sign in to get started
        </h2>
        <p className="text-sm text-gray-500">
          Enter your credentials to continue
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Email & Password Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-500">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-500">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl pr-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 text-white bg-[#344054] rounded-xl hover:bg-gray-800 transition disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      {/* Google Sign-In */}
      <div className="mb-8">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            handleGoogleLogin(credentialResponse.credential);
          }}
          onError={() => {
            setError("Google login failed. Please try again.");
          }}
        />
      </div>

      <p className="mt-8 text-sm text-center text-gray-500">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-blue-500 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
```

## Troubleshooting

### Error: "CORS policy..."
- Add your frontend URL to Django CORS settings
- Add your frontend URL to Google OAuth redirect URIs

### Error: "Invalid Client ID"
- Check Client ID is correctly copied
- Verify it's for Web application, not iOS/Android
- Check it matches in both frontend and backend

### Google Login Button Not Appearing
- Verify GoogleOAuthProvider wraps your app
- Check Client ID is provided to GoogleOAuthProvider
- Check console for errors

### "403 Forbidden" on Backend
- Verify GOOGLE_CLIENT_ID in settings.py matches frontend
- Check backend is verifying token with Google servers
- Verify Google+ API is enabled in Cloud Console

## Testing

1. Install dependencies:
```bash
npm install @react-oauth/google
```

2. Update main.jsx or App.jsx with GoogleOAuthProvider

3. Test login page - Google button should appear

4. Click button and complete Google sign-in

5. Should redirect to dashboard with tokens stored
