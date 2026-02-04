import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dealsApi } from "../services/dealsApi";
import { leadsApi } from "../services/leadsApi";
import { tasksApi } from "../services/tasksApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
} from "lucide-react";
import Tooltip from "../components/common/Tooltip";

const Dashboard = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
<<<<<<< HEAD
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch deals
      const dealsResponse = await dealsApi.getDeals();
      setDeals(dealsResponse.data || []);

      // Fetch leads
      const leadsResponse = await leadsApi.getLeads();
      setLeads(leadsResponse.data || []);

      // Fetch tasks
      const tasksResponse = await tasksApi.getTasks();
      setTasks(tasksResponse.data || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.detail || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Stats
=======
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate slight loading for realistic feel
    setTimeout(() => {
      setLeads(getLeads());
      setDeals(getDeals());
      setLoading(false);
    }, 500);
  }, []);

  // --- KPI CALCS ---
>>>>>>> origin/master
  const totalLeads = leads.length;
  const wonDeals = deals.filter((d) => d.status === "Won");
  const lostDeals = deals.filter((d) => d.status === "Lost");
  const totalClosed = wonDeals.length + lostDeals.length;
  const conversionRate =
    totalClosed > 0 ? Math.round((wonDeals.length / totalClosed) * 100) : 0;

<<<<<<< HEAD
  // Calculate Satisfaction Rate based on Won Deals / Total Closed (Won + Lost)
  const wonDeals = deals.filter((d) => d.status === "won").length;
  const lostDeals = deals.filter((d) => d.status === "lost").length;
  const totalClosed = wonDeals + lostDeals;
  const satisfactionRate =
    totalClosed > 0 ? Math.round((wonDeals / totalClosed) * 100) : 0;
=======
  const revenueForecast = deals
    .filter((d) => d.status !== "Lost" && d.status !== "Won")
    .reduce((sum, d) => sum + Number(d.revenue || d.amount || 0), 0);

  const totalRevenue = wonDeals.reduce(
    (sum, d) => sum + Number(d.revenue || d.amount || 0),
    0,
  );

  // --- CHART DATA PREP ---

  // Funnel Data: Lead -> Qualified -> Proposal -> Won
  // Simplified logic using Status or Stage mappings
  const funnelData = [
    {
      value: leads.length,
      name: "Total Leads",
      fill: "#6366f1",
    },
    {
      value: deals.length,
      name: "Opportunities",
      fill: "#8b5cf6",
    },
    {
      value: deals.filter((d) => ["Proposal", "Negotiation"].includes(d.status))
        .length,
      name: "In Progress",
      fill: "#a855f7",
    },
    {
      value: wonDeals.length,
      name: "Won Deals",
      fill: "#d946ef",
    },
  ];
