import authApi from "./authApi";

/**
 * Tasks API Service
 * All API calls for Tasks management
 */

export const tasksApi = {
  /**
   * Get all tasks
   * @param {Object} params - Query parameters (stage, priority, search)
   * @returns {Promise}
   */
  getTasks: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.stage) queryParams.append("stage", params.stage);
    if (params.priority) queryParams.append("priority", params.priority);
    if (params.search) queryParams.append("search", params.search);
    
    const queryString = queryParams.toString();
    return authApi.get(`/tasks/${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Get single task by ID
   * @param {number} id - Task ID
   * @returns {Promise}
   */
  getTask: (id) => {
    return authApi.get(`/tasks/${id}/`);
  },

  /**
   * Create new task
   * @param {Object} taskData - Task data
   * @returns {Promise}
   */
  createTask: (taskData) => {
    const formData = new FormData();
    
    formData.append("title", taskData.title);
    formData.append("description", taskData.desc || taskData.description || "");
    formData.append("client", taskData.client || "Internal");
    formData.append("priority", taskData.priority || "Medium");
    formData.append("stage", taskData.stage || "To Do");
    
    if (taskData.dueDate || taskData.due_date) {
      formData.append("due_date", taskData.dueDate || taskData.due_date);
    }
    
    if (taskData.file) {
      formData.append("image", taskData.file);
    }
    
    if (taskData.assigneeInitials) {
      formData.append("assigneeInitials", taskData.assigneeInitials);
    }
    
    return authApi.post("/tasks/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Update existing task
   * @param {number} id - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise}
   */
  updateTask: (id, taskData) => {
    const formData = new FormData();
    
    if (taskData.title) formData.append("title", taskData.title);
    if (taskData.desc !== undefined || taskData.description !== undefined) {
      formData.append("description", taskData.desc || taskData.description || "");
    }
    if (taskData.client) formData.append("client", taskData.client);
    if (taskData.priority) formData.append("priority", taskData.priority);
    if (taskData.stage) formData.append("stage", taskData.stage);
    if (taskData.dueDate || taskData.due_date) {
      formData.append("due_date", taskData.dueDate || taskData.due_date);
    }
    
    if (taskData.file) {
      formData.append("image", taskData.file);
    }
    
    if (taskData.assigneeInitials) {
      formData.append("assigneeInitials", taskData.assigneeInitials);
    }
    
    return authApi.patch(`/tasks/${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Delete task
   * @param {number} id - Task ID
   * @returns {Promise}
   */
  deleteTask: (id) => {
    return authApi.delete(`/tasks/${id}/`);
  },

  /**
   * Add comment to task
   * @param {number} taskId - Task ID
   * @param {string} text - Comment text
   * @returns {Promise}
   */
  addComment: (taskId, text) => {
    return authApi.post(`/tasks/${taskId}/comments/`, { text });
  },

  /**
   * Add attachment to task
   * @param {number} taskId - Task ID
   * @param {File} file - File to upload
   * @returns {Promise}
   */
  addAttachment: (taskId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    return authApi.post(`/tasks/${taskId}/attachments/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Delete attachment from task
   * @param {number} taskId - Task ID
   * @param {number} attachmentId - Attachment ID
   * @returns {Promise}
   */
  deleteAttachment: (taskId, attachmentId) => {
    return authApi.delete(`/tasks/${taskId}/attachments/${attachmentId}/`);
  },
};

export default tasksApi;
