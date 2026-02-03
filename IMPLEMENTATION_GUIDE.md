# Complete Frontend Implementation Guide

## Overview

This guide provides step-by-step instructions to integrate your React frontend with the Django backend APIs. All services are already created and ready to use.

## Files Available

### API Services (Ready to Use)
- `src/services/authApi.js` - Authentication & JWT handling
- `src/services/dealsApi.js` - Deals CRUD operations
- `src/services/calendarApi.js` - Calendar events management
- `src/services/dashboardApi.js` - Dashboard metrics & activities
- `src/services/leadsApi.js` - Leads management
- `src/services/tasksApi.js` - Tasks management

### React Hooks (Ready to Use)
- `src/hooks/useCalendar.js` - Calendar event management
- `src/hooks/useDashboard.js` - Dashboard data management

---

## Step 1: Setup Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Or in `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      VITE_API_BASE_URL: JSON.stringify(
        process.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
      ),
    },
  },
});
```

---

## Step 2: Update Deals.jsx

### Current Issues
- Using localStorage (no persistence across sessions)
- No error validation feedback
- No loading states

### Updated Deals.jsx

```jsx
import { useState, useEffect } from 'react';
import { dealsApi } from '../services/dealsApi';
import Toast from '../components/Toast';

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    stage: 'negotiation',
    status: 'active',
    amount: '',
    dueDate: '',
    assigneeInitials: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Load deals on component mount
  useEffect(() => {
    fetchDeals();
  }, []);

  /**
   * Fetch all deals from API
   */
  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dealsApi.getDeals();
      setDeals(response.data);
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to fetch deals';
      setError(message);
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle save (create or update)
   */
  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.title || !formData.client || !formData.amount) {
        throw new Error('Please fill in all required fields');
      }

      // Map frontend field names to backend
      const backendData = {
        title: formData.title,
        client: formData.client,
        stage: formData.stage,
        status: formData.status,
        amount: parseFloat(formData.amount),
        due_date: formData.dueDate,
        assignee_initials: formData.assigneeInitials,
      };

      if (formData.id) {
        // Update existing deal
        await dealsApi.updateDeal(formData.id, backendData);
        setToast({ message: 'Deal updated successfully', type: 'success' });
      } else {
        // Create new deal
        await dealsApi.createDeal(backendData);
        setToast({ message: 'Deal created successfully', type: 'success' });
      }

      // Refresh deals list
      await fetchDeals();
      
      // Reset form
      setFormData({
        title: '',
        client: '',
        stage: 'negotiation',
        status: 'active',
        amount: '',
        dueDate: '',
        assigneeInitials: '',
      });
      setIsModalOpen(false);
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Failed to save deal';
      setError(message);
      setToast({ message, type: 'error' });
      
      // Show field-specific errors
      if (err.response?.data && typeof err.response.data === 'object') {
        console.error('Validation errors:', err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) {
      return;
    }

    try {
      setLoading(true);
      await dealsApi.deleteDeal(id);
      setToast({ message: 'Deal deleted successfully', type: 'success' });
      await fetchDeals();
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete deal';
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle edit
   */
  const handleEdit = (deal) => {
    setFormData({
      id: deal.id,
      title: deal.title,
      client: deal.client,
      stage: deal.stage,
      status: deal.status,
      amount: deal.amount,
      dueDate: deal.due_date,
      assigneeInitials: deal.assignee_initials,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Deals</h1>
        <button
          onClick={() => {
            setFormData({
              title: '',
              client: '',
              stage: 'negotiation',
              status: 'active',
              amount: '',
              dueDate: '',
              assigneeInitials: '',
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + New Deal
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && deals.length === 0 ? (
        <div className="text-center py-8">Loading deals...</div>
      ) : (
        <div className="grid gap-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="border rounded-lg p-4 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{deal.title}</h3>
                  <p className="text-gray-600">{deal.client}</p>
                  <p className="text-sm text-gray-500">
                    Amount: ${deal.amount} | Due: {deal.due_date}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      deal.stage === 'closed' ? 'bg-green-100 text-green-800' :
                      deal.stage === 'proposal' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {deal.stage}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      deal.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {deal.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(deal)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(deal.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-2xl font-bold mb-4">
              {formData.id ? 'Edit Deal' : 'New Deal'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Enterprise Contract"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Client *</label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) =>
                    setFormData({ ...formData, client: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="Client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) =>
                    setFormData({ ...formData, stage: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="lead">Lead</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="proposal">Proposal</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Assignee Initials</label>
                <input
                  type="text"
                  value={formData.assigneeInitials}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assigneeInitials: e.target.value.toUpperCase().slice(0, 2),
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  maxLength="2"
                  placeholder="JD"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : 'Save Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
```

---

## Step 3: Update Calendar.jsx

### Current State
- Using localStorage for events
- No real-time sync with backend

### Use the Hook

```jsx
import { useCalendarEvents } from '../hooks/useCalendar';
import Toast from '../components/Toast';

export default function Calendar() {
  const {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    getWeekView,
    getMonthView,
  } = useCalendarEvents();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'meeting',
    event_date: '',
    start_time: '',
    end_time: '',
  });

  // Load week view on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    getWeekView(today);
  }, [getWeekView]);

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (formData.id) {
        await updateEvent(formData.id, formData);
      } else {
        await createEvent(formData);
      }

      setToast({
        message: formData.id ? 'Event updated' : 'Event created',
        type: 'success',
      });

      setFormData({
        title: '',
        description: '',
        event_type: 'meeting',
        event_date: '',
        start_time: '',
        end_time: '',
      });
      setIsModalOpen(false);
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to save event',
        type: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this event?')) {
      try {
        await deleteEvent(id);
        setToast({ message: 'Event deleted', type: 'success' });
      } catch (err) {
        setToast({
          message: 'Failed to delete event',
          type: 'error',
        });
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + New Event
        </button>
      </div>

      {loading ? (
        <div>Loading events...</div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg p-4 hover:shadow-lg"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold">{event.title}</h3>
                  <p className="text-gray-600">{event.description}</p>
                  <p className="text-sm text-gray-500">
                    {event.event_date} {event.start_time} - {event.end_time}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFormData(event);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <form onSubmit={handleSave} className="space-y-4">
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Event title"
                className="w-full border rounded px-3 py-2"
              />

              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
                className="w-full border rounded px-3 py-2"
              />

              <input
                type="date"
                value={formData.event_date}
                onChange={(e) =>
                  setFormData({ ...formData, event_date: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />

              <div className="flex gap-2">
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  className="flex-1 border rounded px-3 py-2"
                />
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  className="flex-1 border rounded px-3 py-2"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
```

---

## Step 4: Update Dashboard.jsx

### Current State
- Hardcoded metrics
- No real data from backend

### Use the Hooks

```jsx
import { useDashboardSummary, useAISuggestions } from '../hooks/useDashboard';

export default function Dashboard() {
  const {
    metrics,
    activities,
    suggestions,
    loading: dashboardLoading,
    error: dashboardError,
    refreshMetrics,
  } = useDashboardSummary();

  const {
    suggestions: aiSuggestions,
    loading: suggestionsLoading,
    markActioned,
  } = useAISuggestions();

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  if (dashboardLoading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Leads</p>
          <p className="text-3xl font-bold">{metrics?.total_leads || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Active Deals</p>
          <p className="text-3xl font-bold">{metrics?.active_deals || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Upcoming Events</p>
          <p className="text-3xl font-bold">{metrics?.upcoming_events || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Pending Tasks</p>
          <p className="text-3xl font-bold">{metrics?.pending_tasks || 0}</p>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
        <div className="space-y-3">
          {activities?.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 pb-3 border-b last:border-b-0"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">{activity.activity_type}</p>
                <p className="text-gray-600 text-sm">{activity.title}</p>
                <p className="text-gray-400 text-xs">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">AI Suggestions</h2>
        <div className="space-y-3">
          {aiSuggestions?.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded"
            >
              <div className="flex-1">
                <p className="font-medium">{suggestion.title}</p>
                <p className="text-gray-600 text-sm">{suggestion.description}</p>
                <p className={`text-xs font-semibold mt-1 ${
                  suggestion.priority === 'high'
                    ? 'text-red-600'
                    : suggestion.priority === 'medium'
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {suggestion.priority.toUpperCase()} PRIORITY
                </p>
              </div>
              {!suggestion.is_actioned && (
                <button
                  onClick={() => markActioned(suggestion.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 whitespace-nowrap"
                >
                  Mark Done
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Common Patterns & Best Practices

### Error Handling

```javascript
try {
  const response = await dealsApi.createDeal(data);
} catch (error) {
  // Handle different error types
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 400) {
    // Validation error
    console.error('Validation errors:', error.response.data);
  } else if (error.response?.status === 404) {
    // Not found
    console.error('Resource not found');
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

### Loading States

```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  try {
    setLoading(true);
    await apiCall();
  } finally {
    setLoading(false);
  }
};

// In JSX
<button disabled={loading}>
  {loading ? 'Saving...' : 'Save'}
</button>
```

### Form Data for File Upload

```javascript
// For uploading files with other data
const handleFileUpload = async (file, title) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file); // Note: file field name matches backend

  try {
    await authApi.post('/api/upload/', formData);
    // Don't set Content-Type header - axios handles it!
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Polling for Updates

```javascript
useEffect(() => {
  // Poll every 30 seconds
  const interval = setInterval(() => {
    fetchData();
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

---

## Testing Checklist

- [ ] Login works and stores tokens
- [ ] Deals CRUD operations work (Create, Read, Update, Delete)
- [ ] Calendar events display correctly
- [ ] Dashboard metrics load from API
- [ ] Error messages display correctly
- [ ] Loading states show properly
- [ ] Token refresh works (logout after 15 mins and re-login)
- [ ] File uploads work (if applicable)
- [ ] Activity logging works
- [ ] Timestamps format correctly

---

## Troubleshooting

### Issue: "401 Unauthorized" errors
**Solution:** Ensure access token is in localStorage and hasn't expired. Check authApi interceptor is set up correctly.

### Issue: "CORS errors"
**Solution:** Backend CORS must allow your frontend URL. Check Django CORS settings:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',  # Vite dev server
    'https://yourdomain.com',  # Production
]
```

### Issue: File upload fails (415 error)
**Solution:** Don't set Content-Type header manually when using FormData. Let axios auto-detect it.

### Issue: Hooks returning undefined
**Solution:** Ensure data is fully loaded before accessing. Check loading state first:
```javascript
if (loading) return <div>Loading...</div>;
return <div>{metrics?.total_leads}</div>;
```

---

## Next Steps

1. ✅ Copy Calendar.jsx code above
2. ✅ Copy Dashboard.jsx code above
3. ✅ Copy Deals.jsx code above
4. 📚 Set up Django backend (see backend guides)
5. 🧪 Test all API endpoints
6. 🚀 Deploy to production

All API services and hooks are production-ready! 🎉
