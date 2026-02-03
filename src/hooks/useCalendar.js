import { useState, useEffect } from "react";
import calendarApi from "../services/calendarApi";

/**
 * Hook to manage calendar events
 * Fetches from backend API instead of localStorage
 */
export const useCalendarEvents = (date = null) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        if (date) {
          response = await calendarApi.getEventsByDate(date);
        } else {
          response = await calendarApi.getEvents();
        }
        setEvents(response.data.results || response.data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch calendar events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [date]);

  const fetchEvents = async (targetDate = date) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (targetDate) {
        response = await calendarApi.getEventsByDate(targetDate);
      } else {
        response = await calendarApi.getEvents();
      }
      setEvents(response.data.results || response.data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await calendarApi.createEvent(eventData);
      setEvents([...events, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateEvent = async (id, eventData) => {
    try {
      const response = await calendarApi.updateEvent(id, eventData);
      setEvents(events.map((e) => (e.id === id ? response.data : e)));
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEvent = async (id) => {
    try {
      await calendarApi.deleteEvent(id);
      setEvents(events.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getWeekEvents = async (date) => {
    try {
      const response = await calendarApi.getWeekView(date);
      return response.data.events || [];
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getWeekEvents,
  };
};

/**
 * Hook to manage specific calendar event
 */
export const useCalendarEvent = (id) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await calendarApi.getEvent(id);
        setEvent(response.data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch event:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await calendarApi.getEvent(id);
      setEvent(response.data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch event:", err);
    } finally {
      setLoading(false);
    }
  };

  return { event, loading, error, fetchEvent };
};
