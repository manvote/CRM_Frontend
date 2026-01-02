import React from "react";
import { Link } from "react-router-dom";
import { Linkedin } from "lucide-react";

const LeadsListView = ({
  leads,
  selectedLeads,
  onSelectAll,
  onSelectRow,
  getStatusColor,
}) => {
  return (
    <div className="flex-1 overflow-auto bg-white border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr className="divide-x divide-gray-200">
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"
            >
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                onChange={onSelectAll}
                checked={
                  leads.length > 0 && selectedLeads.length === leads.length
                }
              />
            </th>
            {[
              "Name",
              "Company",
              "Job Title",
              "Email",
              "Url",
              "Created on",
              "Lead Source",
              "Status",
            ].map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.length > 0 ? (
            leads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-gray-50 transition-colors border-b border-gray-200 divide-x divide-gray-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={() => onSelectRow(lead.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`}
                        alt=""
                        className="w-6 h-6 rounded-full"
                      />
                    </div>
                    <Link
                      to={`/leads/${lead.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                    >
                      {lead.name}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-700">{lead.company}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.jobTitle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  <a
                    href={lead.website || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {lead.website || "No Website"}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.createdOn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Linkedin size={14} className="text-blue-700" />{" "}
                    {lead.platform}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      lead.status
                    )}`}
                  >
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                No leads found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsListView;
