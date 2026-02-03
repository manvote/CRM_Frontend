/**
 * Updated Calendar.jsx Integration Guide
 * 
 * Replace the calendarStorage imports in Calendar.jsx with the useCalendarEvents hook
 * 
 * BEFORE (localStorage):
 * import { getEvents, saveEvent, updateEvent, deleteEvent } from "../utils/calendarStorage";
 * 
 * AFTER (API):
 * import { useCalendarEvents } from "../hooks/useCalendar";
 */

// ============ STEP 1: Import the hook ============
// Replace at top of Calendar.jsx:
import { useCalendarEvents } from "../hooks/useCalendar";

// ============ STEP 2: Update component ============
// Replace the useEffect that loads events:

// OLD CODE (DELETE THIS):
/*
useEffect(() => {
  setEvents(getEvents());
  const handleStorageChange = () => setEvents(getEvents());
  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);
*/

// NEW CODE (ADD THIS):
const { events, loading, error, createEvent, updateEvent, deleteEvent } = useCalendarEvents();

useEffect(() => {
  setEvents(events);
}, [events]);

// ============ STEP 3: Update handleSave ============
// Replace the handleSave function:

const handleSave = async () => {
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

  try {
    if (editingEvent) {
      await updateEvent(editingEvent.id, newEvent);
      addNotification({
        title: "Event Updated",
        message: `Updated "${formData.title}" on ${formData.date}`,
        type: "info",
      });
    } else {
      await createEvent(newEvent);
      addNotification({
        title: "New Event Created",
        message: `Scheduled "${formData.title}" for ${formData.date} at ${formData.start}`,
        type: "success",
      });
    }
    setIsModalOpen(false);
  } catch (err) {
    addNotification({
      title: "Error",
      message: err.message || "Failed to save event",
      type: "error",
    });
  }
};

// ============ STEP 4: Update handleDelete ============
const handleDelete = async () => {
  if (editingEvent) {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(editingEvent.id);
        addNotification({
          title: "Event Deleted",
          message: `Removed "${editingEvent.title}" from calendar.`,
          type: "warning",
        });
        setIsModalOpen(false);
      } catch (err) {
        addNotification({
          title: "Error",
          message: err.message || "Failed to delete event",
          type: "error",
        });
      }
    }
  }
};

// ============ STEP 5: Add loading state ============
// Add this before the main return statement:
if (loading && !events.length) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="mb-4">Loading calendar...</div>
        <div className="inline-block animate-spin">⟳</div>
      </div>
    </div>
  );
}

// ============ STEP 6: Add error display ============
if (error) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-red-600">
        <div className="mb-4">Error loading calendar</div>
        <div className="text-sm">{error}</div>
      </div>
    </div>
  );
}

// ============ COMPLETE USAGE EXAMPLE ============
/*

import React, { useState, useEffect } from "react";
import { useCalendarEvents } from "../hooks/useCalendar";
import { addNotification } from "../utils/notificationStorage";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react";

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTab, setCurrentTab] = useState("All Scheduled");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [localEvents, setLocalEvents] = useState([]);
  
  // Use the calendar hook
  const { events, loading, error, createEvent, updateEvent, deleteEvent } = useCalendarEvents();

  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  const handleSave = async () => {
    if (!formData.title) return alert("Title is required");
    
    const newEvent = {
      title: formData.title,
      type: formData.type,
      date: formData.date,
      start: formData.start,
      duration: formData.duration,
      desc: formData.desc,
      attendees: formData.attendees,
    };

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, newEvent);
        addNotification({
          title: "Event Updated",
          message: `Updated "${formData.title}"`,
          type: "info",
        });
      } else {
        await createEvent(newEvent);
        addNotification({
          title: "Event Created",
          message: `Created "${formData.title}"`,
          type: "success",
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      addNotification({
        title: "Error",
        message: err.message,
        type: "error",
      });
    }
  };

  return (
    // ... rest of component
  );
};

*/
