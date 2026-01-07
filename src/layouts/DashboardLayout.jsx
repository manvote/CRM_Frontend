import React, { useState, useEffect } from "react";
import { getCurrentUser, logoutUser } from "../utils/authStorage";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { getEvents } from "../utils/calendarStorage";
import { addNotification } from "../utils/notificationStorage";
import Toast from "../components/Toast";
import { format } from "date-fns";
import {
  LayoutDashboard,
  Users,
  Filter,
  ClipboardList,
  Calendar,
  Bell,
  Settings,
  Search,
  Info,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const u = getCurrentUser();
      setUser(
        u || {
          name: "Guest User",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
        }
      );
    };
    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  // Check for reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentDay = format(now, "yyyy-MM-dd");
      const currentTime = format(now, "HH:mm"); // e.g., "09:00"

      const events = getEvents();
      events.forEach((event) => {
        // Simple match: if event date and start time match current minute
        // Note: This relies on exact HH:mm match.
        // Since interval is 60s, it should catch it once.
        if (event.date === currentDay && event.start === currentTime) {
          addNotification({
            title: "Reminder: " + event.title,
            message: `Starting now: ${event.type} at ${event.start}`,
            type: "warning", // or info
          });
        }
      });
    };

    // Check immediately on mount, then every 60s
    // Aligning to the start of the minute would be better, but simple interval is OK for MVP
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      <Toast />
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 flex flex-col z-50 transform transition-all duration-200 ease-in-out md:relative md:translate-x-0 ${
          isCollapsed ? "md:w-20" : "md:w-64"
        } w-64 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Area */}
          <div
            className={`p-6 flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div
              className={`flex items-center gap-2 ${
                isCollapsed ? "hidden" : "flex"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xl font-bold text-blue-900 leading-tight">
                  MANOVATE
                </span>
                <span className="text-[10px] tracking-widest text-slate-500 font-semibold">
                  TECHNOLOGIES
                </span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={closeSidebar}
              className="text-gray-400 hover:text-gray-600 rounded-md border border-gray-300 p-1 md:hidden"
            >
              <X size={16} />
            </button>
            {/* Desktop Collapse Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`text-gray-400 hover:text-gray-600 rounded-md border border-gray-300 p-1 hidden md:block ${
                isCollapsed ? "mx-auto" : ""
              }`}
            >
              {isCollapsed ? (
                <ChevronsRight size={16} />
              ) : (
                <ChevronsLeft size={16} />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-4 space-y-1 mt-4 flex-1 overflow-y-auto custom-scrollbar">
            <NavItem
              isCollapsed={isCollapsed}
              to="/dashboard"
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              onClick={closeSidebar}
            />
            <div className="my-4"></div> {/* Spacer */}
            <NavItem
              isCollapsed={isCollapsed}
              to="/leads"
              icon={<Users size={20} />}
              label="Leads"
              onClick={closeSidebar}
            />
            <NavItem
              isCollapsed={isCollapsed}
              to="/deals"
              icon={<Filter size={20} />}
              label="Deals / Pipeline"
              onClick={closeSidebar}
            />
            <NavItem
              isCollapsed={isCollapsed}
              to="/tasks"
              icon={<ClipboardList size={20} />}
              label="Tasks"
              onClick={closeSidebar}
            />
            <NavItem
              isCollapsed={isCollapsed}
              to="/calendar"
              icon={<Calendar size={20} />}
              label="Calendar"
              onClick={closeSidebar}
            />
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 space-y-1">
          <NavItem
            isCollapsed={isCollapsed}
            to="/notifications"
            icon={<Bell size={20} />}
            label="Notification"
            onClick={closeSidebar}
          />
          <NavItem
            isCollapsed={isCollapsed}
            to="/settings"
            icon={<Settings size={20} />}
            label="Settings"
            onClick={closeSidebar}
          />

          <div
            className={`mt-6 pt-6 border-t border-gray-100 flex items-center gap-3 px-3 pb-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
              <img src={user?.avatar} alt="User" />
            </div>
            {!isCollapsed && (
              <span className="font-medium text-sm text-gray-700 truncate">
                {user?.name}
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Mobile Logo (simplified) */}
            <div
              className={`md:hidden font-bold text-blue-900 text-lg ${
                isSearchOpen ? "hidden" : "block"
              }`}
            >
              MANOVATE
            </div>

            {/* Search */}
            <div
              className={`relative w-full max-w-xs md:block ${
                isSearchOpen
                  ? "block absolute left-12 right-12 top-3 z-50"
                  : "hidden"
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm shadow-sm md:shadow-none"
                placeholder="Search..."
                onBlur={() => setIsSearchOpen(false)} // Close on blur for mobile
                autoFocus={isSearchOpen}
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full bg-gray-50"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
            <button
              onClick={() => navigate("/notifications")}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full bg-gray-50 relative"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full bg-gray-50 hidden md:block">
              <Info size={18} />
            </button>
            <div className="hidden md:block h-8 w-px bg-gray-200 mx-1"></div>
            <div
              className="group relative flex items-center gap-2 cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                  <img src={user?.avatar} alt="Profile" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </div>

              {/* Dropdown for Logout */}
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileOpen(false);
                    }}
                  ></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 transition-all z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs font-semibold text-gray-500">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        logoutUser();
                        navigate("/login");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Helper Component for Navigation Items
const NavItem = ({ to, icon, label, onClick, isCollapsed }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-900 text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        } ${isCollapsed ? "justify-center" : ""}`
      }
      title={isCollapsed ? label : ""}
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </NavLink>
  );
};

export default DashboardLayout;
