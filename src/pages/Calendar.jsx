import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  Search,
  Settings,
  MoreHorizontal,
  Clock,
  X,
  Trash2,
  MapPin,
  AlignLeft,
} from "lucide-react";
import {
  getEvents,
  saveEvent,
  updateEvent,
  deleteEvent,
} from "../utils/calendarStorage";
import { addNotification } from "../utils/notificationStorage";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from "date-fns";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 to 21:00

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("week"); // "month", "week", "day", "list"
  const [events, setEvents] = useState([]);
  const [currentTab, setCurrentTab] = useState("All Scheduled");

  // Mini Calendar State
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());
  const miniMonthStart = startOfMonth(miniCalendarDate);
  const miniMonthEnd = endOfMonth(miniMonthStart);
  const miniStartDate = startOfWeek(miniMonthStart);
  const miniEndDate = endOfWeek(miniMonthEnd);
  const miniCalendarDays = eachDayOfInterval({
    start: miniStartDate,
    end: miniEndDate,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "meeting",
    date: format(new Date(), "yyyy-MM-dd"),
    start: "09:00",
    duration: "60 min",

    desc: "",
    attendees: "",
  });

  useEffect(() => {
    setEvents(getEvents());

    const handleStorageChange = () => setEvents(getEvents());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const getEventForSlot = (dayDateStr, hour) => {
    return events.find((e) => {
      const matchesDate =
        e.date === dayDateStr && parseInt(e.start.split(":")[0]) === hour;
      if (!matchesDate) return false;

      if (currentTab === "All Scheduled") return true;
      if (currentTab === "Events") return e.type === "event";
      if (currentTab === "Meetings") return e.type === "meeting";
      if (currentTab === "Task Reminder") return e.type === "reminder";
      return true;
    });
  };

  // Navigation Handlers
  // Navigation Handlers
  const nextPeriod = () => {
    switch (view) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      case "list":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      default:
        break;
    }
  };

  const prevPeriod = () => {
    switch (view) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, -1));
        break;
      case "list":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      default:
        break;
    }
  };

  const today = () => {
    const now = new Date();
    setCurrentDate(now);
    setMiniCalendarDate(now);
  };

  const nextMiniMonth = () =>
    setMiniCalendarDate(addMonths(miniCalendarDate, 1));
  const prevMiniMonth = () =>
    setMiniCalendarDate(subMonths(miniCalendarDate, 1));

  const handleSlotClick = (dayDateStr, hour) => {
    setEditingEvent(null);
    setFormData({
      title: "",
      type: "meeting",
      date: dayDateStr,
      start: `${hour.toString().padStart(2, "0")}:00`,
      duration: "60 min",
      desc: "",
      attendees: "",
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (e, event) => {
    e.stopPropagation();
    setEditingEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      date: event.date,
      start: event.start,
      duration: event.duration,
      desc: event.desc || "",
      attendees: event.attendees || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title) return alert("Title is required");

    const colorMap = {
      meeting: "bg-green-600",
      event: "bg-blue-500",
      reminder: "bg-orange-500",
    };

    const newEvent = {
      ...formData,
      color: colorMap[formData.type] || "bg-gray-500",
      end: `${parseInt(formData.start.split(":")[0]) + 1}:00`,
    };

    if (editingEvent) {
      updateEvent({ ...editingEvent, ...newEvent });
      addNotification({
        title: "Event Updated",
        message: `Updated "${formData.title}" on ${formData.date}`,
        type: "info",
      });
    } else {
      saveEvent(newEvent);
      addNotification({
        title: "New Event Created",
        message: `Scheduled "${formData.title}" for ${formData.date} at ${formData.start}`,
        type: "success",
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (editingEvent) {
      if (confirm("Are you sure you want to delete this event?")) {
        deleteEvent(editingEvent.id);
        addNotification({
          title: "Event Deleted",
          message: `Removed "${editingEvent.title}" from calendar.`,
          type: "warning",
        });
        setIsModalOpen(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 md:p-6 overflow-hidden relative">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-500 text-sm mt-1">
              Stay Organized and on Track with your Personalized Calendar
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {/* Avatars */}
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-medium text-orange-600 border-2 border-white">
                N
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-600 border-2 border-white">
                M
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 border-2 border-white">
                R
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                +10
              </div>
            </div>
            <button
              onClick={() => {
                setEditingEvent(null);
                setFormData({
                  ...formData,
                  title: "",
                  desc: "",
                  attendees: "",
                  date: format(new Date(), "yyyy-MM-dd"),
                });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium shadow-sm transition-colors"
            >
              <UserPlusIcon size={16} /> Invite
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
          {["All Scheduled", "Events", "Meetings", "Task Reminder"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  currentTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 border-transparent border-b-2 hover:border-gray-300"
                }`}
              >
                {tab === "All Scheduled" && <CalendarIcon size={16} />}
                {tab === "Events" && (
                  <CalendarIcon size={16} className="text-orange-500" />
                )}
                {tab === "Meetings" && <MessageSquareIcon size={16} />}
                {tab === "Task Reminder" && <Clock size={16} />}
                {tab}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 shrink-0 gap-4 md:gap-0">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <h2 className="text-lg font-bold text-gray-800 w-40 truncate">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={prevPeriod}
              className="p-1.5 hover:bg-gray-50 text-gray-600 rounded-l-lg border-r border-gray-100"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={today}
              className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Today
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 hover:bg-gray-50 text-gray-600 rounded-r-lg border-l border-gray-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-medium text-gray-600 w-full md:w-auto justify-between md:justify-start">
          {[
            { id: "month", label: "Month" },
            { id: "week", label: "Week" },
            { id: "day", label: "Day" },
            { id: "list", label: "List" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex-1 md:flex-none px-3 py-1 rounded-md transition-all text-center ${
                view === v.id
                  ? "bg-white shadow-sm text-gray-900"
                  : "hover:bg-white/50 text-gray-500"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm min-h-0">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onSlotClick={(date) => handleSlotClick(date, 9)}
              onEventClick={handleEventClick}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onSlotClick={handleSlotClick}
              onEventClick={handleEventClick}
              getEventForSlot={getEventForSlot}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onSlotClick={handleSlotClick}
              onEventClick={handleEventClick}
              getEventForSlot={getEventForSlot}
            />
          )}
          {view === "list" && (
            <ListView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-72 hidden xl:flex flex-col gap-6 shrink-0">
          {/* Mini Calendar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-800">
                {format(miniCalendarDate, "MMMM")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMiniMonth}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="text-sm font-medium bg-gray-50 px-2 py-0.5 rounded text-gray-600">
                  {format(miniCalendarDate, "yyyy")}
                </div>
                <button
                  onClick={nextMiniMonth}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center text-xs mb-2 text-gray-400 font-medium">
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>
            <div className="grid grid-cols-7 text-center gap-y-1 text-sm font-medium text-gray-600">
              {miniCalendarDays.map((day, idx) => {
                const isSameMonthDay = isSameMonth(day, miniCalendarDate);
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, currentDate);
                return (
                  <div
                    key={idx}
                    className="h-8 flex items-center justify-center"
                  >
                    <button
                      onClick={() => setCurrentDate(day)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                    ${
                                      !isSameMonthDay
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                    }
                                    ${
                                      isToday && !isSelected
                                        ? "border border-blue-600 text-blue-600 font-bold"
                                        : ""
                                    }
                                    ${
                                      isSelected
                                        ? "bg-[#344873] text-white shadow-md shadow-blue-200"
                                        : "hover:bg-gray-100"
                                    }
                                `}
                    >
                      {format(day, "d")}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Event Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-medium"
                  placeholder="e.g. Client Meeting"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                    Type
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="meeting">Meeting</option>
                    <option value="event">Event</option>
                    <option value="reminder">Task Reminder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-700"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                    Start Time
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                    value={formData.start}
                    onChange={(e) =>
                      setFormData({ ...formData, start: e.target.value })
                    }
                  >
                    {HOURS.map((h) => {
                      const time = `${h.toString().padStart(2, "0")}:00`;
                      return (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                    Duration
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                  >
                    <option value="30 min">30 min</option>
                    <option value="60 min">60 min</option>
                    <option value="90 min">90 min</option>
                    <option value="120 min">120 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Guests / Attendees
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                  placeholder="Enter email addresses..."
                  value={formData.attendees}
                  onChange={(e) =>
                    setFormData({ ...formData, attendees: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm resize-none"
                  rows="3"
                  placeholder="Add notes..."
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                {editingEvent && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className={`flex-1 px-4 py-2 bg-[#344873] text-white rounded-lg text-sm font-bold hover:bg-[#253860] transition-colors shadow-lg shadow-blue-100 ${
                    !editingEvent && "w-full"
                  }`}
                >
                  {editingEvent ? "Update Event" : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal icon component if UserPlus is missing from lucide imports above or generic
const UserPlusIcon = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);
// --- View Components ---

const MonthView = ({ currentDate, events, onSlotClick, onEventClick }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Month Header (Days) */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {weekDays.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-100 last:border-0"
          >
            <span className="hidden md:inline">{d}</span>
            <span className="md:hidden">{d.charAt(0)}</span>
          </div>
        ))}
      </div>

      {/* Month Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
        {days.map((day, idx) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayEvents = events.filter((e) => e.date === dateStr);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={idx}
              className={`min-h-[60px] md:min-h-[100px] border-b border-r border-gray-100 p-1 md:p-2 flex flex-col gap-1 transition-colors hover:bg-gray-50 cursor-pointer ${
                !isCurrentMonth ? "bg-gray-50/30" : "bg-white"
              } ${isToday ? "bg-blue-50/30" : ""}`}
              onClick={() => onSlotClick(dateStr)} // Clicking a day opens modal for that day (default 9am)
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday
                      ? "bg-blue-600 text-white"
                      : !isCurrentMonth
                        ? "text-gray-400"
                        : "text-gray-700"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => onEventClick(e, event)}
                    className={`text-[10px] px-1.5 py-0.5 rounded truncate ${event.color} text-white shadow-sm cursor-pointer hover:brightness-110`}
                  >
                    <span className="hidden md:inline">{event.title}</span>
                    <span className="md:hidden w-1.5 h-1.5 rounded-full bg-white mx-auto block"></span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WeekView = ({
  currentDate,
  events,
  onSlotClick,
  onEventClick,
  getEventForSlot,
}) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col h-full bg-white overflow-x-auto">
      <div className="min-w-[700px] flex flex-col h-full">
        {/* Grid Header */}
        <div className="grid grid-cols-[60px_1fr] border-b border-gray-200 bg-gray-50/50">
          <div className="p-4 text-xs font-medium text-gray-400 border-r border-gray-100 flex items-center justify-center">
            GMT
          </div>
          <div className="grid grid-cols-7 divide-x divide-gray-100">
            {weekDays.map((day) => (
              <div
                key={day.toString()}
                className={`p-3 ${
                  isSameDay(day, new Date()) ? "bg-blue-50/50" : ""
                }`}
              >
                <div
                  className={`text-xl font-bold ${
                    isSameDay(day, new Date())
                      ? "text-blue-600"
                      : "text-gray-900"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {format(day, "MMM, EEEE")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Body */}
      </div>
      <div className="overflow-y-auto flex-1 custom-scrollbar min-w-[700px]">
        <div className="grid grid-cols-[60px_1fr]">
          {/* Time Labels */}
          <div className="border-r border-gray-100 bg-white">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-20 border-b border-gray-100 text-xs text-gray-400 flex items-start justify-center pt-2 relative"
              >
                <span className="relative -top-3 bg-white px-1">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Slots */}
          <div className="grid grid-cols-7 divide-x divide-gray-100 bg-white relative">
            <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-20 border-b border-gray-100 w-full"
                ></div>
              ))}
            </div>

            {weekDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              return (
                <div
                  key={dateStr}
                  className={`relative z-10 ${
                    isSameDay(day, new Date()) ? "bg-blue-50/10" : ""
                  }`}
                >
                  {HOURS.map((hour) => {
                    const event = getEventForSlot(dateStr, hour);
                    return (
                      <div
                        key={`${dateStr}-${hour}`}
                        className="h-20 w-full relative group cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => onSlotClick(dateStr, hour)}
                      >
                        {event && (
                          <div
                            onClick={(e) => onEventClick(e, event)}
                            className={`absolute inset-x-1 top-1 bottom-1 ${event.color} rounded-lg p-2 text-white shadow-sm hover:brightness-110 cursor-pointer transition-all z-20 overflow-hidden`}
                          >
                            <div className="text-xs font-bold leading-tight mb-0.5">
                              {event.start}
                            </div>
                            <div className="text-[10px] font-medium leading-tight truncate">
                              {event.title}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const DayView = ({
  currentDate,
  events,
  onSlotClick,
  onEventClick,
  getEventForSlot,
}) => {
  const dateStr = format(currentDate, "yyyy-MM-dd");
  const isToday = isSameDay(currentDate, new Date());

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="grid grid-cols-[60px_1fr] border-b border-gray-200 bg-gray-50/50">
        <div className="p-4 text-xs font-medium text-gray-400 border-r border-gray-100 flex items-center justify-center">
          GMT
        </div>
        <div className={`p-3 text-center ${isToday ? "bg-blue-50/50" : ""}`}>
          <div
            className={`text-2xl font-bold ${
              isToday ? "text-blue-600" : "text-gray-900"
            }`}
          >
            {format(currentDate, "d")}
          </div>
          <div className="text-sm text-gray-500 uppercase tracking-wide">
            {format(currentDate, "MMMM, EEEE")}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <div className="grid grid-cols-[60px_1fr]">
          {/* Time Labels */}
          <div className="border-r border-gray-100 bg-white">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-20 border-b border-gray-100 text-xs text-gray-400 flex items-start justify-center pt-2 relative"
              >
                <span className="relative -top-3 bg-white px-1">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Slots */}
          <div className="relative bg-white">
            <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-20 border-b border-gray-100 w-full"
                ></div>
              ))}
            </div>

            <div className={`relative z-10 ${isToday ? "bg-blue-50/10" : ""}`}>
              {HOURS.map((hour) => {
                const event = getEventForSlot(dateStr, hour);
                return (
                  <div
                    key={hour}
                    className="h-20 w-full relative group cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onSlotClick(dateStr, hour)}
                  >
                    {event && (
                      <div
                        onClick={(e) => onEventClick(e, event)}
                        className={`absolute inset-x-2 top-1 bottom-1 ${event.color} rounded-lg p-3 text-white shadow-sm hover:brightness-110 cursor-pointer transition-all z-20 overflow-hidden`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-bold leading-tight mb-1">
                              {event.title}
                            </div>
                            <div className="text-xs opacity-90">
                              {event.start} - {event.duration}
                            </div>
                          </div>
                          {event.desc && (
                            <div className="text-xs opacity-80 hidden sm:block max-w-[50%] truncate">
                              {event.desc}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ListView = ({ currentDate, events, onEventClick }) => {
  // Sort events by date and time
  const sortedEvents = [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.start.localeCompare(b.start);
  });

  // Filter events to show only from current date onwards (optional) or all?
  // User usually expects "Schedule" or "Agenda" view. Let's show all for the selected "Period" or just all future?
  // Let's show events for the currently selected Month in List View for better context switching.
  const filteredEvents = sortedEvents.filter((e) =>
    isSameMonth(new Date(e.date), currentDate),
  );

  if (filteredEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <CalendarIcon size={48} className="mb-4 text-gray-300" />
        <p className="text-lg font-medium">No events found for this month</p>
      </div>
    );
  }

  // Group by date
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-6 sticky top-0 bg-white pb-4 border-b border-gray-100 z-10">
        Agenda for {format(currentDate, "MMMM yyyy")}
      </h3>
      <div className="space-y-8">
        {Object.entries(groupedEvents).map(([date, dayEvents]) => (
          <div key={date} className="flex gap-6">
            <div className="w-20 text-right shrink-0">
              <div className="text-xl font-bold text-gray-900">
                {format(new Date(date), "d")}
              </div>
              <div className="text-xs text-gray-500 uppercase font-medium">
                {format(new Date(date), "EEE")}
              </div>
            </div>
            <div className="flex-1 space-y-3 pt-1">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => onEventClick(e, event)}
                  className={`flex items-center p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-${event.color.replace(
                    "bg-",
                    "",
                  )}`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${event.color} mr-4`}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h4>
                      <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {event.start}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {event.duration}
                      </span>
                      {event.type && (
                        <span className="capitalize px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold tracking-wide">
                          {event.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Internal icon component for MessageSquare if missing
const MessageSquareIcon = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

export default Calendar;
