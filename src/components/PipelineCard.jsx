import React from "react";
import {
  MoreHorizontal,
  Link as LinkIcon,
  Clock,
  Linkedin,
} from "lucide-react";

const PipelineCard = ({ lead }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-gray-900">{lead.name}</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span className="w-4 flex justify-center text-gray-400">
            <img
              src="/src/assets/manovate.svg"
              className="w-3 h-3 object-contain grayscale opacity-60"
            />
          </span>
          <span>{lead.company}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 flex justify-center text-gray-400">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </span>
          <span>{lead.jobTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 flex justify-center text-gray-400">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </span>
          <span className="truncate">{lead.email}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 flex justify-center text-gray-400">
            <LinkIcon size={14} />
          </span>
          <a
            href={lead.website}
            className="text-blue-500 hover:underline truncate"
            target="_blank"
            rel="noopener noreferrer"
          >
            {lead.website}
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
          <span>{lead.value}</span>
        </div>
      </div>

      {/* Footer */}
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
