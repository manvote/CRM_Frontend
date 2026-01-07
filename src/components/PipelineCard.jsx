import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MoreHorizontal,
  Link as LinkIcon,
  Clock,
  Linkedin,
  Briefcase,
  Mail,
} from "lucide-react";

const PipelineCard = ({ lead, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <Link
            to={`/leads/${lead.id}`}
            className="font-semibold text-gray-900 hover:text-blue-600 hover:underline"
          >
            {lead.name}
          </Link>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreHorizontal size={18} />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                onClick={() => {
                  setShowMenu(false);
                  onDelete(lead.id);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span className="w-4 flex justify-center text-gray-400">
            <Briefcase size={14} />
          </span>
          <span>{lead.company}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 flex justify-center text-gray-400">
            <Briefcase size={14} />
          </span>
          <span>{lead.jobTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 flex justify-center text-gray-400">
            <Mail size={14} />
          </span>
          <span className="truncate">{lead.email}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 flex justify-center text-gray-400">
            <LinkIcon size={14} />
          </span>
          <a
            href={lead.website || "#"}
            className="text-blue-500 hover:underline truncate"
            target="_blank"
            rel="noopener noreferrer"
          >
            {lead.website || "No Website"}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 flex justify-center text-gray-400">
            <Linkedin size={14} />
          </span>
          <span>{lead.platform}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-900 font-medium">
          <span className="w-4 flex justify-center text-gray-400">₹</span>
          <span>{lead.value || "0"}</span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-50 mt-2">
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            Source: {lead.source || "Website"}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Owner:</span>
            <span className="font-medium text-gray-700">
              {lead.owner || "Unassigned"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} />
          <span>{lead.lastContacted}</span>
        </div>
      </div>
    </div>
  );
};

export default PipelineCard;
