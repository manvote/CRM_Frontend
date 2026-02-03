import authApi from "./authApi";

/**
 * Leads API Service
 * All API calls for Leads management
 */

export const leadsApi = {
  /**
   * Get all leads
   * @param {Object} params - Query parameters (stage, status, search)
   * @returns {Promise}
   */
  getLeads: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.stage) queryParams.append("stage", params.stage);
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);
    
    const queryString = queryParams.toString();
    return authApi.get(`/leads/${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Get single lead by ID
   * @param {number} id - Lead ID
   * @returns {Promise}
   */
  getLead: (id) => {
    return authApi.get(`/leads/${id}/`);
  },

  /**
   * Create new lead
   * @param {Object} leadData - Lead data
   * @returns {Promise}
   */
  createLead: (leadData) => {
    const formData = new FormData();
    
    formData.append("name", leadData.name);
    formData.append("email", leadData.email || "");
    formData.append("phone", leadData.phone || "");
    formData.append("company", leadData.company || "");
    formData.append("position", leadData.position || "");
    formData.append("stage", leadData.stage || "New");
    formData.append("status", leadData.status || "Active");
    formData.append("source", leadData.source || "Direct");
    formData.append("value", leadData.value || "0");
    
    if (leadData.notes) {
      formData.append("notes", leadData.notes);
    }
    
    if (leadData.image) {
      formData.append("image", leadData.image);
    }
    
    return authApi.post("/leads/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Update existing lead
   * @param {number} id - Lead ID
   * @param {Object} leadData - Updated lead data
   * @returns {Promise}
   */
  updateLead: (id, leadData) => {
    const formData = new FormData();
    
    if (leadData.name) formData.append("name", leadData.name);
    if (leadData.email !== undefined) formData.append("email", leadData.email);
    if (leadData.phone !== undefined) formData.append("phone", leadData.phone);
    if (leadData.company !== undefined) formData.append("company", leadData.company);
    if (leadData.position !== undefined) formData.append("position", leadData.position);
    if (leadData.stage) formData.append("stage", leadData.stage);
    if (leadData.status) formData.append("status", leadData.status);
    if (leadData.source !== undefined) formData.append("source", leadData.source);
    if (leadData.value !== undefined) formData.append("value", leadData.value);
    if (leadData.notes !== undefined) formData.append("notes", leadData.notes);
    
    if (leadData.image) {
      formData.append("image", leadData.image);
    }
    
    return authApi.patch(`/leads/${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Delete lead
   * @param {number} id - Lead ID
   * @returns {Promise}
   */
  deleteLead: (id) => {
    return authApi.delete(`/leads/${id}/`);
  },

  /**
   * Add note to lead
   * @param {number} leadId - Lead ID
   * @param {string} text - Note text
   * @returns {Promise}
   */
  addNote: (leadId, text) => {
    return authApi.post(`/leads/${leadId}/notes/`, { text });
  },

  /**
   * Add activity to lead
   * @param {number} leadId - Lead ID
   * @param {Object} activityData - Activity data (type, description, date)
   * @returns {Promise}
   */
  addActivity: (leadId, activityData) => {
    return authApi.post(`/leads/${leadId}/activities/`, activityData);
  },

  /**
   * Convert lead to deal
   * @param {number} leadId - Lead ID
   * @returns {Promise}
   */
  convertToDeal: (leadId) => {
    return authApi.post(`/leads/${leadId}/convert/`);
  },
};

export default leadsApi;
