# Complete Developer Quick Reference Guide

## 🎯 What You Need to Know - CRITICAL

### 1. Field Name Mapping (MOST IMPORTANT!)
Frontend uses **camelCase**, Backend uses **snake_case**. Always convert!

```javascript
// ❌ WRONG - Backend rejects this
const formData = {
  dueDate: '2026-02-02',
  startTime: '10:00',
  assigneeInitials: 'JD'
};

// ✅ CORRECT - Maps to backend names
const formData = {
  due_date: '2026-02-02',
  start_time: '10:00',
  assignee_initials: 'JD'
};
```

### 2. File Upload Rule (SUPER IMPORTANT!)
**Never** set Content-Type header manually!

```javascript
// ❌ WRONG - Breaks file upload
axios.post('/upload/', formData, {
  headers: { 'Content-Type': 'application/json' }  // NO! NO! NO!
});

// ✅ CORRECT - Let axios auto-detect
const formData = new FormData();
formData.append('file', file);
axios.post('/upload/', formData);  // axios adds proper boundary automatically
```

### 3. JWT Authentication (ALWAYS REQUIRED)
Every protected endpoint needs JWT token.

```javascript
// ❌ WRONG - Will get 401 Unauthorized
fetch('/api/deals/');

// ✅ CORRECT - Token auto-added by interceptor
import authApi from './services/authApi';
authApi.get('/deals/');  // ← Token automatically included!
```

---

## 📁 Your Complete File Structure

```
crmfrontend/
├── src/
│   ├── services/                      ✅ ALL READY
│   │   ├── authApi.js                 - JWT + Token refresh
│   │   ├── dealsApi.js                - Deals CRUD
│   │   ├── calendarApi.js             - Calendar events
│   │   ├── dashboardApi.js            - Dashboard metrics
│   │   ├── leadsApi.js                - Leads management
│   │   └── tasksApi.js                - Tasks management
│   │
│   ├── hooks/                         ✅ ALL READY
│   │   ├── useCalendar.js             - Event management
│   │   └── useDashboard.js            - Dashboard data
│   │
│   ├── pages/
│   │   ├── Deals.jsx                  ⏳ UPDATE WITH CODE
│   │   ├── Calendar.jsx               ⏳ UPDATE WITH CODE
│   │   ├── Dashboard.jsx              ⏳ UPDATE WITH CODE
│   │   ├── Leads.jsx
│   │   ├── Tasks.jsx
│   │   ├── Login.jsx
│   │   └── ...
│   │
│   ├── components/
│   │   ├── Toast.jsx
│   │   ├── LeadsListView.jsx
│   │   └── ...
│   │
│   └── utils/
│       ├── authStorage.js
│       ├── leadsStorage.js
│       └── ...
│
├── DOCUMENTATION (READ THESE)
├── IMPLEMENTATION_GUIDE.md             - Step-by-step instructions
├── ARCHITECTURE_DIAGRAM.md             - System design
├── FINAL_CHECKLIST.md                  - Complete task checklist
└── QUICK_REFERENCE.md                  - This file!
```

---

## 🚀 Super Quick Start (5 minutes)

### Step 1: Start Frontend
```bash
npm run dev
# Opens http://localhost:5173
```

### Step 2: Start Backend  
```bash
python manage.py runserver
# Runs on http://localhost:8000
```

### Step 3: Copy Component Code
Copy from **IMPLEMENTATION_GUIDE.md** into these files:
- `src/pages/Deals.jsx`
- `src/pages/Calendar.jsx`
- `src/pages/Dashboard.jsx`

### Step 4: Test It
- Create a deal → Check it appears
- Create an event → Check calendar
- View dashboard → Check metrics

---

## 💻 API Services - Copy Paste Ready

All services are **PRODUCTION READY** - just import and use!

### Deals
```javascript
import { dealsApi } from '../services/dealsApi';

// Get all deals
const response = await dealsApi.getDeals();
setDeals(response.data);

// Create deal
await dealsApi.createDeal({
  title: 'Enterprise Deal',
  client: 'Acme Corp',
  amount: 50000,
  due_date: '2026-02-15'
});

// Update deal
await dealsApi.updateDeal(dealId, {
  stage: 'closed',
  status: 'won'
});

// Delete deal
await dealsApi.deleteDeal(dealId);
```

