import { useState, useEffect } from "react";
import dashboardApi from "../services/dashboardApi";

/**
 * Hook to manage dashboard summary data
 */
export const useDashboardSummary = () => {
  const [summary, setSummary] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getSummary();
      setSummary(response.data);
      setMetrics(response.data.metrics);
      setActivities(response.data.recent_activities || []);
      setSuggestions(response.data.ai_suggestions || []);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch dashboard summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const refreshMetrics = async () => {
    try {
      const response = await dashboardApi.refreshMetrics();
      setMetrics(response.data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    summary,
    metrics,
    activities,
    suggestions,
    loading,
    error,
    fetchSummary,
    refreshMetrics,
  };
};

/**
 * Hook to manage dashboard activities
 */
export const useDashboardActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActivities = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getActivities(params);
      setActivities(response.data.results || response.data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch activities:", err);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activityData) => {
    try {
      const response = await dashboardApi.logActivity(activityData);
      setActivities([response.data, ...activities]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchActivities({ limit: 15 });
  }, []);

  return {
    activities,
    loading,
    error,
    fetchActivities,
    logActivity,
  };
};

/**
 * Hook to manage AI suggestions
 */
export const useAISuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestions = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getSuggestions(params);
      setSuggestions(response.data.results || response.data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSuggestions = async () => {
    try {
      const response = await dashboardApi.getActiveSuggestions();
      setSuggestions(response.data.results || response.data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const markActioned = async (id, actionData = {}) => {
    try {
      const response = await dashboardApi.markSuggestionActioned(id, actionData);
      setSuggestions(
        suggestions.map((s) => (s.id === id ? response.data : s))
      );
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchActiveSuggestions();
  }, []);

  return {
    suggestions,
    loading,
    error,
    fetchSuggestions,
    fetchActiveSuggestions,
    markActioned,
  };
};

/**
 * Hook to manage marketing performance
 */
export const useMarketingPerformance = () => {
  const [performance, setPerformance] = useState(null);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCurrentMonth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getCurrentMonthPerformance();
      setPerformance(response.data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch performance:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrend = async (days = 30) => {
    try {
      const response = await dashboardApi.getPerformanceTrend(days);
      setTrend(response.data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const recordPerformance = async (performanceData) => {
    try {
      const response = await dashboardApi.recordPerformance(performanceData);
      setPerformance(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchCurrentMonth();
  }, []);

  return {
    performance,
    trend,
    loading,
    error,
    fetchCurrentMonth,
    fetchTrend,
    recordPerformance,
  };
};
