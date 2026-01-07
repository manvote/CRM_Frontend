import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLeads } from "../utils/leadsStorage";
import { getDeals } from "../utils/dealsStorage";
import {
  ArrowLeft,
  ArrowUpRight,
  MoreHorizontal,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const loadData = () => {
      setLeads(getLeads());
      setDeals(getDeals());
    };

    loadData();
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
    };
  }, []);

  // Stats
  const totalLeads = leads.length;
  const activeDeals = deals.length; // Simply count all active deals for now, or filter by specific statuses if needed
  const inProgress = deals.filter((d) =>
    ["Proposal", "Negotiation"].includes(d.status)
  ).length;
  const newCustomers = leads.filter(
    (l) => l.status === "New" || l.status === "New Lead"
  ).length;

  // Calculate Satisfaction Rate based on Won Deals / Total Closed (Won + Lost)
  const wonDeals = deals.filter((d) => d.status === "Won").length;
  const lostDeals = deals.filter((d) => d.status === "Lost").length;
  const totalClosed = wonDeals + lostDeals;
  const satisfactionRate =
    totalClosed > 0 ? Math.round((wonDeals / totalClosed) * 100) : 0; // Default to 0 if no closed deals, or keep 100? 0 seems safer.

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Schedule product demo call",
      tag: "ABC Constructions",
      tagColor: "bg-blue-50 text-blue-700",
      completed: false,
    },
    {
      id: 2,
      title: "Send proposal document",
      tag: "Interiors",
      tagColor: "bg-purple-50 text-purple-700",
      completed: false,
    },
    {
      id: 3,
      title: "Review deal notes & attachments",
      tag: "Enterprises",
      tagColor: "bg-indigo-50 text-indigo-700",
      completed: false,
    },
  ]);

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const addTask = () => {
    const title = window.prompt("Enter task details:");
    if (title) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          title,
          tag: "New Task",
          tagColor: "bg-gray-100 text-gray-700",
          completed: false,
        },
      ]);
    }
  };

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
          onClick={() =>
            navigate("/deals", { state: { filterStatus: "Progress" } })
          }
        />
        <StatCard
          label="New Customers This Month"
          value={newCustomers}
          onClick={() => navigate("/leads", { state: { filterStatus: "New" } })}
        />
        <StatCard
          label="Customer Satisfaction Rate"
          value={`${satisfactionRate}%`}
          subValue={
            totalClosed > 0 ? `${wonDeals}/${totalClosed} Won` : "No data"
          }
          subValueColor={
            satisfactionRate >= 50 ? "text-green-500" : "text-red-500"
          }
          onClick={() => navigate("/deals", { state: { filterStatus: "Won" } })}
        />
      </div>

      {/* Middle Row: Tasks & Active Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              Today's Tasks{" "}
              <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                {tasks.filter((t) => !t.completed).length}
              </span>
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              See all
            </button>
          </div>
          <div className="space-y-6 flex-1">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
              />
            ))}
          </div>
          <button
            onClick={addTask}
            className="mt-8 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            + Add new
          </button>
        </div>

        {/* Active Deals - Using Leads Data Now contextually */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Active Deals</h3>
            <button
              onClick={() => navigate("/deals")}
              className="flex items-center gap-1 text-sm bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-md text-gray-600"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
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
                      deal.image ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${deal.client}`
                    }
                    name={deal.title}
                    email={deal.client}
                    client={deal.client}
                    date={deal.dueDate}
                    revenue={`₹${Number(
                      deal.revenue || deal.amount || 0
                    ).toLocaleString()}`}
                    status={deal.status}
                    statusColor={deal.statusColor}
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
          <div className="space-y-4">
            <SuggestionItem
              iconColor="bg-yellow-400"
              text="3 details likely too close"
              seed="Felix"
            />
            <SuggestionItem
              iconColor="bg-teal-600"
              text="2 leads at risk"
              seed="Aneka"
            />
            <SuggestionItem
              iconColor="bg-blue-500"
              text="Suggested: Follow-up Sarah"
              subText="(35% probability)"
              seed="Jude"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, subValue, subValueColor, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between ${
      onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
    }`}
  >
    <div className="text-gray-500 text-xs mb-2 font-medium">{label}</div>
    <div className="flex items-end gap-2">
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {subValue && (
        <div className={`text-xs font-bold mb-1 ${subValueColor}`}>
          {subValue}
        </div>
      )}
    </div>
  </div>
);

const TaskItem = ({ task, onToggle }) => (
  <div
    className="flex items-start gap-3 cursor-pointer group"
    onClick={onToggle}
  >
    <div className="mt-1">
      <div
        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
          task.completed
            ? "bg-blue-600 border-blue-600"
            : "border-gray-300 group-hover:border-blue-500"
        }`}
      >
        {task.completed && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </div>
    <div
      className={`flex-1 transition-opacity ${
        task.completed ? "opacity-50" : ""
      }`}
    >
      <div
        className={`text-sm font-medium text-gray-800 mb-1 ${
          task.completed ? "line-through text-gray-500" : ""
        }`}
      >
        {task.title}
      </div>
      <span className={`text-xs px-2 py-0.5 rounded ${task.tagColor}`}>
        {task.tag}
      </span>
    </div>
  </div>
);

const DealRow = ({
  avatar,
  name,
  email,
  client,
  date,
  revenue,
  status,
  statusColor,
}) => (
  <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
    <td className="py-4">
      <div className="flex items-center gap-3">
        <img src={avatar} alt={name} className="w-8 h-8 rounded-full" />
        <div>
          <div className="text-sm font-medium text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{client}</div>
        </div>
      </div>
    </td>
    <td className="py-4 text-sm text-gray-700 max-w-[150px] truncate">
      {email}{" "}
      {/* Using email prop for client name/subtitle if needed, but 'client' prop is cleaner */}
    </td>
    <td className="py-4 text-sm text-gray-700">{date}</td>
    <td className="py-4 text-sm text-gray-700 font-medium">{revenue}</td>
    <td className="py-4">
      <span
        className={`text-xs px-2.5 py-1 rounded-md font-medium ${statusColor}`}
      >
        {status}
      </span>
    </td>
  </tr>
);

const ActivityItem = ({ avatar, name, action, bgColor }) => (
  <div className="flex items-start gap-3">
    <div
      className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center shrink-0`}
    >
      <img src={avatar} alt={name} className="w-8 h-8 rounded-lg" />
    </div>
    <div>
      <div className="text-sm font-bold text-gray-900">{name}</div>
      <div className="text-sm text-gray-500 leading-tight">{action}</div>
    </div>
  </div>
);

const SuggestionItem = ({ iconColor, text, subText, seed }) => (
  <div className="flex items-start gap-3">
    <div className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 ${iconColor}`}>
      <img
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
        alt="AI"
      />
    </div>
    <div>
      <div className="text-sm font-medium text-gray-800 leading-snug">
        {text}
      </div>
      {subText && <div className="text-xs text-gray-500">{subText}</div>}
    </div>
  </div>
);

export default Dashboard;
