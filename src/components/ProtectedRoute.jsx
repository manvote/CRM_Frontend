import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/authStorage";

/**
 * Protected route wrapper that redirects to login if not authenticated
 */
export const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
