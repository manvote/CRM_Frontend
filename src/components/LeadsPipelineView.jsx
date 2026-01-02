import React from "react";
import PipelineCard from "./PipelineCard";

const LeadsPipelineView = ({ leads, onDelete }) => {
  // Columns definition based on image
  const columns = [
    {
      id: "Opened",
      label: "Opened",
      color: "bg-yellow-400",
      filter: (status) => ["Opened"].includes(status),
    },
    {
      id: "New",
      label: "New Lead",
      color: "bg-green-500",
      filter: (status) => ["New"].includes(status),
    },
    {
      id: "Interested",
      label: "Interested Lead",
      color: "bg-purple-500",
      filter: (status) => ["Interested"].includes(status),
    },
    {
      id: "Rejected",
      label: "Closed-Lead",
      color: "bg-red-500",
      filter: (status) => ["Rejected", "Closed"].includes(status),
    },
  ];

  return (
    <div className="flex h-full overflow-x-auto pb-4 gap-6">
      {columns.map((column) => {
        const columnLeads = leads.filter((lead) => column.filter(lead.status));

        return (
          <div
            key={column.id}
            className="min-w-[320px] w-1/4 flex flex-col h-full"
          >
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
              <span className="font-medium text-gray-900">{column.label}</span>
              <span className="ml-auto text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {columnLeads.length}
              </span>
            </div>

            {/* Column Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {columnLeads.map((lead) => (
                <PipelineCard key={lead.id} lead={lead} onDelete={onDelete} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadsPipelineView;
