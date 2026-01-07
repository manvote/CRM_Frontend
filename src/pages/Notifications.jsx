import React, { useState, useEffect } from "react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} from "../utils/notificationStorage";
import {
  Bell,
  Check,
  Trash2,
  Clock,
  Info,
  CheckCircle, // Keeping check circle, usually safe
  AlertCircle, // Replacing AlertTriangle which is often renamed to TriangleAlert
} from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'unread'

  useEffect(() => {
    const load = () => setNotifications(getNotifications());
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.read : true
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500" size={20} />;
      case "warning":
        return <AlertCircle className="text-orange-500" size={20} />;
      case "error":
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50";
      case "warning":
        return "bg-orange-50";
      case "error":
        return "bg-red-50";
      default:
        return "bg-blue-50";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="text-gray-400" /> Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your updates and alerts.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Check size={16} /> Mark all read
          </button>
          <button
            onClick={() => {
              if (window.confirm("Clear all notifications?"))
                clearNotifications();
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={16} /> Clear all
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`pb-3 text-sm font-medium px-1 border-b-2 transition-colors ${
            filter === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`pb-3 text-sm font-medium px-1 border-b-2 transition-colors ${
            filter === "unread"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Unread
        </button>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl border transition-all ${
                notification.read
                  ? "bg-white border-gray-200 opacity-75"
                  : "bg-white border-blue-200 shadow-sm border-l-4 border-l-blue-500"
              }`}
            >
              <div className="flex gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getBgColor(
                    notification.type
                  )}`}
                >
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3
                      className={`text-sm font-bold ${
                        notification.read ? "text-gray-700" : "text-gray-900"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs font-bold text-blue-600 mt-2 hover:underline"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell size={32} />
            </div>
            <h3 className="text-gray-900 font-medium">
              No {filter} notifications
            </h3>
            <p className="text-gray-500 text-sm">You are all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
