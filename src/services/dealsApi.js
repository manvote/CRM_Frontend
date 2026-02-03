import authApi from "./authApi";

/**
 * Deals API Service
 * All API calls for Deals management
 */

export const dealsApi = {
  /**
   * Get all deals
   * @param {Object} params - Query parameters (stage, status, search)
   * @returns {Promise}
   */
  getDeals: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.stage) queryParams.append("stage", params.stage);
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    return authApi.get(`/deals/${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Get single deal by ID
   * @param {number} id - Deal ID
   * @returns {Promise}
   */
  getDeal: (id) => {
    return authApi.get(`/deals/${id}/`);
  },

  /**
   * Create new deal
   * @param {Object} dealData - Deal data
   * @returns {Promise}
   */
  createDeal: (dealData) => {
    const formData = new FormData();

    formData.append("title", dealData.title);
    formData.append("description", dealData.desc || dealData.description || "");
    formData.append("client", dealData.client || "");
    formData.append("stage", dealData.stage || dealData.status || "Clients");
    formData.append("status", dealData.status || "Open");
    formData.append("amount", dealData.amount || dealData.revenue || "0");

    if (dealData.dueDate || dealData.due_date) {
      formData.append("due_date", dealData.dueDate || dealData.due_date);
    }

    if (dealData.file) {
      formData.append("file", dealData.file);
    }

    if (dealData.assigneeInitials) {
      formData.append("assignee_initials", dealData.assigneeInitials);
    }

    // Don't set Content-Type manually - let axios set it with boundary
    return authApi.post("/deals/", formData);
  },

  /**
   * Update existing deal
   * @param {number} id - Deal ID
   * @param {Object} dealData - Updated deal data
   * @returns {Promise}
   */
  updateDeal: (id, dealData) => {
    const formData = new FormData();

    if (dealData.title) formData.append("title", dealData.title);
    if (dealData.desc !== undefined || dealData.description !== undefined) {
      formData.append("description", dealData.desc || dealData.description || "");
    }
    if (dealData.client !== undefined) formData.append("client", dealData.client);
    if (dealData.stage) formData.append("stage", dealData.stage);
    if (dealData.status) formData.append("status", dealData.status);
    if (dealData.amount !== undefined || dealData.revenue !== undefined) {
      formData.append("amount", dealData.amount || dealData.revenue || "0");
    }
    if (dealData.dueDate || dealData.due_date) {
      formData.append("due_date", dealData.dueDate || dealData.due_date);
    }

    if (dealData.file) {
      formData.append("file", dealData.file);
    }

    if (dealData.assigneeInitials) {
      formData.append("assignee_initials", dealData.assigneeInitials);
    }

    // Don't set Content-Type manually - let axios set it with boundary
    return authApi.patch(`/deals/${id}/`, formData);
  },

  /**
   * Delete deal
   * @param {number} id - Deal ID
   * @returns {Promise}
   */
  deleteDeal: (id) => {
    return authApi.delete(`/deals/${id}/`);
  },

  /**
   * Add comment to deal
   * @param {number} dealId - Deal ID
   * @param {string} text - Comment text
   * @returns {Promise}
   */
  addComment: (dealId, text) => {
    return authApi.post(`/deals/${dealId}/add_comment/`, { text });
  },

  /**
   * Add attachment to deal
   * @param {number} dealId - Deal ID
   * @param {File} file - Attachment file
   * @returns {Promise}
   */
  addAttachment: (dealId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    // Don't set Content-Type manually - let axios set it with boundary
    return authApi.post(`/deals/${dealId}/add_attachment/`, formData);
  },

  /**
   * Delete attachment from deal
   * @param {number} dealId - Deal ID
   * @param {number} attachmentId - Attachment ID
   * @returns {Promise}
   */
  deleteAttachment: (dealId, attachmentId) => {
    return authApi.delete(`/deals/${dealId}/attachments/${attachmentId}/`);
  },
};

export default dealsApi;
