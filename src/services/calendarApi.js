import authApi from "./authApi";

/**
 * Calendar API Service
 * All API calls for Calendar/Events management
 */

export const calendarApi = {
  /**
   * Get all calendar events
   * @param {Object} params - Query parameters (date, start_date, end_date, type)
   * @returns {Promise}
   */
  getEvents: (params = {}) => {
    return authApi.get("/calendar/events/", { params });
  },

  /**
   * Get events for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise}
   */
  getEventsByDate: (date) => {
    return authApi.get("/calendar/events/", { params: { date } });
  },

  /**
   * Get week view events
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise}
   */
  getWeekView: (date) => {
    return authApi.get("/calendar/events/week_view/", { params: { date } });
  },

  /**
   * Get month view events
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise}
   */
  getMonthView: (date) => {
    return authApi.get("/calendar/events/month_view/", { params: { date } });
  },

  /**
   * Get today's events
   * @returns {Promise}
   */
  getTodayEvents: () => {
    return authApi.get("/calendar/events/today_events/");
  },

  /**
   * Get upcoming events
   * @param {number} limit - Maximum number of events to return
   * @returns {Promise}
   */
  getUpcomingEvents: (limit = 10) => {
    return authApi.get("/calendar/events/upcoming_events/", { params: { limit } });
  },

  /**
   * Get single event by ID
   * @param {number} id - Event ID
   * @returns {Promise}
   */
  getEvent: (id) => {
    return authApi.get(`/calendar/events/${id}/`);
  },

  /**
   * Create new event
   * @param {Object} eventData - Event data
   * @returns {Promise}
   */
  createEvent: (eventData) => {
    // Map frontend field names to backend field names
    const data = {
      title: eventData.title,
      description: eventData.desc || eventData.description || "",
      event_type: eventData.type || "meeting",
      event_date: eventData.date,
      start_time: eventData.start,
      end_time: eventData.end || eventData.start,
      location: eventData.location || "",
      attendees: eventData.attendees || "",
      reminder_set: eventData.reminder_set !== false,
      reminder_minutes_before: eventData.reminder_minutes_before || 15,
    };

    return authApi.post("/calendar/events/", data);
  },

  /**
   * Update existing event
   * @param {number} id - Event ID
   * @param {Object} eventData - Event data
   * @returns {Promise}
   */
  updateEvent: (id, eventData) => {
    const data = {
      title: eventData.title,
      description: eventData.desc || eventData.description || "",
      event_type: eventData.type || "meeting",
      event_date: eventData.date,
      start_time: eventData.start,
      end_time: eventData.end || eventData.start,
      location: eventData.location || "",
      attendees: eventData.attendees || "",
      reminder_set: eventData.reminder_set !== false,
      reminder_minutes_before: eventData.reminder_minutes_before || 15,
    };

    return authApi.patch(`/calendar/events/${id}/`, data);
  },

  /**
   * Delete event
   * @param {number} id - Event ID
   * @returns {Promise}
   */
  deleteEvent: (id) => {
    return authApi.delete(`/calendar/events/${id}/`);
  },

  /**
   * Get event attendees
   * @param {number} id - Event ID
   * @returns {Promise}
   */
  getAttendees: (id) => {
    return authApi.get(`/calendar/events/${id}/attendees/`);
  },

  /**
   * Add attendee to event
   * @param {number} id - Event ID
   * @param {Object} attendeeData - Attendee data
   * @returns {Promise}
   */
  addAttendee: (id, attendeeData) => {
    return authApi.post(`/calendar/events/${id}/add_attendee/`, attendeeData);
  },

  /**
   * Update attendee response
   * @param {number} id - Event ID
   * @param {number} attendeeId - Attendee ID
   * @param {string} status - Response status (accepted, declined, tentative)
   * @returns {Promise}
   */
  respondToEvent: (id, attendeeId, status) => {
    return authApi.post(`/calendar/events/${id}/attendees/${attendeeId}/respond/`, { status });
  },

  /**
   * Remove attendee from event
   * @param {number} id - Event ID
   * @param {number} attendeeId - Attendee ID
   * @returns {Promise}
   */
  removeAttendee: (id, attendeeId) => {
    return authApi.delete(`/calendar/events/${id}/attendees/${attendeeId}/`);
  },

  /**
   * Search events
   * @param {Object} params - Search parameters
   * @returns {Promise}
   */
  searchEvents: (params = {}) => {
    return authApi.get("/calendar/events/", { params });
  },
};

export default calendarApi;
