import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Share2,
  List,
  Columns,
  Search,
  Filter,
  Plus,
  Download,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import LeadsListView from "../components/LeadsListView";
import LeadsPipelineView from "../components/LeadsPipelineView";
<<<<<<< HEAD
import { leadsApi } from "../services/leadsApi";
=======
import Tooltip from "../components/common/Tooltip";
import ConfirmationModal from "../components/common/ConfirmationModal";
import {
  getLeads,
  deleteLeads,
  updateLead,
  saveLead,
} from "../utils/leadsStorage";
import { exportToCSV } from "../utils/exportUtils";
import { hasPermission, PERMISSIONS } from "../utils/permissions";
>>>>>>> origin/master

const Leads = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const canDelete = hasPermission(PERMISSIONS.DELETE_LEAD);
  const canExport = hasPermission(PERMISSIONS.EXPORT_DATA);

  // State initialization with localStorage persistence check for filterStatus
  const [leads, setLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState(() => {
    return localStorage.getItem("leads_filter_status") || "All";
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeLead = (lead) => ({
    ...lead,
    status: lead.stage ?? lead.status,
    jobTitle: lead.position ?? lead.jobTitle,
    platform: lead.source ?? lead.platform,
    createdOn: lead.created_at
      ? new Date(lead.created_at).toLocaleDateString("en-GB")
      : lead.createdOn,
  });

  // Fetch leads from backend
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      const response = await leadsApi.getLeads();
      setLeads(response.data.map(normalizeLead));
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(err.response?.data?.detail || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  // Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    leadId: null,
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  // Update filter from navigation state if present (overrides local storage)
  useEffect(() => {
    if (location.state?.filterStatus) {
      setFilterStatus(location.state.filterStatus);
    }
  }, [location.state]);

  // Persist filter status changes
  useEffect(() => {
    localStorage.setItem("leads_filter_status", filterStatus);
  }, [filterStatus]);

  // Global Search Shortcut (Cmd/Ctrl + K or /)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        (lead.name || "").toLowerCase().includes(searchLower) ||
        (lead.company || "").toLowerCase().includes(searchLower) ||
        (lead.email || "").toLowerCase().includes(searchLower) ||
        (lead.status || "").toLowerCase().includes(searchLower);

      if (filterStatus === "All") return matchesSearch;

      // Preset Filters
      if (filterStatus === "My Leads") {
        // Assuming 'current user' logic simply filters by lack of specific assignment or defaults to all for now
        return matchesSearch;
      }

      if (filterStatus === "Today") {
        const todayStr = new Date().toLocaleDateString("en-GB");
        // Check if createdOn includes today's date substring
        return (
          matchesSearch && lead.createdOn && lead.createdOn.includes(todayStr)
        );
      }

      if (filterStatus === "Active")
        return (
          matchesSearch &&
          [
            "New",
            "Opened",
            "New Lead",
            "Interested",
            "Interested Lead",
          ].includes(lead.status)
        );

      return matchesSearch && lead.status === filterStatus;
    });
  }, [searchQuery, filterStatus, leads]);

  const handleSelectAll = (e) => {
    setSelectedLeads(e.target.checked ? filteredLeads.map((l) => l.id) : []);
  };

  const handleSelectRow = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((lId) => lId !== id) : [...prev, id],
    );
  };

<<<<<<< HEAD
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        setLoading(true);
        await leadsApi.deleteLead(id);
        await fetchLeads();
        setError("");
      } catch (err) {
        console.error("Error deleting lead:", err);
        setError("Failed to delete lead");
      } finally {
        setLoading(false);
      }
    }
=======
  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, leadId: id });
  };

  const handleDelete = () => {
    const id = deleteModal.leadId;
    if (!id) return;

    // Optimistic UI Update
    const leadToDelete = leads.find((l) => l.id === id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    deleteLeads([id]);

    toast.success((t) => (
      <span className="flex items-center gap-2">
        Lead deleted
        <button
          onClick={() => {
            // Undo Action
            saveLead(leadToDelete); // Re-save the lead
            setLeads(getLeads()); // Refresh state
            toast.dismiss(t.id);
            toast.success("Action undone");
          }}
          className="px-2 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700"
        >
          Undo
        </button>
      </span>
    ));

    setDeleteModal({ isOpen: false, leadId: null });
>>>>>>> origin/master
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const leadId = Number(draggableId);
    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    if (
      ["Closed", "Rejected"].includes(oldStatus) &&
      !["Closed", "Rejected"].includes(newStatus)
    ) {
      if (!window.confirm("Are you sure you want to reopen a closed lead?"))
        return;
    }

    const leadToUpdate = leads.find((l) => l.id === leadId);
    if (leadToUpdate) {
      const updatedLead = {
        ...leadToUpdate,
        status: newStatus,
        stage: newStatus,
      };

      // Optimistic update
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updatedLead : l)));

      // Sync with backend
      try {
        await leadsApi.updateLead(leadId, { stage: newStatus });
      } catch (err) {
        console.error("Error updating lead:", err);
        setLeads(leads); // Revert on error
        setError("Failed to update lead status");
      }
    }
  };

  const handleExport = () => {
    if (filteredLeads.length === 0) {
      toast.error("No leads to export");
      return;
    }
    const dataToExport = filteredLeads.map(({ id, ...rest }) => rest);
    exportToCSV(
      dataToExport,
      `leads_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    toast.success("Export started");
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
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <span className="text-sm text-red-600">{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        )}

      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <Tooltip
            id="leads_overview"
            text="Manage all your potential customers here. Use tabs to switch views."
            position="right"
          >
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          </Tooltip>
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
          <Tooltip
            id="list_view_tab"
            text="View your leads in a spreadsheet-like list for easy sorting and bulk actions."
            position="bottom"
          >
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
          </Tooltip>
          <Tooltip
            id="pipeline_view_tab"
            text="Visualise your sales process. Drag and drop cards to move them between stages."
            position="bottom"
          >
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
          </Tooltip>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 relative">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder="Search (Press / to focus)"
              />
            </div>

            <div className="relative">
              <Tooltip
                id="leads_filter"
                text="Filter leads by status, date, or ownership."
                position="top"
              >
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
              </Tooltip>

              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Presets
                  </div>
                  {["All", "My Leads", "Today"].map((status) => (
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
                  ))}
                  <div className="border-t border-gray-100 my-1"></div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </div>
                  {["Opened", "New", "Interested", "Rejected"].map((status) => (
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
                  ))}
                </div>
              )}
            </div>

            {canExport && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download size={16} /> Export
              </button>
            )}
          </div>
          <button
            onClick={() => navigate("/leads/new")}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#344873] text-white rounded-lg text-sm font-medium hover:bg-[#253860] disabled:opacity-50"
          >
            <Plus size={16} /> Add People
          </button>
        </div>
      </div>

        {loading && leads.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && activeTab === "all" ? (
        <LeadsListView
          leads={filteredLeads}
          selectedLeads={selectedLeads}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          getStatusColor={getStatusColor}
        />
      ) : (
        <LeadsPipelineView
          leads={filteredLeads}
          onDelete={canDelete ? confirmDelete : undefined}
          onDragEnd={handleDragEnd}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, leadId: null })}
        onConfirm={handleDelete}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action can be undone briefly."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Leads;