### Calendar Events
```javascript
import { calendarApi } from '../services/calendarApi';

// Get week view
const weekEvents = await calendarApi.getWeekView('2026-02-15');

// Create event
await calendarApi.createEvent({
  title: 'Client Meeting',
  event_type: 'meeting',
  event_date: '2026-02-15',
  start_time: '10:00',
  end_time: '11:00'
});

// Add attendee
await calendarApi.addAttendee(eventId, 'client@example.com');
```

### Dashboard
```javascript
import { dashboardApi } from '../services/dashboardApi';

// Get summary (everything)
const summary = await dashboardApi.getSummary();
// Returns: metrics, activities, suggestions

// Get activities
const activities = await dashboardApi.getActivities();

// Get AI suggestions
const suggestions = await dashboardApi.getSuggestions();

// Log activity
await dashboardApi.logActivity({
  activity_type: 'deal_created',
  title: 'New deal created: Enterprise Deal'
});
```

---

## 🎣 React Hooks - Also Production Ready!

### useCalendarEvents Hook
```javascript
import { useCalendarEvents } from '../hooks/useCalendar';

function MyComponent() {
  const {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    getWeekView,
    getMonthView
  } = useCalendarEvents();

  // Events automatically loaded when component mounts
  // Just use the functions to modify
  const handleCreate = async (eventData) => {
    await createEvent(eventData);
    // events array updates automatically!
  };
}
```

### useDashboardSummary Hook
```javascript
import { useDashboardSummary } from '../hooks/useDashboard';

function Dashboard() {
  const {
    metrics,        // { total_leads, active_deals, ... }
    activities,     // [ { id, activity_type, title, ... }, ... ]
    suggestions,    // [ { id, title, priority, ... }, ... ]
    loading,
    error,
    refreshMetrics
  } = useDashboardSummary();

  // Data loaded automatically
  // Call refreshMetrics() to refresh manually
}
```

### useAISuggestions Hook
```javascript
import { useAISuggestions } from '../hooks/useDashboard';

function Suggestions() {
  const {
    suggestions,
    markActioned,  // Mark suggestion as completed
    loading
  } = useAISuggestions();

  const handleDone = async (suggestionId) => {
    await markActioned(suggestionId);
    // suggestions array updates automatically
  };
}
```

---

## ⚡ Copy-Paste Code Blocks

### Login Form
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    setError('');
    
    const response = await authApi.post('/token/', {
      email,
      password
    });
    
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    window.location.href = '/dashboard';
  } catch (err) {
    setError(err.response?.data?.detail || 'Login failed');
  } finally {
    setLoading(false);
  }
};
```

### Create Item Modal
```javascript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ /* initial */ });
const [loading, setLoading] = useState(false);

const handleSave = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    
    if (formData.id) {
      await apiService.update(formData.id, formData);
    } else {
      await apiService.create(formData);
    }
    
    // Refresh list
    await fetchItems();
    setIsOpen(false);
    setFormData({ /* reset */ });
  } catch (error) {
    alert(error.response?.data?.detail || 'Error saving');
  } finally {
    setLoading(false);
  }
};
```

### Error Toast
```javascript
const [toast, setToast] = useState(null);

// Show error
try {
  await something();
} catch (error) {
  setToast({
    type: 'error',
    message: error.response?.data?.detail || 'Something went wrong'
  });
}

// Show success
setToast({
  type: 'success',
  message: 'Saved successfully!'
});

// In JSX
{toast && (
  <div className={`p-4 rounded ${
    toast.type === 'error' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-green-100 text-green-800'
  }`}>
    {toast.message}
    <button onClick={() => setToast(null)}>×</button>
  </div>
)}
```

---

## 🔍 Debugging Checklist

### API Not Working?
1. **Check token exists**: `console.log(localStorage.getItem('access_token'))`
2. **Check endpoint URL**: DevTools → Network → inspect request URL
3. **Check error response**: `console.log(error.response.data)`
4. **Check CORS**: Browser console for CORS error messages
5. **Check backend**: `python manage.py shell` → query database directly

### Component Not Updating?
1. **Check hook is called**: Is `useCalendarEvents()` at top of component?
2. **Check dependencies**: `useEffect(fn, [dependencies])`
3. **Check state updates**: `console.log(events)` after API call
4. **Check loading state**: `if (loading) return <div>Loading...</div>`

### Form Not Saving?
1. **Check all required fields**: Form validation before submit
2. **Check field names**: Are they snake_case in backend data?
3. **Check API error**: `console.log(error.response.data)`
4. **Check network request**: DevTools → Network → Payload tab

---

## 🧪 Testing Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
python manage.py runserver        # Start server
python manage.py test             # Run tests
python manage.py migrate          # Run migrations
python manage.py createsuperuser  # Create admin

# Database
python manage.py dbshell          # Connect to database
python manage.py shell            # Django shell
```

