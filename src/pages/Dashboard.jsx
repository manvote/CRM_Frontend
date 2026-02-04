import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dealsApi } from "../services/dealsApi";
import { leadsApi } from "../services/leadsApi";
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
  const [loading, setLoading] = useState(true);
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

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.detail || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };
  // --- KPI CALCS ---
  const totalLeads = leads.length;
  const wonDeals = deals.filter((d) => d.status === "Won");
  const lostDeals = deals.filter((d) => d.status === "Lost");
  const totalClosed = wonDeals.length + lostDeals.length;
  const conversionRate =
    totalClosed > 0 ? Math.round((wonDeals.length / totalClosed) * 100) : 0;
  const revenueForecast = deals
    .filter((d) => d.status !== "Lost" && d.status !== "Won")
    .reduce((sum, d) => sum + Number(d.revenue || d.amount || 0), 0);

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Leads"
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
