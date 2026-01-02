import React, { useState, useMemo, useEffect } from "react";
import { Share2, List, Columns, Search, Filter, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import LeadsListView from "../components/LeadsListView";
import LeadsPipelineView from "../components/LeadsPipelineView";
import { getLeads, deleteLeads } from "../utils/leadsStorage";

const Leads = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [leads, setLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setLeads(getLeads());
  }, []);

  useEffect(() => {
    if (location.state?.filterStatus) {
      setFilterStatus(location.state.filterStatus);
    }
  }, [location.state]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        lead.name.toLowerCase().includes(searchLower) ||
        lead.company.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.status.toLowerCase().includes(searchLower);

      if (filterStatus === "All") return matchesSearch;
      if (filterStatus === "Active")
        return (
          matchesSearch && ["New", "Opened", "Interested"].includes(lead.status)
        );
      if (filterStatus === "Progress")
        return matchesSearch && ["Opened", "Interested"].includes(lead.status);

      return matchesSearch && lead.status === filterStatus;
    });
  }, [searchQuery, filterStatus, leads]);

  const handleSelectAll = (e) => {
    setSelectedLeads(e.target.checked ? filteredLeads.map((l) => l.id) : []);
  };

  const handleSelectRow = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((lId) => lId !== id) : [...prev, id]
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      deleteLeads([id]);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Opened: "bg-yellow-100 text-yellow-800",
      New: "bg-green-100 text-green-800",
      Interested: "bg-purple-100 text-purple-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div
      className="flex flex-col h-full"
      onClick={() => isFilterOpen && setIsFilterOpen(false)}
    >
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["N", "M", "R"].map((initial, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${
                    [
                      "bg-orange-200 text-orange-800",
                      "bg-green-200 text-green-800",
                      "bg-blue-200 text-blue-800",
                    ][i]
                  } flex items-center justify-center text-xs font-medium border-2 border-white`}
                >
                  {initial}
                </div>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <List size={18} /> All Leads
          </button>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "pipeline"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Columns size={18} /> Pipeline
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 relative">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder="Search..."
              />
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFilterOpen(!isFilterOpen);
                }}
                className={`flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 ${
                  filterStatus !== "All"
                    ? "text-blue-600 border-blue-200 bg-blue-50"
                    : "text-gray-700"
                }`}
              >
                <Filter size={16} />{" "}
                {filterStatus === "All" ? "Filter" : filterStatus}
              </button>

              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                  {["All", "Opened", "New", "Interested", "Rejected"].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                          filterStatus === status
                            ? "text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate("/leads/new")}
            className="flex items-center gap-2 px-4 py-2 bg-[#344873] text-white rounded-lg text-sm font-medium hover:bg-[#253860]"
          >
            <Plus size={16} /> Add People
          </button>
        </div>
      </div>

      {activeTab === "all" ? (
        <LeadsListView
          leads={filteredLeads}
          selectedLeads={selectedLeads}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          getStatusColor={getStatusColor}
        />
      ) : (
        <LeadsPipelineView leads={filteredLeads} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default Leads;
