import React, { useState, useEffect, useMemo, useRef } from "react";
import { addNotification } from "../utils/notificationStorage";
import {
  Plus,
  Search,
  Filter,
  Kanban,
  Table,
  MoreVertical,
  MessageSquare,
  Paperclip,
  Trash2,
  X,
  Edit,
  UserPlus,
  Eye,
  Clock,
  MoreHorizontal,
  Send,
  FileText,
  Download,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { dealsApi } from "../services/dealsApi";

const KANBAN_COLUMNS = [
  "Clients",
  "Orders",
  "Tasks",
  "Due Date",
  "Revenue",
  "Status",
];

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Closure Modal State
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [pendingClosureDeal, setPendingClosureDeal] = useState(null);

  // Activity Modal State
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [currentActivityDeal, setCurrentActivityDeal] = useState(null);
  const [activeTab, setActiveTab] = useState("comments"); // 'comments' or 'attachments'
  const fileInputRef = useRef(null);

  const [view, setView] = useState("kanban"); // Defaulting to kanban since user asked for it, or keep user preference? User asked "where is it", so maybe they want to see it.
  const [activeActionId, setActiveActionId] = useState(null);

  // Track if we are editing an existing deal
  const [editingDealId, setEditingDealId] = useState(null);

  // Form State
  // Normalize backend deal data to frontend format
  const normalizeDeal = (deal) => ({
    id: deal.id,
    title: deal.title,
    desc: deal.description || deal.desc || "",
    client: deal.client || "Clients",
    stage: deal.stage || "Clients",
    status: deal.status || "Open",
    revenue: deal.amount || deal.revenue || 0,
    dueDate: deal.due_date || deal.dueDate || "",
    statusColor:
      deal.status === "Won"
        ? "bg-emerald-100 text-emerald-600"
        : deal.status === "Lost"
        ? "bg-red-100 text-red-600"
        : "bg-amber-100 text-amber-600",
    assignee: deal.assignee ?? [],
    activity: {
      comments: deal.activity?.comments || 0,
      attachments: deal.activity?.attachments || 0,
      commentsList: deal.activity?.commentsList || [],
      attachmentsList: deal.activity?.attachmentsList || [],
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    client: "Clients",
    revenue: "",
    dueDate: "",
    status: "Clients",
    assigneeInitials: "JS",
    file: null,
  });

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        (deal.title || "").toLowerCase().includes(searchLower) ||
        (deal.client || "").toLowerCase().includes(searchLower) ||
        (deal.status || "").toLowerCase().includes(searchLower) ||
        (deal.desc || "").toLowerCase().includes(searchLower);

      if (filterStatus === "All") return matchesSearch;
      if (filterStatus === "Active")
        return matchesSearch && !["Won", "Lost"].includes(deal.status);

      // Filter by Stage if selected, or Status
      return (
        matchesSearch &&
        (deal.status === filterStatus || deal.stage === filterStatus)
      );
    });
  }, [searchQuery, filterStatus, deals]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      const response = await dealsApi.getDeals();
      setDeals(response.data.map(normalizeDeal));
    } catch (err) {
      console.error("Error fetching deals:", err);
      setError(err.response?.data?.detail || "Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
    const handleClickOutside = () => setActiveActionId(null);
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingDealId(null);
    setFormData({
      title: "",
      desc: "",
      client: "Clients",
      revenue: "",
      dueDate: "",
      status: "Clients",
      assigneeInitials: "JS",
      file: null,
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (deal) => {
    setEditingDealId(deal.id);
    setFormData({
      title: deal.title,
      desc: deal.desc || "",
      client: deal.client || "Clients",
      revenue: deal.revenue || "",
      dueDate: deal.dueDate || "",
      status: deal.status || "Clients",
      assigneeInitials:
        deal.assignee && deal.assignee[0] ? deal.assignee[0].initials : "JS",
      file: null,
    });
    setIsModalOpen(true);
    setActiveActionId(null);
  };

  const handleSaveDeal = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        title: formData.title,
        desc: formData.desc,
        client: formData.client,
        stage: formData.status,
        status: "Open",
        revenue: formData.revenue,
        dueDate: formData.dueDate,
        assigneeInitials: formData.assigneeInitials,
        file: formData.file,
      };

      if (editingDealId) {
        await dealsApi.updateDeal(editingDealId, payload);
      } else {
        await dealsApi.createDeal(payload);
      }

      await fetchDeals();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving deal:", err);
      
      // Display detailed error messages
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object' && !errorData.detail) {
          // Field-specific errors
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => {
              const msg = Array.isArray(messages) ? messages[0] : messages;
              return `${field}: ${msg}`;
            })
            .join(', ');
          setError(errorMessages || "Failed to save deal");
        } else {
          setError(errorData.detail || errorData.message || "Failed to save deal");
        }
      } else {
        setError(err.message || "Failed to save deal");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        setLoading(true);
        await dealsApi.deleteDeal(id);
        await fetchDeals();
      } catch (err) {
        console.error("Error deleting deal:", err);
        setError("Failed to delete deal");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleActionMenu = (e, id) => {
    e.stopPropagation();
    setActiveActionId(activeActionId === id ? null : id);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;
    const dealId = Number(draggableId);

    // 1. LOCKING: Cannot move deals OUT of 'Status'
    if (sourceStage === "Status") {
      alert(
        "Closed deals are locked and cannot be moved back to the pipeline."
      );
      return;
    }

    // 2. RESTRICTION: Can only move TO 'Status' from 'Revenue'
    if (destStage === "Status" && sourceStage !== "Revenue") {
      alert("Deals can only be closed from the 'Revenue' stage.");
      return;
    }

    // 3. CLOSURE TRIGGER: If moving to 'Status', open modal
    if (destStage === "Status") {
      const deal = deals.find((d) => d.id === dealId);
      setPendingClosureDeal(deal);
      setIsClosureModalOpen(true);
      return; // Do not move yet, wait for modal choice
    }

    // Normal Move within Pipeline
    const dealToUpdate = deals.find((d) => d.id === dealId);
    if (dealToUpdate) {
      const updatedDeal = { ...dealToUpdate, stage: destStage };

      // Update local state immediately for responsiveness
      setDeals(deals.map((d) => (d.id === dealId ? updatedDeal : d)));

      // Sync with backend
      try {
        await dealsApi.updateDeal(dealId, { stage: destStage });
      } catch (err) {
        console.error("Error updating deal stage:", err);
        setDeals(deals);
        setError("Failed to update deal stage");
      }
    }
  };

  const handleOpenActivity = (deal, tab) => {
    setCurrentActivityDeal(deal);
    setActiveTab(tab);
    setActivityModalOpen(true);
  };

  const handleAddComment = async (text) => {
    if (!currentActivityDeal) return;

    try {
      await dealsApi.addComment(currentActivityDeal.id, text);
      const response = await dealsApi.getDeal(currentActivityDeal.id);
      const refreshed = normalizeDeal(response.data);

      setDeals(deals.map((d) => (d.id === refreshed.id ? refreshed : d)));
      setCurrentActivityDeal(refreshed);
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment");
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentActivityDeal) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    try {
      await dealsApi.addAttachment(currentActivityDeal.id, file);
      const response = await dealsApi.getDeal(currentActivityDeal.id);
      const refreshed = normalizeDeal(response.data);

      setDeals(deals.map((d) => (d.id === refreshed.id ? refreshed : d)));
      setCurrentActivityDeal(refreshed);
    } catch (err) {
      console.error("Error adding attachment:", err);
      setError("Failed to add attachment");
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!currentActivityDeal) return;

    if (!window.confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    try {
      await dealsApi.deleteAttachment(currentActivityDeal.id, attachmentId);
      const response = await dealsApi.getDeal(currentActivityDeal.id);
      const refreshed = normalizeDeal(response.data);

      setDeals(deals.map((d) => (d.id === refreshed.id ? refreshed : d)));
      setCurrentActivityDeal(refreshed);
    } catch (err) {
      console.error("Error deleting attachment:", err);
      setError("Failed to delete attachment");
    }
  };

  const handleClosure = async (outcome) => {
    if (!pendingClosureDeal) return;

    const updatedDeal = {
      ...pendingClosureDeal,
      stage: "Status",
      status: outcome,
      statusColor:
        outcome === "Won"
          ? "bg-emerald-100 text-emerald-600"
          : "bg-red-100 text-red-600",
    };

    if (outcome === "Won") {
      addNotification({
        title: "Deal Won! 🎉",
        message: `Congratulations! You won the deal "${updatedDeal.title}" valued at ₹${Number(updatedDeal.revenue || updatedDeal.amount || 0).toLocaleString()}.`,
        type: "success",
      });
    }

    setDeals(
      deals.map((d) => (d.id === pendingClosureDeal.id ? updatedDeal : d))
    );

    try {
      await dealsApi.updateDeal(pendingClosureDeal.id, {
        stage: "Status",
        status: outcome,
      });
    } catch (err) {
      console.error("Error closing deal:", err);
      setError("Failed to close deal");
    }

    setIsClosureModalOpen(false);
    setPendingClosureDeal(null);
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#344873] text-white rounded-lg hover:bg-[#253860] transition-colors"
        >
          <Plus size={18} /> Add New Deals
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
          <div className="flex items-start gap-2">
            <span className="text-red-600 font-medium">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-600"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">Loading deals...</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 shrink-0 gap-4 sm:gap-0">
        <div className="flex items-center gap-4 w-full sm:max-w-lg">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder-gray-400"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 shrink-0 ${
                filterStatus !== "All"
                  ? "text-blue-600 font-medium"
                  : "text-gray-600"
              }`}
            >
              <Filter size={18} />{" "}
              {filterStatus === "All" ? "Filter" : filterStatus}
            </button>

            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                {["All", "Active", "Won", "Lost"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setIsFilterOpen(false);
                    }}
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
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 w-full sm:w-auto justify-center sm:justify-start">
          <button
            onClick={() => setView("table")}
            className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-1.5 rounded transition-all ${
              view === "table"
                ? "bg-gray-100 text-gray-900 font-medium shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Table size={16} /> Table
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-1.5 rounded transition-all ${
              view === "kanban"
                ? "bg-gray-100 text-gray-900 font-medium shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Kanban size={16} /> Kanban
          </button>
        </div>
      </div>

      {/* Content Area */}
      {view === "table" ? (
        <div className="flex-1 overflow-auto bg-gray-50 sm:bg-white rounded-lg border-0 sm:border border-gray-200">
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-4 pb-20">
            {filteredDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 relative"
              >
                {/* Card Header: Title & Action */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">
                      {deal.title}
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">
                      {deal.client}
                    </span>
                  </div>
                  <button
                    onClick={(e) => toggleActionMenu(e, deal.id)}
                    className="text-gray-400 p-1 hover:bg-gray-50 rounded-full"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {/* Dropdown Menu */}
                  {activeActionId === deal.id && (
                    <div className="absolute right-4 top-10 w-44 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-left">
                      <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Eye size={16} className="text-gray-400" /> View Details
                      </button>
                      <button
                        onClick={() => handleOpenEdit(deal)}
                        className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit size={16} className="text-gray-400" /> Edit Deal
                      </button>
                      <button
                        onClick={() => handleDelete(deal.id)}
                        className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Stats Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 py-2 border-t border-b border-gray-50">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Revenue</p>
                    <p className="text-sm font-bold text-emerald-600">
                      ₹ {Number(deal.revenue).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Due Date</p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock size={14} className="text-gray-400" />
                      {deal.dueDate}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Status & Activity */}
                <div className="flex items-center justify-between pt-1">
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${deal.statusColor}`}
                  >
                    {deal.status}
                  </span>
                  <div className="flex -space-x-2 mr-1">
                    {deal.assignee &&
                      deal.assignee.map((person, idx) => (
                        <div
                          key={idx}
                          className={`w-6 h-6 rounded-full ${person.color} flex items-center justify-center text-white text-[10px] font-medium border-2 border-white ring-1 ring-gray-100`}
                        >
                          {person.initials}
                        </div>
                      ))}
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-xs">
                    <button
                      onClick={() => handleOpenActivity(deal, "comments")}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      <MessageSquare size={14} />{" "}
                      {deal.activity?.commentsList?.length || 0}
                    </button>
                    <button
                      onClick={() => handleOpenActivity(deal, "attachments")}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      <Paperclip size={14} />{" "}
                      {deal.activity?.attachmentsList?.length || 0}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredDeals.length === 0 && (
              <div className="text-center text-gray-400 py-10">
                No deals found.
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <table className="hidden sm:table w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deal Name
                </th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDeals.map((deal) => (
                <tr
                  key={deal.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        {deal.title}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {deal.desc}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                    {deal.client}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {deal.assignee &&
                        deal.assignee.map((person, idx) => (
                          <div
                            key={idx}
                            className={`w-8 h-8 rounded-full ${person.color} flex items-center justify-center text-white text-xs font-medium border-2 border-white`}
                          >
                            {person.initials}
                          </div>
                        ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">📅</span> {deal.dueDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                    ₹ {Number(deal.revenue).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${deal.statusColor}`}
                    >
                      {deal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                      <button
                        onClick={() => handleOpenActivity(deal, "comments")}
                        className="flex items-center gap-1 hover:text-purple-600 transition-colors"
                      >
                        <MessageSquare size={14} className="text-purple-400" />{" "}
                        {deal.activity?.comments || 0}
                      </button>
                      <button
                        onClick={() => handleOpenActivity(deal, "attachments")}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        <Paperclip size={14} className="text-gray-400" />{" "}
                        {deal.activity?.attachments || 0}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={(e) => toggleActionMenu(e, deal.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeActionId === deal.id && (
                      <div className="absolute right-8 top-8 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-left">
                        <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Eye size={14} /> View Details
                        </button>
                        <button
                          onClick={() => handleOpenEdit(deal)}
                          className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit size={14} /> Edit Deal
                        </button>
                        <button
                          onClick={() => handleDelete(deal.id)}
                          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDeals.length === 0 && (
            <div className="hidden sm:block p-8 text-center text-gray-500 text-sm">
              No deals found. Create a new one.
            </div>
          )}
        </div>
      ) : (
        // KANBAN VIEW IMPLEMENTATION
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 scroll-smooth">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 sm:gap-6 h-full px-1 min-w-full">
              {KANBAN_COLUMNS.map((column) => (
                <Droppable key={column} droppableId={column}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-w-[280px] sm:min-w-[300px] flex flex-col h-full rounded-xl transition-colors ${
                        snapshot.isDraggingOver ? "bg-gray-50/50" : ""
                      }`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800 text-sm tracking-wide">
                            {column}
                          </h3>
                          <span
                            className={`${
                              column === "Status"
                                ? "bg-gray-800 text-white"
                                : "bg-gray-100 text-gray-600"
                            } text-[10px] px-2 py-0.5 rounded-full font-bold`}
                          >
                            {
                              filteredDeals.filter((d) => d.stage === column)
                                .length
                            }
                          </span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Plus size={18} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-4 px-1 custom-scrollbar">
                        {filteredDeals
                          .filter((d) => d.stage === column)
                          .map((deal, index) => (
                            <Draggable
                              key={deal.id}
                              isDragDisabled={column === "Status"} // Lock deals in Status
                              draggableId={deal.id.toString()}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    opacity: snapshot.isDragging ? 0.9 : 1,
                                  }}
                                  className={`bg-white p-4 rounded-2xl border ${
                                    column === "Status"
                                      ? deal.status === "Won"
                                        ? "border-emerald-200 bg-emerald-50/30"
                                        : "border-red-200 bg-red-50/30"
                                      : "border-gray-100"
                                  } shadow-sm hover:shadow-md transition-shadow group relative ${
                                    snapshot.isDragging
                                      ? "shadow-xl ring-2 ring-blue-100 rotate-2"
                                      : ""
                                  }`}
                                >
                                  {/* Card Image */}
                                  {deal.image && (
                                    <div className="mb-3 rounded-xl overflow-hidden h-32 w-full bg-gray-50">
                                      <img
                                        src={deal.image}
                                        alt="cover"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}

                                  {/* Title & Desc */}
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-900 text-sm leading-tight">
                                      {deal.title}
                                    </h4>
                                    <button
                                      onClick={(e) =>
                                        toggleActionMenu(e, deal.id)
                                      }
                                      className="text-gray-400 hover:text-gray-600 -mr-2 -mt-1 p-1"
                                    >
                                      <MoreVertical size={16} />
                                    </button>
                                  </div>
                                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                                    {deal.desc ||
                                      "Business functions within an organization"}
                                  </p>

                                  {/* Footer Info */}
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                                      <div className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        <span>
                                          {deal.dueDate
                                            ? new Date(
                                                deal.dueDate
                                              ).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                              })
                                            : "12 Dec, 2025"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() =>
                                            handleOpenActivity(
                                              deal,
                                              "attachments"
                                            )
                                          }
                                          className="flex items-center gap-1 hover:text-blue-600"
                                        >
                                          <Paperclip size={14} />
                                          <span>
                                            {deal.activity?.attachmentsList
                                              ?.length || 0}
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 ml-auto mr-2">
                                      <button
                                        onClick={() =>
                                          handleOpenActivity(deal, "comments")
                                        }
                                        className="flex items-center gap-1 hover:text-blue-600 text-gray-400 text-xs font-medium"
                                      >
                                        <MessageSquare size={14} />
                                        <span>
                                          {deal.activity?.commentsList
                                            ?.length || 0}
                                        </span>
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                      ₹{" "}
                                      {Number(
                                        deal.revenue || deal.amount || 0
                                      ).toLocaleString()}
                                    </div>
                                  </div>

                                  {/* Action Menu */}
                                  {activeActionId === deal.id && (
                                    <div className="absolute right-2 top-8 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-left">
                                      <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                        <Eye size={14} /> View Details
                                      </button>
                                      <button
                                        onClick={() => handleOpenEdit(deal)}
                                        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Edit size={14} /> Edit Deal
                                      </button>
                                      <div className="my-1 border-t border-gray-100"></div>
                                      <button
                                        onClick={() => handleDelete(deal.id)}
                                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <Trash2 size={14} /> Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                        {/* Empty State for Drop Area if needed (handled by min-height) */}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* Activity Modal */}
      {activityModalOpen && currentActivityDeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {currentActivityDeal.title}
                </h3>
                <p className="text-xs text-gray-500">Activity & Updates</p>
              </div>
              <button
                onClick={() => setActivityModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-4 border-b border-gray-100">
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex-1 pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "comments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Comments (
                {currentActivityDeal.activity?.commentsList?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("attachments")}
                className={`flex-1 pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "attachments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Attachments (
                {currentActivityDeal.activity?.attachmentsList?.length || 0})
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {activeTab === "comments" ? (
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <textarea
                      id="new-comment"
                      placeholder="Type a note..."
                      className="w-full text-sm resize-none focus:outline-none placeholder-gray-400"
                      rows="2"
                    ></textarea>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                      <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Paperclip size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          const el = document.getElementById("new-comment");
                          if (el.value.trim()) {
                            handleAddComment(el.value);
                            el.value = "";
                          }
                        }}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Send size={12} /> Post
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(currentActivityDeal.activity?.commentsList || []).length >
                    0 ? (
                      currentActivityDeal.activity.commentsList.map(
                        (comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 border border-white shadow-sm">
                              {comment.initials}
                            </div>
                            <div className="bg-white p-3 rounded-r-xl rounded-bl-xl shadow-sm border border-gray-100 flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-gray-800">
                                  {comment.author}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {comment.date}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No comments yet.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Paperclip size={20} />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload file
                    </p>
                    <p className="text-xs text-gray-400">
                      Max 2MB (Storage Limit)
                    </p>
                  </div>

                  <div className="space-y-2">
                    {(currentActivityDeal.activity?.attachmentsList || [])
                      .length > 0 ? (
                      currentActivityDeal.activity.attachmentsList.map(
                        (file) => (
                          <div
                            key={file.id}
                            className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              {file.type?.startsWith("image/") ? (
                                <img
                                  src={file.data}
                                  alt="preview"
                                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                                  <FileText size={20} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {file.size} • {file.date}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <a
                                href={file.data}
                                download={file.name}
                                className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50"
                                title="Download"
                              >
                                <Download size={16} />
                              </a>
                              <button
                                onClick={() => handleDeleteAttachment(file.id)}
                                className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No attachments yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Closure Confirmation Modal */}
      {isClosureModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                <Kanban className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Close Deal
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                This action will close the deal{" "}
                <strong>"{pendingClosureDeal?.title}"</strong>. Please select
                the final outcome.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => handleClosure("Won")}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-200 transition-all group"
                >
                  <span className="text-xl mb-1">🏆</span>
                  <span className="text-sm font-bold text-emerald-700">
                    Mark as Won
                  </span>
                </button>
                <button
                  onClick={() => handleClosure("Lost")}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-red-100 bg-red-50 hover:bg-red-100 hover:border-red-200 transition-all group"
                >
                  <span className="text-xl mb-1">📉</span>
                  <span className="text-sm font-bold text-red-700">
                    Mark as Lost
                  </span>
                </button>
              </div>

              <button
                onClick={() => {
                  setIsClosureModalOpen(false);
                  setPendingClosureDeal(null);
                }}
                className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="bg-gray-50 px-6 py-3 text-center">
              <span className="text-xs text-gray-400">
                Closed deals cannot be reopened easily.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingDealId ? "Edit Deal" : "Add New Deal"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveDeal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal Name
                </label>
                <input
                  required
                  className="w-full p-2 border rounded-lg text-sm"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  className="w-full p-2 border rounded-lg text-sm"
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded-lg text-sm"
                    value={formData.client}
                    onChange={(e) =>
                      setFormData({ ...formData, client: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status (Column)
                  </label>

                  <select
                    className="w-full p-2 border rounded-lg text-sm"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option>Clients</option>
                    <option>Orders</option>
                    <option>Tasks</option>
                    <option>Due Date</option>
                    <option>Revenue</option>
                    <option>Status</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revenue (₹)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full p-2 border rounded-lg text-sm"
                    value={formData.revenue}
                    onChange={(e) =>
                      setFormData({ ...formData, revenue: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full p-2 border rounded-lg text-sm"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#344873] text-white rounded-lg text-sm font-medium hover:bg-[#253860]"
                >
                  {editingDealId ? "Update Deal" : "Create Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;