---

## 📊 Common Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | ✅ Success | Data is valid |
| 201 | ✅ Created | Item created, return to list |
| 400 | ❌ Bad Request | Fix validation errors in form |
| 401 | ❌ Unauthorized | User not logged in, redirect to login |
| 403 | ❌ Forbidden | User doesn't have permission |
| 404 | ❌ Not Found | Item doesn't exist |
| 500 | ❌ Server Error | Backend issue, check server logs |

---

## 🎯 Required Background Knowledge

### Field Mapping (Must Know!)
```javascript
// Frontend → Backend conversion
const frontendData = {
  dueDate: '2026-02-02',
  startTime: '10:00',
  eventType: 'meeting'
};

const backendData = {
  due_date: '2026-02-02',      // dueDate → due_date
  start_time: '10:00',          // startTime → start_time
  event_type: 'meeting'         // eventType → event_type
};
```

### Loading State Pattern
```javascript
// Always follow this pattern
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetch = async () => {
    try {
      setLoading(true);
      const response = await apiCall();
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetch();
}, []);

// Render properly
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
return <div>{data?.title}</div>;
```

### Error Handling Pattern
```javascript
try {
  const response = await apiCall();
  // Success - response.data has data
} catch (error) {
  // Check what type of error
  if (error.response) {
    // Server responded with error code
    console.log(error.response.status);      // 400, 401, 500
    console.log(error.response.data);        // { detail: 'Error message' }
  } else {
    // Network error
    console.log(error.message);               // 'Network error'
  }
}
```

---

## 🔐 Security Checklist Before Production

- [ ] No tokens in console.logs
- [ ] No secrets in git commits
- [ ] HTTPS enabled on server
- [ ] CORS configured for production domain only
- [ ] Database backups automated
- [ ] Admin panel not public
- [ ] Rate limiting on login endpoint
- [ ] User input validated before sending

---

## 📈 Performance Quick Wins

```javascript
// ✅ Pagination
const [page, setPage] = useState(1);
const deals = await dealsApi.getDeals({ page });

// ✅ Debounce search (install: npm install lodash)
import { debounce } from 'lodash';
const search = debounce(async (query) => {
  const results = await apiService.search(query);
}, 300);

// ✅ Lazy loading
const events = await calendarApi.getWeekView(date);  // Not all events!

// ❌ Avoid: Loading everything at once
const allEvents = await calendarApi.getEvents();     // Slow!
```

---

## 🎁 Pro Tips

1. **Use DevTools constantly**: Network tab shows every request/response
2. **Test edge cases**: Empty states, errors, loading times
3. **Check console logs**: `console.error()` before deployment
4. **Use TypeScript**: Catch errors before runtime (optional but recommended)
5. **Write tests**: Prevents regressions
6. **Document changes**: Comments for complex logic
7. **Keep it simple**: Simpler code = fewer bugs

---

## 📞 Quick Help

**Frontend not updating after API call?**
- Check if component re-renders: `console.log(data)` in render
- Check if API actually returns data: Network tab → Response
- Check if state was updated: Use React DevTools

**API returning 400 error?**
- Check field names are snake_case
- Check all required fields are present
- Check data types (numbers, strings, dates)

**Getting 401 Unauthorized?**
- Check token in localStorage: `localStorage.getItem('access_token')`
- Check token not expired
- Check Django CORS settings

**File upload not working?**
- Don't set Content-Type manually
- Use FormData for files
- Check file size not too large

---

## 🚀 You're Ready! What's Next?

1. **Copy component code** from IMPLEMENTATION_GUIDE.md
2. **Start frontend**: `npm run dev`
3. **Start backend**: `python manage.py runserver`
4. **Test everything**: Try create/update/delete
5. **Deploy**: When tests pass

**Total time: ~2 hours from here to production** ⏱️

Good luck! 🎉
