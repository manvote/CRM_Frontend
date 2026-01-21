import React, { useState } from "react";
import { setDemoRole, getCurrentUser } from "../../utils/authStorage";
import { ROLES } from "../../utils/permissions";
import { Settings } from "lucide-react";

const RoleSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = getCurrentUser();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200 mb-2 w-48 animate-in slide-in-from-bottom-2">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2">
            Dev: Switch Role
          </div>
          <div className="space-y-1">
            {Object.values(ROLES).map((role) => (
              <button
                key={role}
                onClick={() => setDemoRole(role)}
                className={`w-full text-left px-2 py-1.5 text-sm rounded ${currentUser?.role === role ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        title="Developer Actions"
      >
        <Settings size={20} />
      </button>
    </div>
  );
};

export default RoleSwitcher;
