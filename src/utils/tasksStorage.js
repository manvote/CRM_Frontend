const STORAGE_KEY = 'manovate_tasks_v1';

const MOCK_TASKS = [
  {
    id: 1,
    title: "Client Meeting Preparation",
    desc: "Prepare presentation slides and gathering requirements for Acme Corp.",
    client: "Acme Corp",
    priority: "High",
    priorityColor: "bg-red-100 text-red-600",
    stage: "To Do",
    dueDate: "2025-11-20",
    activity: { comments: 2, attachments: 1 },
    assignee: [{ initials: "JD", color: "bg-blue-500" }],
    createdOn: "2025-10-12T10:00:00Z"
  },
  {
    id: 2,
    title: "Update API Documentation",
    desc: "Review and update the endpoint documentation for the Q3 release.",
    client: "Internal",
    priority: "Medium",
    priorityColor: "bg-yellow-100 text-yellow-600",
    stage: "In Progress",
    dueDate: "2025-11-25",
    activity: { comments: 0, attachments: 0 },
    assignee: [{ initials: "AS", color: "bg-green-500" }],
    createdOn: "2025-10-15T11:30:00Z"
  },
  {
    id: 3,
    title: "Fix Navigation Bug",
    desc: "Navigation menu closes unexpectedly on mobile devices.",
    client: "Globex Inc",
    priority: "Critical",
    priorityColor: "bg-purple-100 text-purple-600",
    stage: "Review",
    dueDate: "2025-12-01",
    activity: { comments: 5, attachments: 2 },
    assignee: [{ initials: "MK", color: "bg-red-500" }],
    createdOn: "2025-10-20T14:00:00Z"
  },
  {
    id: 4,
    title: "Design System Audit",
    desc: "Check consistency of button styles across all pages.",
    client: "Internal",
    priority: "Low",
    priorityColor: "bg-blue-100 text-blue-600",
    stage: "Done",
    dueDate: "2025-12-10",
    activity: { comments: 1, attachments: 0 },
    assignee: [{ initials: "BP", color: "bg-indigo-500" }],
    createdOn: "2025-10-22T16:45:00Z"
  }
];

// Ensure structure
const enrichTaskData = (task) => ({
    ...task,
    client: task.client || "General",
    assignee: task.assignee || [{ initials: "U", color: "bg-gray-400" }],
    stage: task.stage || "To Do",
    priority: task.priority || "Medium",
    priorityColor: task.priorityColor || "bg-yellow-100 text-yellow-600",
    activity: { 
        comments: task.activity?.comments || 0, 
        attachments: task.activity?.attachments || 0,
        commentsList: task.activity?.commentsList || [], 
        attachmentsList: task.activity?.attachmentsList || [] 
    },
    desc: task.desc || ""
});

export const getTasks = () => {
  const tasksStr = localStorage.getItem(STORAGE_KEY);
  let tasks = [];
  
  if (tasksStr) {
    try {
      tasks = JSON.parse(tasksStr);
    } catch (e) {
      tasks = [];
    }
  }

  // If no tasks found (either key missing or empty array), use mock data
  if (!tasks || tasks.length === 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TASKS));
    return MOCK_TASKS.map(enrichTaskData);
  }
  
  return tasks.map(enrichTaskData);
};

export const saveTask = (task) => {
  const tasks = getTasks();
  const newTask = enrichTaskData({
    id: Date.now(),
    createdOn: new Date().toISOString(),
    ...task
  });
  
  if (!newTask.stage) newTask.stage = "To Do";
  
  tasks.unshift(newTask);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  window.dispatchEvent(new Event("storage")); 
  return newTask;
};

export const updateTask = (updatedTask) => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === updatedTask.id);
  if (index !== -1) {
    tasks[index] = enrichTaskData(updatedTask);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new Event("storage"));
  }
};

export const deleteTask = (id) => {
  const tasks = getTasks().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  window.dispatchEvent(new Event("storage"));
};
