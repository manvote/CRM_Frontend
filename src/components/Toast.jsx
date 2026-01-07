import React, { useState, useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info, Bell } from "lucide-react";

const SUCCESS_SOUND =
  "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; // Placeholder, will replace with real short beep

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNewNotification = (e) => {
      const notif = e.detail;
      addToast(notif);
      playSound();
    };

    window.addEventListener("new-notification", handleNewNotification);
    return () =>
      window.removeEventListener("new-notification", handleNewNotification);
  }, []);

  const addToast = (notif) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...notif, internalId: id }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (internalId) => {
    setToasts((prev) => prev.filter((t) => t.internalId !== internalId));
  };

  const playSound = () => {
    try {
      // Simple beep using AudioContext for a more pleasant "ping" if possible,
      // but for simplicity/reliability without external assets, we use a generated beep or short URI.
      // Let's use a standard "ding" sound encoded in base64.
      // Short "Ding" Sound
      const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      );
      audio.volume = 0.5;
      audio
        .play()
        .catch((e) =>
          console.log("Audio play failed (interaction needed first):", e)
        );
    } catch (error) {
      console.error("Sound error:", error);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.internalId}
          className={`pointer-events-auto min-w-[300px] max-w-sm bg-white rounded-xl shadow-2xl border-l-4 p-4 flex gap-3 items-start animate-in slide-in-from-right fade-in duration-300 ${
            toast.type === "success"
              ? "border-green-500"
              : toast.type === "warning"
              ? "border-yellow-500"
              : toast.type === "error"
              ? "border-red-500"
              : "border-blue-500"
          }`}
        >
          <div
            className={`mt-0.5 ${
              toast.type === "success"
                ? "text-green-500"
                : toast.type === "warning"
                ? "text-yellow-500"
                : toast.type === "error"
                ? "text-red-500"
                : "text-blue-500"
            }`}
          >
            {toast.type === "success" && <CheckCircle size={20} />}
            {toast.type === "warning" && <AlertTriangle size={20} />}
            {toast.type === "error" && <AlertTriangle size={20} />}
            {toast.type === "info" && <Info size={20} />}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-sm leading-tight">
              {toast.title}
            </h4>
            <p className="text-gray-600 text-xs mt-1 leading-snug">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.internalId)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
