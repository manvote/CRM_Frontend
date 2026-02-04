import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

/**
 * Tooltip Component for First-Time Users
 * @param {string} id - Unique identifier for the tooltip (used for localStorage persistence)
 * @param {string} text - The helpful text to display
 * @param {React.ReactNode} children - The element to wrap/point to
 * @param {string} position - 'top', 'bottom', 'left', 'right' (default: 'top')
 */
const Tooltip = ({ id, text, children, position = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`tooltip_dismissed_${id}`);
    if (!dismissed) {
      // Small delay to appear more natural
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const dismiss = (e) => {
    e.stopPropagation(); // Prevent triggering parent clicks
    setIsVisible(false);
    localStorage.setItem(`tooltip_dismissed_${id}`, "true");
  };

  if (!isVisible) return children;

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative inline-block">
      {children}
      <div
        className={`absolute z-50 w-48 p-3 bg-blue-600 text-white text-xs rounded-lg shadow-lg animate-in fade-in zoom-in duration-300 ${positionClasses[position]}`}
      >
        <div className="relative">
          <p className="pr-4 leading-relaxed">{text}</p>
          <button
            onClick={dismiss}
            className="absolute -top-1 -right-1 p-0.5 hover:bg-blue-500 rounded-full transition-colors"
            aria-label="Dismiss tooltip"
          >
            <X size={12} />
          </button>

          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-4 border-transparent ${
              position === "top"
                ? "border-t-blue-600 top-full left-1/2 -translate-x-1/2"
                : position === "bottom"
                  ? "border-b-blue-600 bottom-full left-1/2 -translate-x-1/2"
                  : position === "left"
                    ? "border-l-blue-600 left-full top-1/2 -translate-y-1/2"
                    : "border-r-blue-600 right-full top-1/2 -translate-y-1/2"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
