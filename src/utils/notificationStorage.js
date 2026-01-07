const STORAGE_KEY = 'crm_notifications';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Deal Won!",
    message: "The 'Website Redesign' deal has been marked as Won.",
    type: "success",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    read: false
  },
  {
    id: 2,
    title: "New Lead Assigned",
    message: "You have been assigned a new lead: Sarah Smith.",
    type: "info",
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    read: false
  },
  {
    id: 3,
    title: "Task Overdue",
    message: "The task 'Follow up with MicroDesign' was due yesterday.",
    type: "warning",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: true
  }
];

export const getNotifications = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_NOTIFICATIONS));
    return MOCK_NOTIFICATIONS;
  }
  return JSON.parse(stored);
};

export const addNotification = (notification) => {
  const current = getNotifications();
  const newNotif = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    read: false,
    ...notification
  };
  const updated = [newNotif, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("storage")); // Trigger updates
  window.dispatchEvent(
    new CustomEvent("new-notification", { detail: newNotif })
  );
  return newNotif;
};

export const markAsRead = (id) => {
  const current = getNotifications();
  const updated = current.map(n => 
    n.id === id ? { ...n, read: true } : n
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
};

export const markAllAsRead = () => {
    const current = getNotifications();
    const updated = current.map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
};

export const clearNotifications = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event("storage"));
};
