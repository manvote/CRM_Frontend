
const STORAGE_KEY = "manovate_calendar_events_v2"; // Bump version to clear old invalid data

// Helper to get today's date in YYYY-MM-DD format
const getToday = () => new Date().toISOString().split('T')[0];
const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
};

const initialEvents = [
  {
    id: 1,
    title: "Client Meeting",
    start: "10:00",
    end: "11:00",
    date: getToday(), // Dynamically set to today
    type: "meeting",
    color: "bg-green-500",
    duration: "60 min",
    desc: "Discuss project requirements",
  },
  {
    id: 2,
    title: "Team Sync",
    start: "13:00",
    end: "14:00",
    date: getToday(),
    type: "event",
    color: "bg-blue-400",
    duration: "60 min",
    desc: "Weekly sync up",
  },
  {
    id: 3,
    title: "Project Review",
    start: "14:00",
    end: "15:00",
    date: getTomorrow(), // Set to tomorrow
    type: "meeting",
    color: "bg-green-600",
    duration: "60 min",
    desc: "Review Q4 goals",
  },
];

export const getEvents = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialEvents));
        return initialEvents;
    }
    return JSON.parse(stored);
}

export const saveEvent = (event) => {
    const events = getEvents();
    events.push({ ...event, id: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new Event("storage"));
};

export const updateEvent = (updatedEvent) => {
    const events = getEvents();
    const index = events.findIndex((e) => e.id === updatedEvent.id);
    if (index !== -1) {
        events[index] = updatedEvent;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        window.dispatchEvent(new Event("storage"));
    }
};

export const deleteEvent = (eventId) => {
    const events = getEvents();
    const filtered = events.filter((e) => e.id !== eventId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));
};
