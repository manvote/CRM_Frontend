# CRM System Architecture Diagram

## Frontend-Backend Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         REACT FRONTEND (Vite)                          │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                     Pages & Components                         │   │
│  ├────────────────────────────────────────────────────────────────┤   │
│  │ • Deals.jsx          → dealsApi.js          → /api/deals/     │   │
│  │ • Calendar.jsx       → calendarApi.js       → /api/calendar/  │   │
│  │ • Dashboard.jsx      → dashboardApi.js      → /api/dashboard/ │   │
│  │ • Leads.jsx          → leadsApi.js          → /api/leads/     │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │              React Hooks (Data Management)                     │   │
│  ├────────────────────────────────────────────────────────────────┤   │
│  │ • useCalendarEvents() ────► Loading + Events + CRUD          │   │
│  │ • useDashboardSummary() ──► Metrics + Activities + Trends    │   │
│  │ • useAISuggestions() ─────► Suggestions + Priorities         │   │
│  │ • useMarketingPerformance()─► Performance Data               │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │              API Services (Axios)                             │   │
│  ├────────────────────────────────────────────────────────────────┤   │
│  │ • authApi.js      (Base with JWT interceptor)                │   │
│  │ • dealsApi.js     (Deals CRUD + attachments)                 │   │
│  │ • calendarApi.js  (Events + attendees)                       │   │
│  │ • dashboardApi.js (Metrics + activities + suggestions)       │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
│                        HTTP/HTTPS + JWT Token                         │
│                                  ▼                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │
┌─────────────────────────────────────────────────────────────────────────┐
│                  DJANGO REST FRAMEWORK BACKEND                          │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                         API Routes                             │   │
│  ├────────────────────────────────────────────────────────────────┤   │
│  │ POST   /api/deals/               → Create Deal               │   │
│  │ GET    /api/deals/{id}/          → Get Deal                  │   │
│  │ PATCH  /api/deals/{id}/          → Update Deal               │   │
│  │ DELETE /api/deals/{id}/          → Delete Deal               │   │
│  │ POST   /api/deals/{id}/add_comment/   → Add Comment          │   │
│  │ POST   /api/deals/{id}/add_attachment/ → Upload File         │   │
│  │                                                                │   │
│  │ POST   /api/calendar/events/     → Create Event              │   │
│  │ GET    /api/calendar/events/week_view/ → Week View           │   │
│  │ POST   /api/calendar/events/{id}/add_attendee/ → Add Guest   │   │
│  │                                                                │   │
│  │ GET    /api/dashboard/dashboard/summary/ → All Dashboard     │   │
│  │ GET    /api/dashboard/activities/ → Activity Log             │   │
│  │ GET    /api/dashboard/suggestions/active/ → AI Ideas         │   │
│  │ GET    /api/dashboard/performance/ → Performance Stats       │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                  ViewSets (API Controllers)                   │   │
│  ├────────────────────────────────────────────────────────────────┤   │
│  │ • DealViewSet       (CRUD + comments + attachments)          │   │
│  │ • CalendarEventViewSet (CRUD + attendees + reminders)        │   │
│  │ • DashboardViewSet  (Metrics aggregation + refresh)          │   │
│  │ • ActivityViewSet   (Activity logging)                       │   │
│  │ • AISuggestionViewSet (Recommendations engine)               │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    Serializers (Data Format)                  │   │
│  ├────────────────────────────────────────────────────────────────┤   │
│  │ • DealSerializer ◄──────────── Deal Model                    │   │
│  │ • CalendarEventSerializer ◄─── CalendarEvent Model           │   │
│  │ • DashboardMetricSerializer ◄─ DashboardMetric Model         │   │
│  │ • ActivitySerializer ◄───────── Activity Model               │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                  Django Models (Database Schema)              │   │
│  ├────────────────────────────────────────────────────────────────┤   │
│  │ DEALS APP:                                                     │   │
│  │  • Deal             (id, title, stage, status, amount, ...)  │   │
│  │  • DealComment      (id, deal_id, text, created_by, ...)    │   │
│  │  • DealAttachment   (id, deal_id, file, file_name, ...)     │   │
│  │                                                                │   │
│  │ CALENDAR APP:                                                  │   │
│  │  • CalendarEvent    (id, title, event_date, start_time, ...) │   │
│  │  • EventAttendee    (id, event_id, email, status, ...)      │   │
│  │  • EventReminder    (id, event_id, reminder_time, ...)      │   │
│  │                                                                │   │
│  │ DASHBOARD APP:                                                 │   │
│  │  • DashboardMetric  (user_id, total_leads, active_deals, ..)│   │
│  │  • DashboardActivity (user_id, activity_type, title, ...)   │   │
│  │  • AISuggestion     (user_id, type, priority, title, ...)   │   │
│  │  • MarketingPerformanceMetric (user_id, date, hours, ...)   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
│                    ▼──────────────────────────────▼                   │
│              PostgreSQL / SQLite Database                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Integration Map

