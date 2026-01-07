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
  const [events, setEvents] = useState([]);
  const [currentTab, setCurrentTab] = useState("All Scheduled");

  // Derived Date State
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday start to match implied design or standard? Design days: 12 (Fri), 13 (Sat), 14 (Sun)... weird sequence in design but usually Sun/Mon start. Let's use Sunday Default.
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
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
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-hidden relative">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6 shrink-0">
        <div className="flex justify-between items-start">
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
            )
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800 w-40">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={prevWeek}
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
              onClick={nextWeek}
              className="p-1.5 hover:bg-gray-50 text-gray-600 rounded-r-lg border-l border-gray-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-medium text-gray-600">
          <button className="px-3 py-1 bg-white shadow-sm rounded-md text-gray-900">
            Month
          </button>
          <button className="px-3 py-1 hover:bg-white/50 rounded-md">
            Week
          </button>
          <button className="px-3 py-1 hover:bg-white/50 rounded-md">
            Day
          </button>
          <button className="px-3 py-1 hover:bg-white/50 rounded-md">
            List
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Main Grid */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden md:overflow-hidden overflow-x-auto flex flex-col shadow-sm min-h-0">
          {/* Grid Header */}
          <div className="grid grid-cols-[60px_1fr] border-b border-gray-200 bg-gray-50/50 min-w-[800px]">
            <div className="p-4 text-xs font-medium text-gray-400 border-r border-gray-100 flex items-center justify-center">
              GMT +5
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
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-[60px_1fr] min-w-[800px]">
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
                {/* Current Time Indicator Line (Approximate for valid day) */}
                {/* Logic omitted for brevity, can add later */}

                {/* Horizontal Lines for Hours */}
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
                            onClick={() => handleSlotClick(dateStr, hour)}
                          >
                            {event && (
                              <div
                                onClick={(e) => handleEventClick(e, event)}
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
