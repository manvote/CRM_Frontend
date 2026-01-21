import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import RoleSwitcher from "./components/common/RoleSwitcher";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import SignupDetails from "./pages/SignupDetails";
import TeamInvite from "./pages/TeamInvite";
import ForgotPassword from "./pages/ForgotPassword";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import AddLead from "./pages/AddLead";
import LeadProfile from "./pages/LeadProfile";
import Deals from "./pages/Deals";
import Notifications from "./pages/Notifications";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <RoleSwitcher />
      <Routes>
        {/* Standalone Route for Signup Details */}
        <Route path="/signup-details" element={<SignupDetails />} />
        <Route path="/team-invite" element={<TeamInvite />} />

        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/new" element={<AddLead />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/leads/:id" element={<LeadProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          {/* Add other dashboard routes here as they are created */}
        </Route>

        {/* Auth Layout for other pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
