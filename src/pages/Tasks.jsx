import React, { useState, useEffect, useMemo, useRef } from "react";
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
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ListTodo,
  Layers,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  getTasks,
  saveTask,
  updateTask,
  deleteTask,
} from "../utils/tasksStorage";

const KANBAN_COLUMNS = ["To Do", "In Progress", "Review", "Done"];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Activity Modal State
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [currentActivityTask, setCurrentActivityTask] = useState(null);
  const [activeTab, setActiveTab] = useState("comments"); // 'comments' or 'attachments'
  const fileInputRef = useRef(null);

  const [view, setView] = useState("kanban");
  const [activeActionId, setActiveActionId] = useState(null);

  // Track if we are editing an existing task
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    client: "Internal",
    priority: "Medium",
    dueDate: "",
    stage: "To Do",
    assigneeInitials: "JS",
    file: null,
  });

  // Stats Logic
  const stats = useMemo(() => {
    const total = tasks.length;
    const low = tasks.filter((t) => t.priority === "Low").length;
    const medium = tasks.filter((t) => t.priority === "Medium").length;
    const high = tasks.filter((t) => t.priority === "High").length;
    const notCompleted = tasks.filter((t) => t.stage !== "Done").length;

    const today = new Date().toISOString().split("T")[0];
    const overdue = tasks.filter(
      (t) => t.dueDate && t.dueDate < today && t.stage !== "Done"
    ).length;

    const todo = tasks.filter((t) => t.stage === "To Do").length;
    const ongoing = tasks.filter(
      (t) => t.stage === "In Progress" || t.stage === "Review"
    ).length;
    const completed = tasks.filter((t) => t.stage === "Done").length;

    return {
      total,
      low,
      medium,
      high,
      notCompleted,
      overdue,
      todo,
      ongoing,
      completed,
    };
  }, [tasks]);

  // Tab State
  const [selectedTab, setSelectedTab] = useState("Tasks");

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // 1. Tab Filter
    if (selectedTab === "To Do") {
      filtered = filtered.filter((t) => t.stage === "To Do");
    } else if (selectedTab === "Overdue") {
      const today = new Date().toISOString().split("T")[0];
      filtered = filtered.filter(
        (t) => t.dueDate && t.dueDate < today && t.stage !== "Done"
      );
    } else if (selectedTab === "Ongoing") {
      filtered = filtered.filter(
        (t) => t.stage === "In Progress" || t.stage === "Review"
      );
    } else if (selectedTab === "Completed") {
      filtered = filtered.filter((t) => t.stage === "Done");
    }

    return filtered.filter((task) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(searchLower) ||
        (task.desc && task.desc.toLowerCase().includes(searchLower)) ||
        (task.client && task.client.toLowerCase().includes(searchLower));

      if (filterStatus === "All") return matchesSearch;

      return (
        matchesSearch &&
        (task.priority === filterStatus || task.stage === filterStatus)
      );
    });
  }, [searchQuery, filterStatus, tasks, selectedTab]);

  useEffect(() => {
    setTasks(getTasks());
    const handleStorageChange = () => setTasks(getTasks());
    window.addEventListener("storage", handleStorageChange);
    const handleClickOutside = () => setActiveActionId(null);
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingTaskId(null);
    setFormData({
      title: "",
      desc: "",
      client: "Internal",
      priority: "Medium",
      dueDate: "",
      stage: "To Do",
      assigneeInitials: "JS",
      file: null,
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (task) => {
    setEditingTaskId(task.id);
    setFormData({
      title: task.title,
      desc: task.desc || "",
      client: task.client || "Internal",
      priority: task.priority || "Medium",
      dueDate: task.dueDate || "",
      stage: task.stage || "To Do",
      assigneeInitials:
        task.assignee && task.assignee[0] ? task.assignee[0].initials : "JS",
      file: null,
    });
    setIsModalOpen(true);
    setActiveActionId(null);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();

    let imageBase64 = null;
    if (formData.file) {
      imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(formData.file);
      });
    }

    const commonData = {
      ...formData,
      priorityColor:
        formData.priority === "Critical"
          ? "bg-purple-100 text-purple-600"
          : formData.priority === "High"
          ? "bg-red-100 text-red-600"
          : "bg-blue-100 text-blue-600",
      assignee: [
        { initials: formData.assigneeInitials, color: "bg-purple-500" },
      ],
    };

    if (editingTaskId) {
      const originalTask = tasks.find((t) => t.id === editingTaskId);
      const updatedTask = {
        id: editingTaskId,
        ...commonData,
        activity: originalTask
          ? originalTask.activity
          : { comments: 0, attachments: 0 },
      };

      if (originalTask && !imageBase64) {
        updatedTask.image = originalTask.image;
      } else if (imageBase64) {
        updatedTask.image = imageBase64;
      }

      updateTask(updatedTask);
    } else {
      const newTask = {
        ...commonData,
        image: imageBase64,
        activity: { comments: 0, attachments: 0 },
      };
      saveTask(newTask);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(id);
      setTasks(getTasks());
    }
  };

  const toggleActionMenu = (e, id) => {
    e.stopPropagation();
    setActiveActionId(activeActionId === id ? null : id);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const destStage = destination.droppableId;
    const taskId = Number(draggableId);

    const taskToUpdate = tasks.find((t) => t.id === taskId);
    if (taskToUpdate) {
      const updatedTask = { ...taskToUpdate, stage: destStage };

      // Update local state immediately for responsiveness
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
      updateTask(updatedTask);
    }
  };

  const handleOpenActivity = (task, tab) => {
    setCurrentActivityTask(task);
    setActiveTab(tab);
    setActivityModalOpen(true);
  };

  const handleAddComment = (text) => {
    if (!currentActivityTask) return;
    const newComment = {
      id: Date.now(),
      text,
      author: "You",
      date: new Date().toLocaleDateString(),
      initials: "YO",
    };

    const updatedTask = {
      ...currentActivityTask,
      activity: {
        ...currentActivityTask.activity,
        commentsList: [
          newComment,
          ...(currentActivityTask.activity.commentsList || []),
        ],
      },
    };

    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    updateTask(updatedTask);
    setCurrentActivityTask(updatedTask);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB limit for local storage.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      handleAddAttachment(file, event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddAttachment = (file, fileData) => {
    if (!currentActivityTask) return;
    const newAttachment = {
      id: Date.now(),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      date: new Date().toLocaleDateString(),
      type: file.type,
      data: fileData,
    };

    const updatedTask = {
      ...currentActivityTask,
      activity: {
        ...currentActivityTask.activity,
        attachmentsList: [
          newAttachment,
          ...(currentActivityTask.activity.attachmentsList || []),
        ],
      },
    };

    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    updateTask(updatedTask);
    setCurrentActivityTask(updatedTask);
  };

  const handleDeleteAttachment = (attachmentId) => {
    if (!currentActivityTask) return;

    const updatedList = (
      currentActivityTask.activity.attachmentsList || []
    ).filter((a) => a.id !== attachmentId);

    const updatedTask = {
      ...currentActivityTask,
      activity: {
        ...currentActivityTask.activity,
        attachmentsList: updatedList,
      },
    };

    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    updateTask(updatedTask);
    setCurrentActivityTask(updatedTask);
  };

  return (
    <div className="flex flex-col min-h-full bg-white p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#344873] text-white rounded-lg hover:bg-[#253860] transition-colors"
        >
          <Plus size={18} /> Add New Task
        </button>
      </div>

      {/* Tabs / Filters from Image */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: "Tasks", count: stats.total, key: "Tasks" },
          { label: "To Do", count: stats.todo, key: "To Do" },
          { label: "Overdue", count: stats.overdue, key: "Overdue" },
          { label: "Ongoing", count: stats.ongoing, key: "Ongoing" },
          { label: "Completed", count: stats.completed, key: "Completed" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors border ${
              selectedTab === tab.key
                ? tab.key === "Completed"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-gray-200 text-gray-800 border-gray-300"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {tab.label} <span className="ml-1 opacity-70">{tab.count}</span>
          </button>
        ))}
      </div>

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
              placeholder="Search tasks..."
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
                {[
                  "All",
                  "To Do",
                  "In Progress",
                  "Review",
                  "Done",
                  "High",
                  "Medium",
                  "Low",
                ].map((status) => (
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
        <div className="w-full bg-gray-50 sm:bg-white rounded-lg border-0 sm:border border-gray-200">
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-4 pb-20">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">
                      {task.title}
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">
                      {task.client}
                    </span>
                  </div>
                  <button
                    onClick={(e) => toggleActionMenu(e, task.id)}
                    className="text-gray-400 p-1 hover:bg-gray-50 rounded-full"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {activeActionId === task.id && (
                    <div className="absolute right-4 top-10 w-44 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-left">
                      <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Eye size={16} className="text-gray-400" /> View Details
                      </button>
                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit size={16} className="text-gray-400" /> Edit Task
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 py-2 border-t border-b border-gray-50">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Priority</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${task.priorityColor}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Due Date</p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock size={14} className="text-gray-400" />
                      {task.dueDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {task.stage}
                  </span>
                  <div className="flex items-center gap-3 text-gray-400 text-xs">
                    <button
                      onClick={() => handleOpenActivity(task, "comments")}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      <MessageSquare size={14} />{" "}
                      {task.activity?.commentsList?.length || 0}
                    </button>
                    <button
                      onClick={() => handleOpenActivity(task, "attachments")}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      <Paperclip size={14} />{" "}
                      {task.activity?.attachmentsList?.length || 0}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <table className="hidden sm:table w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Name
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
                  Priority
                </th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
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
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        {task.title}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {task.desc}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                    {task.client}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {task.assignee &&
                        task.assignee.map((person, idx) => (
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
                      <span className="text-gray-400">📅</span> {task.dueDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full ${task.priorityColor}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {task.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                      <button
                        onClick={() => handleOpenActivity(task, "comments")}
                        className="flex items-center gap-1 hover:text-purple-600 transition-colors"
                      >
                        <MessageSquare size={14} className="text-purple-400" />{" "}
                        {task.activity?.commentsList?.length || 0}
                      </button>
                      <button
                        onClick={() => handleOpenActivity(task, "attachments")}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        <Paperclip size={14} className="text-gray-400" />{" "}
                        {task.activity?.attachmentsList?.length || 0}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={(e) => toggleActionMenu(e, task.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeActionId === task.id && (
                      <div className="absolute right-8 top-8 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-left">
                        <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Eye size={14} /> View Details
                        </button>
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit size={14} /> Edit Task
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
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
          {filteredTasks.length === 0 && (
            <div className="hidden sm:block p-8 text-center text-gray-500 text-sm">
              No tasks found. Create a new one.
            </div>
          )}
        </div>
      ) : (
        // KANBAN VIEW
        <div className="flex-1 overflow-x-auto pb-4 scroll-smooth">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 sm:gap-6 px-1 min-w-full">
              {KANBAN_COLUMNS.map((column) => (
                <Droppable key={column} droppableId={column}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-w-[280px] sm:min-w-[300px] flex flex-col rounded-xl transition-colors ${
                        snapshot.isDraggingOver ? "bg-gray-50/50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800 text-sm tracking-wide">
                            {column}
                          </h3>
                          <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {
                              filteredTasks.filter((t) => t.stage === column)
                                .length
                            }
                          </span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Plus size={18} />
                        </button>
                      </div>

                      <div className="space-y-4 px-1">
                        {filteredTasks
                          .filter((t) => t.stage === column)
                          .map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id.toString()}
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
                                  className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative ${
                                    snapshot.isDragging
                                      ? "shadow-xl ring-2 ring-blue-100 rotate-2"
                                      : ""
                                  }`}
                                >
                                  {task.image && (
                                    <div className="mb-3 rounded-xl overflow-hidden h-32 w-full bg-gray-50">
                                      <img
                                        src={task.image}
                                        alt="cover"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}

                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-900 text-sm leading-tight">
                                      {task.title}
                                    </h4>
                                    <button
                                      onClick={(e) =>
                                        toggleActionMenu(e, task.id)
                                      }
                                      className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                    >
                                      <MoreHorizontal size={16} />
                                    </button>
                                  </div>

                                  <div className="text-xs text-blue-600 font-medium mb-3">
                                    {task.client}
                                  </div>

                                  {activeActionId === task.id && (
                                    <div className="absolute right-4 top-8 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-left">
                                      <button
                                        onClick={() => handleOpenEdit(task)}
                                        className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Edit size={12} /> Edit
                                      </button>
                                      <button
                                        onClick={() => handleDelete(task.id)}
                                        className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <Trash2 size={12} /> Delete
                                      </button>
                                    </div>
                                  )}

                                  {task.desc && (
                                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                                      {task.desc}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-2 mb-4">
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${task.priorityColor}`}
                                    >
                                      {task.priority}
                                    </span>
                                    {task.dueDate && (
                                      <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Clock size={10} /> {task.dueDate}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                                      <div className="flex items-center gap-1">
                                        <MessageSquare size={14} />{" "}
                                        {task.activity?.commentsList?.length ||
                                          0}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Paperclip size={14} />{" "}
                                        {task.activity?.attachmentsList
                                          ?.length || 0}
                                      </div>
                                    </div>

                                    <div className="flex -space-x-1.5">
                                      {task.assignee &&
                                        task.assignee.map((person, idx) => (
                                          <div
                                            key={idx}
                                            className={`w-6 h-6 rounded-full ${person.color} flex items-center justify-center text-white text-[10px] font-medium border-2 border-white ring-1 ring-gray-100`}
                                          >
                                            {person.initials}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* MODAL: Create / Edit Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {editingTaskId ? "Edit Task" : "Create New Task"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="e.g. Design Homepage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  placeholder="Add details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client
                  </label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) =>
                      setFormData({ ...formData, client: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData({ ...formData, stage: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  >
                    {KANBAN_COLUMNS.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image (Optional)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG (MAX. 2MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, file: e.target.files[0] })
                      }
                    />
                  </label>
                </div>
                {formData.file && (
                  <p className="text-xs text-green-600 mt-1">
                    Selected: {formData.file.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  {editingTaskId ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVITY MODAL */}
      {activityModalOpen && currentActivityTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {currentActivityTask.title}
                </h3>
                <span className="text-sm text-gray-500">Task Activity</span>
              </div>
              <button
                onClick={() => setActivityModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-gray-200 px-6">
              <button
                onClick={() => setActiveTab("comments")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "comments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveTab("attachments")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "attachments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Attachments
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {activeTab === "comments" ? (
                <div className="space-y-6">
                  {/* New Comment Input */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                      YO
                    </div>
                    <div className="flex-1">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const val = e.target.comment.value;
                          if (val.trim()) {
                            handleAddComment(val);
                            e.target.reset();
                          }
                        }}
                      >
                        <textarea
                          name="comment"
                          placeholder="Write a comment..."
                          className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm resize-none bg-white"
                          rows="2"
                        ></textarea>
                        <div className="flex justify-end mt-2">
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Post
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* List */}
                  <div className="space-y-4">
                    {currentActivityTask.activity?.commentsList?.map(
                      (comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0">
                            {comment.initials || "U"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm text-gray-900">
                                {comment.author}
                              </span>
                              <span className="text-xs text-gray-400">
                                {comment.date}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-blue-400 transition-all group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                      <Plus size={24} />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload file
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Max size 2MB</p>
                  </div>

                  {/* List */}
                  <div className="grid grid-cols-2 gap-4">
                    {currentActivityTask.activity?.attachmentsList?.map(
                      (file) => (
                        <div
                          key={file.id}
                          className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 group relative hover:shadow-md transition-shadow"
                        >
                          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                            <FileText size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {file.size} • {file.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                              href={file.data}
                              download={file.name}
                              className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"
                            >
                              <Download size={16} />
                            </a>
                            <button
                              onClick={() => handleDeleteAttachment(file.id)}
                              className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
