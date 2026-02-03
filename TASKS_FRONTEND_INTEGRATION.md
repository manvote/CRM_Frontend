# Tasks Frontend Integration with Django Backend

## Overview
This document explains how the Tasks frontend has been integrated with the Django backend API, replacing localStorage with real backend communication.

## Files Modified

### 1. Created: `src/services/tasksApi.js`
New API service layer for all Tasks-related backend communication.

**Key Features:**
- Uses the authenticated API client (`authApi`) for automatic JWT token handling
- Supports all CRUD operations
- Handles file uploads for attachments and task images
- Includes error handling

**Available Methods:**

```javascript
// List tasks with optional filters
tasksApi.getTasks({ stage, priority, search })

// Get single task details
tasksApi.getTask(taskId)

// Create new task (supports image upload via FormData)
tasksApi.createTask(taskData)

// Update task (supports image upload via FormData)
tasksApi.updateTask(taskId, taskData)

// Delete task
tasksApi.deleteTask(taskId)

// Add comment to task
tasksApi.addComment(taskId, text)

// Add attachment to task (file upload)
tasksApi.addAttachment(taskId, file)

// Delete attachment from task
tasksApi.deleteAttachment(taskId, attachmentId)
```

### 2. Updated: `src/pages/Tasks.jsx`
Complete migration from localStorage to backend API calls.

**Major Changes:**

#### State Management
```javascript
// Added loading and error states
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
```

#### Data Fetching
```javascript
// Replaced localStorage getTasks() with API call
const fetchTasks = async () => {
  try {
    setLoading(true);
    const response = await tasksApi.getTasks();
    setTasks(response.data);
  } catch (err) {
    setError("Failed to load tasks");
  } finally {
    setLoading(false);
  }
};
```

#### Task Operations

**Create/Update Task:**
```javascript
const handleSaveTask = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (editingTaskId) {
      await tasksApi.updateTask(editingTaskId, formData);
    } else {
      await tasksApi.createTask(formData);
    }
    await fetchTasks(); // Refresh list
    setIsModalOpen(false);
  } catch (err) {
    setError("Failed to save task");
  } finally {
    setLoading(false);
  }
};
```

**Delete Task:**
```javascript
const handleDelete = async (id) => {
  if (window.confirm("Are you sure?")) {
    try {
      await tasksApi.deleteTask(id);
      await fetchTasks(); // Refresh list
    } catch (err) {
      setError("Failed to delete task");
    }
  }
};
```

**Drag and Drop (Stage Update):**
```javascript
const onDragEnd = async (result) => {
  const { destination, draggableId } = result;
  if (!destination) return;

  const taskId = Number(draggableId);
  const destStage = destination.droppableId;
  
  // Optimistic update for better UX
  const taskToUpdate = tasks.find((t) => t.id === taskId);
  setTasks(tasks.map((t) => 
    t.id === taskId ? { ...t, stage: destStage } : t
  ));

  // Sync with backend
  try {
    await tasksApi.updateTask(taskId, { stage: destStage });
  } catch (err) {
    setTasks(tasks); // Revert on error
    setError("Failed to update task stage");
  }
};
```

#### Comments Integration

```javascript
const handleAddComment = async (text) => {
  if (!currentActivityTask) return;

  try {
    await tasksApi.addComment(currentActivityTask.id, text);
    
    // Refresh task data
    const response = await tasksApi.getTask(currentActivityTask.id);
    const updatedTask = response.data;
    
    setTasks(tasks.map((t) => 
      t.id === updatedTask.id ? updatedTask : t
    ));
    setCurrentActivityTask(updatedTask);
  } catch (err) {
    setError("Failed to add comment");
  }
};
```

#### Attachments Integration

**Add Attachment:**
```javascript
const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  if (!file || !currentActivityTask) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("File size exceeds 5MB limit.");
    return;
  }

  try {
    await tasksApi.addAttachment(currentActivityTask.id, file);
    
    // Refresh task data
    const response = await tasksApi.getTask(currentActivityTask.id);
    const updatedTask = response.data;
    
    setTasks(tasks.map((t) => 
      t.id === updatedTask.id ? updatedTask : t
    ));
    setCurrentActivityTask(updatedTask);
  } catch (err) {
    setError("Failed to add attachment");
  }
};
```

**Delete Attachment:**
```javascript
const handleDeleteAttachment = async (attachmentId) => {
  if (!currentActivityTask) return;

  if (!window.confirm("Delete this attachment?")) return;

  try {
    await tasksApi.deleteAttachment(
      currentActivityTask.id, 
      attachmentId
    );
    
    // Refresh task data
    const response = await tasksApi.getTask(currentActivityTask.id);
    const updatedTask = response.data;
    
    setTasks(tasks.map((t) => 
      t.id === updatedTask.id ? updatedTask : t
    ));
    setCurrentActivityTask(updatedTask);
  } catch (err) {
    setError("Failed to delete attachment");
  }
};
```

#### UI Enhancements

**Error Display:**
```javascript
{error && (
  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
    <span className="text-sm text-red-600">{error}</span>
    <button onClick={() => setError("")}>
      <X size={16} />
    </button>
  </div>
)}
```

**Loading States:**
```javascript
// Loading spinner when fetching data
{loading && filteredTasks.length === 0 && (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)}

// Disabled buttons during operations
<button
  onClick={handleOpenCreate}
  disabled={loading}
  className="... disabled:opacity-50"
>
  <Plus size={18} /> Add New Task
</button>

// Submit button state
<button
  type="submit"
  disabled={loading}
  className="... disabled:opacity-50"
>
  {loading ? "Saving..." : editingTaskId ? "Save Changes" : "Create Task"}
</button>
```