>>>>>>> origin/master

  // Revenue Trend (Mock Monthly for now as we don't have historical snapshots)
  // We'll distribute current won deals across months based on dueDate random mock or creates
  const revenueData = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 2000 },
    { name: "Apr", revenue: 2780 },
    { name: "May", revenue: 1890 },
    { name: "Jun", revenue: 2390 },
    { name: "Jul", revenue: 3490 },
  ];

  // Sales Performance (By Assignee - Mock Initials)
  const salesPerformanceData = [
    { name: "JD", sales: 40000 },
    { name: "AS", sales: 30000 },
    { name: "MK", sales: 20000 },
    { name: "BP", sales: 27800 },
    { name: "RW", sales: 18900 },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
<<<<<<< HEAD
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          Loading dashboard data...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          label="Total Leads Collected"
=======
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Leads"
>>>>>>> origin/master
          value={totalLeads}
          icon={<Users className="text-blue-600" size={20} />}
          trend="+12%"
          trendUp={true}
          color="bg-blue-50"
        />
        <KPICard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={<TrendingUp className="text-green-600" size={20} />}
          trend={conversionRate > 20 ? "Good" : "Needs Work"}
          trendUp={conversionRate > 20}
          color="bg-green-50"
        />
        <KPICard
          title="Revenue Forecast"
          value={`₹${revenueForecast.toLocaleString()}`}
          icon={<DollarSign className="text-purple-600" size={20} />}
          subText="Open Deals"
          color="bg-purple-50"
        />
        <KPICard
          title="Won vs Lost (30d)"
          value={`${wonDeals.length} / ${lostDeals.length}`}
          icon={<TrendingDown className="text-orange-600" size={20} />}
          subText="Ratio"
          color="bg-orange-50"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Revenue Trend</h3>
            <select className="text-xs border-gray-200 rounded-lg text-gray-500">
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Funnel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Sales Funnel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <RechartsTooltip />
                <Funnel
                  data={funnelData}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive
                >
                  <LabelList
                    position="right"
                    fill="#000"
                    stroke="none"
                    dataKey="name"
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Salesperson Performance
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesPerformanceData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={40}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip cursor={{ fill: "transparent" }} />
                <Bar
                  dataKey="sales"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Deals List (Mini) - Reusing simplified logic */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Deals</h3>
            <button
              onClick={() => navigate("/deals")}
              className="text-blue-600 text-xs font-medium hover:underline"
            >
              View All
            </button>
          </div>
<<<<<<< HEAD
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-normal">Deal Name</th>
                  <th className="pb-3 font-normal">Client</th>
                  <th className="pb-3 font-normal">Due date</th>
                  <th className="pb-3 font-normal">Value</th>
                  <th className="pb-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {deals.slice(0, 3).map((deal) => (
                  <DealRow
                    key={deal.id}
                    avatar={
                      deal.file ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${deal.client}`
                    }
                    name={deal.title}
                    email={deal.client}
                    client={deal.client}
                    date={deal.due_date || "N/A"}
                    revenue={`₹${Number(deal.amount || 0).toLocaleString()}`}
                    status={deal.status?.charAt(0).toUpperCase() + deal.status?.slice(1) || "Active"}
                    statusColor={
                      deal.status === "won"
                        ? "bg-green-100 text-green-800"
                        : deal.status === "lost"
                        ? "bg-red-100 text-red-800"
                        : deal.status === "active"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  />
                ))}
                {deals.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-400">
                      No active deals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Recent Activity
          </h3>
          <div className="space-y-6">
            {/* Static for now as global activity log isn't implemented fully yet */}
            <ActivityItem
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Chris"
              name="Chris Daniel"
              action="Worksheet updated"
              bgColor="bg-yellow-400"
            />
            <ActivityItem
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Nisha"
              name="Nisha"
              action="Followed up with John"
              bgColor="bg-teal-600"
            />
            <ActivityItem
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Madesh"
              name="Madesh"
              action="Evaluation designated"
              bgColor="bg-blue-500"
            />
          </div>
        </div>

        {/* Marketing Performance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Marketing Performance
            </h3>
            <button className="text-sm text-gray-500 flex items-center gap-1 border border-gray-200 rounded px-2 py-0.5">
              Month <ChevronDown size={14} />
            </button>
          </div>
          <div className="flex-1 relative mt-4 h-40 w-full">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-2 bg-white shadow-md p-2 rounded-lg z-10 border border-gray-50">
              <div className="text-[10px] text-gray-400">Average Hours</div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold">220hrs</span>
                <span className="text-[10px] text-green-500 font-medium">
                  +3.4%
                </span>
              </div>
            </div>
            <svg
              viewBox="0 0 100 40"
              className="w-full h-full text-indigo-500 opacity-80"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 35 C 10 35, 10 20, 20 20 C 30 20, 30 30, 40 30 C 50 30, 50 15, 60 25 C 70 35, 70 5, 80 15 C 90 25, 90 20, 100 20 V 40 H 0 Z"
                fill="url(#gradient)"
              />
              <path
                d="M0 35 C 10 35, 10 20, 20 20 C 30 20, 30 30, 40 30 C 50 30, 50 15, 60 25 C 70 35, 70 5, 80 15 C 90 25, 90 20, 100 20"
                stroke="#818cf8"
                strokeWidth="0.8"
                fill="none"
              />
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-500 font-medium mt-2">
            <span>Total Hrs</span>
            <span>Active Hrs</span>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            AI Suggestions
          </h3>
=======
>>>>>>> origin/master
          <div className="space-y-4">
            {deals.slice(0, 4).map((deal) => (
              <div
                key={deal.id}
                className="flex items-center justify-between border-b border-gray-50 last:border-0 pb-2 last:pb-0"
              >
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {deal.title}
                  </div>
                  <div className="text-xs text-gray-500">{deal.client}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    ₹{Number(deal.revenue || deal.amount || 0).toLocaleString()}
                  </div>
                  <div
                    className={`text-[10px] px-1.5 py-0.5 rounded ${deal.statusColor}`}
                  >
                    {deal.status}
                  </div>
                </div>
              </div>
            ))}
            {deals.length === 0 && (
              <div className="text-gray-400 text-sm text-center py-4">
                No recent deals
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, trend, trendUp, subText, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      {trend && (
        <div
          className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {trend}
        </div>
      )}
    </div>
    <div>
      <div className="text-gray-500 text-sm font-medium mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subText && <div className="text-xs text-gray-400 mt-1">{subText}</div>}
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-64 bg-gray-200 rounded-2xl"></div>
      <div className="h-64 bg-gray-200 rounded-2xl"></div>
    </div>
  </div>
);

export default Dashboard;
