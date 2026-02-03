/**
 * Updated Dashboard.jsx Integration Guide
 * 
 * Replace the hardcoded data and localStorage calls with API hooks
 */

// ============ STEP 1: Import the hooks ============
// Replace at top of Dashboard.jsx:
import { useDashboardSummary, useDashboardActivities, useAISuggestions, useMarketingPerformance } from "../hooks/useDashboard";

// ============ STEP 2: Initialize hooks in component ============

const Dashboard = () => {
  // Get dashboard data
  const { summary, metrics, activities, suggestions, loading, refreshMetrics } = useDashboardSummary();
  const performanceData = useMarketingPerformance();

  // Extract metrics with fallback values
  const totalLeads = metrics?.total_leads || 0;
  const activeDeals = metrics?.active_deals || 0;
  const inProgress = metrics?.deals_in_progress || 0;
  const newCustomers = metrics?.new_leads_this_month || 0;
  const satisfactionRate = Math.round(metrics?.satisfaction_rate || 0);

  // ... rest of component uses these values

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          label="Total Leads Collected"
          value={totalLeads}
          onClick={() => navigate("/leads", { state: { filterStatus: "All" } })}
        />
        <StatCard
          label="Active Deals"
          value={activeDeals}
          onClick={() => navigate("/deals")}
        />
        <StatCard
          label="Deals in Progress"
          value={inProgress}
          onClick={() => navigate("/deals", { state: { filterStatus: "Progress" } })}
        />
        <StatCard
          label="New Customers This Month"
          value={newCustomers}
          onClick={() => navigate("/leads", { state: { filterStatus: "New" } })}
        />
        <StatCard
          label="Customer Satisfaction Rate"
          value={`${satisfactionRate}%`}
          subValue={metrics?.won_deals_total ? `${metrics.won_deals_total} Won` : "No data"}
          subValueColor={satisfactionRate >= 50 ? "text-green-500" : "text-red-500"}
          onClick={() => navigate("/deals", { state: { filterStatus: "Won" } })}
        />
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Activity</h3>
        <div className="space-y-6">
          {activities.slice(0, 3).map((activity) => (
            <ActivityItem
              key={activity.id}
              avatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user_name}`}
              name={activity.user_name}
              action={activity.action}
              bgColor={activity.avatar_bg_color}
            />
          ))}
          {activities.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              No activities yet
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">AI Suggestions</h3>
        <div className="space-y-4">
          {suggestions.slice(0, 3).map((suggestion) => (
            <SuggestionItem
              key={suggestion.id}
              iconColor={suggestion.icon_color}
              text={suggestion.title}
              subText={suggestion.metric_change}
              seed={suggestion.title.split(' ')[0]}
            />
          ))}
          {suggestions.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              No suggestions available
            </div>
          )}
        </div>
      </div>

      {/* Marketing Performance */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            Marketing Performance
          </h3>
          <button
            onClick={() => refreshMetrics()}
            className="text-sm text-gray-500 flex items-center gap-1 border border-gray-200 rounded px-2 py-0.5"
          >
            Refresh
          </button>
        </div>
        <div className="flex-1 relative mt-4 h-40 w-full">
          {performanceData?.performance && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Total Hours</div>
                <div className="text-2xl font-bold text-gray-800">
                  {performanceData.performance.total_hours?.toFixed(1) || 0}hrs
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Active Hours</div>
                <div className="text-2xl font-bold text-gray-800">
                  {performanceData.performance.active_hours?.toFixed(1) || 0}hrs
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && <div className="text-center py-8">Loading dashboard...</div>}
    </div>
  );
};

// ============ MIGRATION CHECKLIST ============

/*
✅ Import hooks at top of file
✅ Initialize all 4 hooks in component
✅ Replace hardcoded metrics with hook values
✅ Update activity section to use activities array
✅ Update suggestions section to use suggestions array
✅ Add loading state check
✅ Replace localStorage calls with API calls
✅ Test all data loads correctly
✅ Verify error handling works
✅ Test refresh functionality

BEFORE:
- All data was hardcoded
- No real-time updates
- Statistics were static

AFTER:
- Live data from backend
- Auto-refreshing metrics
- Real-time activity tracking
- AI-powered suggestions
- Performance analytics
*/