```
┌──────────────────────────────────────────────────────────┐
│                      Frontend                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Calendar.jsx                          │  │
│  │  • useCalendarEvents()                            │  │
│  │  • useState(events, isModalOpen)                  │  │
│  │  • handleSave() → createEvent()                   │  │
│  │  • handleDelete() → deleteEvent()                 │  │
│  │  • renderWeekView() / renderMonthView()           │  │
│  └────────────────────────────────────────────────────┘  │
│           ▲                    │                           │
│           │                    ▼                           │
│    useCalendarEvents()  calendarApi.js                    │
│           │                    │                           │
│           └────────────────────┴──► authApi.get/post    │
│                                        (+JWT Token)       │
│                                        │                  │
└────────────────────────────────────────┼──────────────────┘
                                         │
                                         ▼
                    ┌────────────────────────────────────┐
                    │  BACKEND API                       │
                    │  /api/calendar/events/             │
                    │  /api/calendar/events/week_view/   │
                    │  /api/calendar/events/add_attendee/│
                    └────────────────────────────────────┘
                                         │
                                         ▼
                    ┌────────────────────────────────────┐
                    │  CalendarEventViewSet              │
                    │  • get_queryset()                  │
                    │  • perform_create()                │
                    │  • add_attendee()                  │
                    │  • week_view()                     │
                    └────────────────────────────────────┘
                                         │
                                         ▼
                    ┌────────────────────────────────────┐
                    │  Database Models                   │
                    │  • CalendarEvent                   │
                    │  • EventAttendee                   │
                    │  • EventReminder                   │
                    └────────────────────────────────────┘
```

## Data Flow Example: Create Event

```
Step 1: User clicks "Create Event"
   └─► Calendar.jsx shows modal form

Step 2: User submits form
   └─► handleSave() called
       ├─► formData = { title, type, date, start, end, ... }
       └─► createEvent(formData) from hook

Step 3: Hook sends to API
   └─► calendarApi.createEvent(formData)
       ├─► Maps frontend fields to backend
       │   ├─ type ──► event_type
       │   ├─ date ──► event_date
       │   ├─ start ─► start_time
       │   └─ end ───► end_time
       └─► axios.post('/calendar/events/', data)
           └─► Adds JWT token via interceptor

Step 4: Backend receives request
   └─► CalendarEventViewSet.create()
       ├─► Validates data via CalendarEventSerializer
       ├─► Calls perform_create()
       │   ├─► Sets owner = current_user
       │   └─► Creates EventReminder if needed
       └─► Returns 201 Created with event data

Step 5: Frontend updates state
   └─► Hook receives response.data
       ├─► Adds to events array
       ├─► Re-renders Calendar component
       └─► Shows notification: "Event Created!"

Step 6: Result
   └─► New event visible in calendar
       ├─► Attendees can be added
       ├─► Reminders will be sent
       └─► Activity logged in Dashboard
```

## API Request/Response Example

```
REQUEST:
────────
POST /api/calendar/events/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "title": "Client Meeting",
  "description": "Project discussion",
  "event_type": "meeting",
  "event_date": "2026-02-15",
  "start_time": "10:00",
  "end_time": "11:00",
  "location": "Conference Room A",
  "attendees": "client@example.com",
  "reminder_set": true,
  "reminder_minutes_before": 15
}

RESPONSE:
─────────
201 Created
Content-Type: application/json

{
  "id": 42,
  "title": "Client Meeting",
  "description": "Project discussion",
  "event_type": "meeting",
  "event_date": "2026-02-15",
  "start_time": "10:00",
  "end_time": "11:00",
  "location": "Conference Room A",
  "attendee_records": [
    {
      "id": 1,
      "email": "client@example.com",
      "status": "pending"
    }
  ],
  "reminders": [
    {
      "id": 1,
      "reminder_time": "2026-02-15T09:45:00Z",
      "is_sent": false
    }
  ],
  "owner_name": "John Doe",
  "created_at": "2026-02-02T10:30:00Z",
  "updated_at": "2026-02-02T10:30:00Z"
}
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────┐
│             First Request (Login)                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  User enters credentials                            │
│       ▼                                              │
│  POST /api/token/                                   │
│  { email, password }                                │
│       ▼                                              │
│  Backend validates, returns:                        │
│  {                                                  │
│    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",        │
│    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",       │
│    "user": { id, email, name, ... }               │
│  }                                                  │
│       ▼                                              │
│  localStorage stores:                              │
│  - access_token                                     │
│  - refresh_token                                    │
│  - user_info                                        │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│         Subsequent Requests (Protected)             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Axios interceptor adds:                           │
│  Authorization: Bearer {access_token}              │
│       ▼                                              │
│  GET /api/deals/                                    │
│  (with Authorization header)                        │
│       ▼                                              │
│  Backend verifies JWT ✓                            │
│  Returns data for current user                      │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│      Token Refresh (When token expires)             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  API returns 401 Unauthorized                       │
│       ▼                                              │
│  Interceptor catches error                          │
│       ▼                                              │
│  POST /api/token/refresh/                           │
│  { refresh: refresh_token }                         │
│       ▼                                              │
│  Backend returns new access_token                   │
│       ▼                                              │
│  localStorage updates new token                     │
│       ▼                                              │
│  Original request retried with new token ✓         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

**This architecture ensures:**
- ✅ Clean separation of concerns
- ✅ Scalable API design
- ✅ Secure JWT authentication
- ✅ Type-safe data validation
- ✅ Efficient database queries
- ✅ Real-time state management
- ✅ Error handling at every level
