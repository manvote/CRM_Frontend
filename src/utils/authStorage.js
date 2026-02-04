const STORAGE_KEY = 'crm_user';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Store user data and tokens after successful login
 * @param {Object} data - Response from backend containing access, refresh, and user info
 */
export const loginUser = (data) => {
  const { access, refresh, user } = data;
  
  // Store tokens
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  
  // Store user info
  const userData = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.email.split('@')[0],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  window.dispatchEvent(new Event("storage"));
  return userData;
};

/**
 * Clear all authentication data
 */
export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event("storage"));
};

/**
 * Get currently logged-in user
 */
export const getCurrentUser = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get access token
 */
export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Decode JWT token (without verification - client-side only)
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null if invalid
 */
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // Check if token expires in the next 30 seconds (buffer time)
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime + 30;
};

/**
 * Check if access token needs refresh
 * @returns {boolean} - True if token needs refresh
 */
export const needsTokenRefresh = () => {
  const accessToken = getAccessToken();
  return isTokenExpired(accessToken);
};
