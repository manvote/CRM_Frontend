import { getCurrentUser } from "./authStorage";

export const ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  SALES: "Sales",
};

export const PERMISSIONS = {
  DELETE_LEAD: [ROLES.ADMIN, ROLES.MANAGER],
  EXPORT_DATA: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_REVENUE: [ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_TEAM: [ROLES.ADMIN],
};

export const hasPermission = (permission) => {
  const user = getCurrentUser();
  if (!user || !user.role) return false; // Default to no access if no role
  
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles ? allowedRoles.includes(user.role) : false;
};

export const getUserRole = () => {
    const user = getCurrentUser();
    return user?.role || ROLES.SALES; // Default to Sales if undefined
};