## API Integration Features

### 1. Authentication
All API calls automatically include JWT authentication via the `authApi` service:
- Access token sent in Authorization header
- Automatic token refresh on 401 errors
- Logout on token refresh failure

### 2. Error Handling
Comprehensive error handling at every API call:
- Network errors caught and displayed
- Validation errors from backend shown to user
- Optimistic updates with rollback on failure

### 3. File Handling
Proper multipart/form-data uploads:
- Task images during create/update
- Attachments with correct content types
- File size validation (5MB limit)

### 4. Real-time Updates
Data synchronization:
- Fetch fresh data after mutations
- Optimistic updates for drag-and-drop
- Refresh individual tasks for comments/attachments

## Testing the Integration

### Prerequisites
1. Django backend running on `http://localhost:8000`
2. User logged in with valid JWT tokens
3. React frontend running on `http://localhost:5173`

### Test Cases

**1. Create Task:**
- Click "Add New Task"
- Fill in all fields
- Optionally add an image
- Submit form
- Verify task appears in the list
- Check Django admin for new task entry

**2. Update Task:**
- Click on a task's action menu (three dots)
- Select "Edit"
- Modify fields
- Submit changes
- Verify updates appear immediately

**3. Delete Task:**
- Click on action menu
- Select "Delete"
- Confirm deletion
- Verify task removed from list

**4. Drag and Drop:**
- Drag a task to a different stage column
- Verify position updates immediately
- Refresh page to confirm backend saved the change

**5. Add Comment:**
- Open task activity panel
- Type a comment
- Submit
- Verify comment appears in list

**6. Add Attachment:**
- Open task activity panel
- Click "Add Attachment"
- Select a file (< 5MB)
- Verify file appears in attachments list

**7. Delete Attachment:**
- Click delete icon on an attachment
- Confirm deletion
- Verify attachment removed

### Expected Backend Endpoints

Ensure these endpoints are available in Django:

```
GET    /api/tasks/                 # List tasks
POST   /api/tasks/                 # Create task
GET    /api/tasks/{id}/            # Get task details
PATCH  /api/tasks/{id}/            # Update task
DELETE /api/tasks/{id}/            # Delete task
POST   /api/tasks/{id}/comments/   # Add comment
POST   /api/tasks/{id}/attachments/ # Add attachment
DELETE /api/tasks/{id}/attachments/{attachment_id}/ # Delete attachment
```

## Data Format

### Task Object Expected from Backend

```javascript
{
  "id": 1,
  "title": "Task Title",
  "description": "Task description",
  "client": "Client Name",
  "stage": "To Do", // "To Do", "In Progress", "In Review", "Done"
  "priority": "High", // "Critical", "High", "Normal"
  "assignee_initials": "AB",
  "created_date": "2024-01-15",
  "updated_date": "2024-01-15",
  "image": "http://localhost:8000/media/tasks/image.jpg" // or null
}
```

### Comment Object

```javascript
{
  "id": 1,
  "text": "Comment text",
  "author": "User Name",
  "date": "2024-01-15T10:30:00Z",
  "initials": "UN"
}
```

### Attachment Object

```javascript
{
  "id": 1,
  "name": "document.pdf",
  "file": "http://localhost:8000/media/attachments/document.pdf",
  "size": "1.5 MB",
  "date": "2024-01-15T10:30:00Z"
}
```

## Troubleshooting

### Issue: "Failed to load tasks"
**Solution:**
- Check if backend is running
- Verify API endpoint: `http://localhost:8000/api/tasks/`
- Check browser console for CORS errors
- Ensure user is authenticated (check JWT tokens in localStorage)

### Issue: "Failed to save task"
**Solution:**
- Check form validation errors in browser console
- Verify all required fields are filled
- Check Django backend logs for validation errors
- Ensure multipart/form-data is properly configured in Django

### Issue: Image upload fails
**Solution:**
- Verify Django MEDIA settings are configured
- Check file size (max 5MB)
- Ensure `MEDIA_URL` and `MEDIA_ROOT` are set in Django settings
- Verify file permissions on media directory

### Issue: 401 Unauthorized errors
**Solution:**
- Check if JWT tokens are expired
- Try logging out and logging back in
- Verify Django JWT settings match frontend expectations
- Check token refresh logic in `authApi.js`

### Issue: CORS errors
**Solution:**
- Add frontend URL to Django CORS whitelist
- Install and configure `django-cors-headers`
- Ensure CORS middleware is enabled
- Check browser console for specific CORS error

## Next Steps

After confirming Tasks integration works:

1. **Leads Integration**: Apply similar pattern to Leads module
2. **Deals Integration**: Integrate Deals with backend
3. **Calendar Integration**: Connect Calendar module to backend
4. **Real-time Updates**: Consider WebSocket for live updates
5. **Offline Support**: Add service worker for offline capabilities
6. **Performance**: Implement pagination and virtual scrolling
7. **Testing**: Add unit and integration tests

## Related Documentation

- [AUTHENTICATION_INTEGRATION.md](./AUTHENTICATION_INTEGRATION.md) - JWT authentication setup
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - API quick reference
- [TASKS_BACKEND_IMPLEMENTATION.md](./TASKS_BACKEND_IMPLEMENTATION.md) - Backend implementation guide
