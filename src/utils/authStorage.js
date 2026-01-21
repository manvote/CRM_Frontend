const STORAGE_KEY = 'crm_user';

export const loginUser = (email) => {
  const user = {
    name: email.split('@')[0],
    email: email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    role: "Admin"
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("storage"));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("storage"));
};

export const getCurrentUser = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  
  // Default mock user if not logged in
  return {
    id: 1,
    name: "Demo User",
    email: "demo@example.com",
    role: localStorage.getItem("demo_role") || "Admin" 
  };
};

export const setDemoRole = (role) => {
    localStorage.setItem("demo_role", role);

    // If a user is logged in, update their role too so it takes effect
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        const user = JSON.parse(stored);
        user.role = role;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }

    window.location.reload(); 
};
