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
  return stored ? JSON.parse(stored) : null;
};
