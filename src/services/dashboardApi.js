import authApi from "./authApi";

/**
 * Dashboard API Service
 * All API calls for Dashboard data, activities, and suggestions
 */

export const dashboardApi = {
  /**
   * Get complete dashboard summary
   * @returns {Promise}
   */
  getSummary: () => {
    return authApi.get("/dashboard/dashboard/summary/");
  },

  /**
   * Get dashboard metrics
   * @returns {Promise}
   */
  getMetrics: () => {
    return authApi.get("/dashboard/dashboard/metrics/");
  },

  /**
   * Refresh dashboard metrics
   * @returns {Promise}
   */
  refreshMetrics: () => {
    return authApi.post("/dashboard/dashboard/refresh_metrics/");
  },

  // ==================== ACTIVITIES ====================

  /**
   * Get recent activities
   * @param {Object} params - Query parameters (limit, type, days)
   * @returns {Promise}
   */
  getActivities: (params = {}) => {
    return authApi.get("/dashboard/activities/", { params });
  },

  /**
   * Get recent activities with default limit
   * @param {number} limit - Maximum number of activities
   * @returns {Promise}
   */
  getRecentActivities: (limit = 15) => {
    return authApi.get("/dashboard/activities/recent/", { params: { limit } });
  },

  /**
   * Get activity summary
   * @returns {Promise}
   */
  getActivitySummary: () => {
    return authApi.get("/dashboard/activities/summary/");
  },

  /**
   * Log a new activity
   * @param {Object} activityData - Activity data
   * @returns {Promise}
   */
  logActivity: (activityData) => {
    return authApi.post("/dashboard/activities/log_activity/", activityData);
  },

  /**
   * Filter activities by type
   * @param {string} type - Activity type
   * @param {number} days - Last N days
   * @returns {Promise}
   */
  filterActivities: (type, days = 7) => {
    return authApi.get("/dashboard/activities/", {
      params: { type, days },
    });
  },

  // ==================== AI SUGGESTIONS ====================

  /**
   * Get all AI suggestions
   * @param {Object} params - Query parameters (priority, type, active_only)
   * @returns {Promise}
   */
  getSuggestions: (params = {}) => {
    return authApi.get("/dashboard/suggestions/", { params });
  },

  /**
   * Get active suggestions only
   * @returns {Promise}
   */
  getActiveSuggestions: () => {
    return authApi.get("/dashboard/suggestions/active/");
  },

  /**
   * Get specific suggestion
   * @param {number} id - Suggestion ID
   * @returns {Promise}
   */
  getSuggestion: (id) => {
    return authApi.get(`/dashboard/suggestions/${id}/`);
  },

  /**
   * Create new AI suggestion
   * @param {Object} suggestionData - Suggestion data
   * @returns {Promise}
   */
  createSuggestion: (suggestionData) => {
    return authApi.post("/dashboard/suggestions/create_suggestion/", suggestionData);
  },

  /**
   * Mark suggestion as actioned
   * @param {number} id - Suggestion ID
   * @param {Object} actionData - Action data (action_notes)
   * @returns {Promise}
   */
  markSuggestionActioned: (id, actionData = {}) => {
    return authApi.post(`/dashboard/suggestions/${id}/mark_actioned/`, actionData);
  },

  /**
   * Filter suggestions by priority and type
   * @param {string} priority - Priority level (low, medium, high, critical)
   * @param {string} type - Suggestion type
   * @returns {Promise}
   */
  filterSuggestions: (priority = null, type = null) => {
    const params = {};
    if (priority) params.priority = priority;
    if (type) params.type = type;
    return authApi.get("/dashboard/suggestions/", { params });
  },

  // ==================== MARKETING PERFORMANCE ====================

  /**
   * Get marketing performance metrics
   * @param {Object} params - Query parameters (start_date, end_date)
   * @returns {Promise}
   */
  getPerformanceMetrics: (params = {}) => {
    return authApi.get("/dashboard/performance/", { params });
  },

  /**
   * Get current month performance
   * @returns {Promise}
   */
  getCurrentMonthPerformance: () => {
    return authApi.get("/dashboard/performance/current_month/");
  },

  /**
   * Get performance trend
   * @param {number} days - Number of days to look back
   * @returns {Promise}
   */
  getPerformanceTrend: (days = 30) => {
    return authApi.get("/dashboard/performance/trend/", { params: { days } });
  },

  /**
   * Record today's performance metrics
   * @param {Object} performanceData - Performance data
   * @returns {Promise}
   */
  recordPerformance: (performanceData) => {
    return authApi.post("/dashboard/performance/record_performance/", performanceData);
  },
};

export default dashboardApi;
