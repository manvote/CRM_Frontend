const STORAGE_KEY = 'manovate_deals_v4';

const MOCK_DEALS = [
  {
    id: 1,
    title: "Website Redesign",
    desc: "Complete overhaul of company website",
    client: "Acme Corp",
    amount: 12000,
    stage: "Clients",
    status: "Open",
    statusColor: "bg-blue-100 text-blue-600",
    dueDate: "2025-11-20",
    activity: { comments: 0, attachments: 0 },
    assignee: [{ initials: "JD", color: "bg-blue-500" }],
    createdOn: "2025-10-12T10:00:00Z"
  },
  {
    id: 2,
    title: "SEO Campaign",
    desc: "Q1 SEO optimization and content strategy",
    client: "Globex Inc",
    amount: 5000,
    stage: "Orders",
    status: "Open",
    statusColor: "bg-blue-100 text-blue-600",
    dueDate: "2025-11-25",
    activity: { comments: 0, attachments: 0 },
    assignee: [{ initials: "AS", color: "bg-green-500" }],
    createdOn: "2025-10-15T11:30:00Z"
  },
  {
    id: 3,
    title: "Enterprise License",
    desc: "500-seat license for core product",
    client: "Soylent Corp",
    amount: 75000,
    stage: "Tasks",
    status: "Open",
    statusColor: "bg-blue-100 text-blue-600",
    dueDate: "2025-12-01",
    activity: { comments: 0, attachments: 0 },
    assignee: [{ initials: "MK", color: "bg-red-500" }],
    createdOn: "2025-10-20T14:00:00Z"
  },
  {
    id: 4,
    title: "Mobile App Dev",
    desc: "iOS and Android app development",
    client: "Initech",
    amount: 45000,
    stage: "Due Date",
    status: "Open",
    statusColor: "bg-blue-100 text-blue-600",
    dueDate: "2025-12-10",
    activity: { comments: 0, attachments: 0 },
    assignee: [{ initials: "BP", color: "bg-indigo-500" }],
    createdOn: "2025-10-22T16:45:00Z"
  },
  {
    id: 5,
    title: "Cloud Migration",
    desc: "Migrate legacy systems to AWS",
    client: "Umbrella Corp",
    amount: 120000,
    stage: "Revenue",
    status: "Open",
    statusColor: "bg-blue-100 text-blue-600",
    dueDate: "2025-10-30",
    activity: { comments: 0, attachments: 0 },
    assignee: [{ initials: "RW", color: "bg-teal-500" }],
    createdOn: "2025-09-10T09:00:00Z"
  },
  {
    id: 6,
    title: "Q4 Marketing",
    desc: "End of year push",
    client: "Cyberdyne",
    amount: 25000,
    stage: "Status",
    status: "Won", // Explicitly Closed Won
    statusColor: "bg-emerald-100 text-emerald-600",
    dueDate: "2025-09-01",
    activity: { comments: 0, attachments: 0 },
    assignee: [{ initials: "T8", color: "bg-gray-800" }],
    createdOn: "2025-08-15T10:00:00Z"
  }
];

// Ensure structure
const enrichDealData = (deal) => ({
    ...deal,
    client: deal.client || "Target Client",
    assignee: deal.assignee || [{ initials: "U", color: "bg-gray-400" }],
    stage: deal.stage || deal.column || "Clients", // Fallback to 'Clients' (start of pipeline)
    status: deal.status || "Open", // Default to Open
    statusColor: deal.statusColor || "bg-blue-100 text-blue-600",
    activity: { 
        comments: deal.activity?.comments || 0, 
        attachments: deal.activity?.attachments || 0,
        commentsList: deal.activity?.commentsList || [], 
        attachmentsList: deal.activity?.attachmentsList || [] 
    },
    revenue: deal.amount || deal.revenue || 0,
    desc: deal.desc || ""
});

export const getDeals = () => {
  const dealsStr = localStorage.getItem(STORAGE_KEY);
  let deals = [];
  
  if (dealsStr) {
    try {
      deals = JSON.parse(dealsStr);
    } catch (e) {
      deals = [];
    }
  }

  // If no deals found (either key missing or empty array), use mock data
  if (!deals || deals.length === 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DEALS));
    return MOCK_DEALS.map(enrichDealData);
  }
  
  return deals.map(enrichDealData);
};

export const saveDeal = (deal) => {
  const deals = getDeals();
  const newDeal = enrichDealData({
    id: Date.now(),
    createdOn: new Date().toISOString(),
    ...deal
  });
  
  // Default new deals to 'Clients' stage and 'Open' status unless specified
  if (!newDeal.stage) newDeal.stage = "Clients";
  if (!newDeal.status) newDeal.status = "Open";
  
  if (!newDeal.statusColor) {
      if (newDeal.status === 'Won') newDeal.statusColor = "bg-emerald-100 text-emerald-600";
      else if (newDeal.status === 'Lost') newDeal.statusColor = "bg-red-100 text-red-600";
      else newDeal.statusColor = "bg-blue-100 text-blue-600";
  }

  deals.unshift(newDeal);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  window.dispatchEvent(new Event("storage")); 
  return newDeal;
};

export const updateDeal = (updatedDeal) => {
  const deals = getDeals();
  const index = deals.findIndex(d => d.id === updatedDeal.id);
  if (index !== -1) {
    deals[index] = enrichDealData(updatedDeal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
    window.dispatchEvent(new Event("storage"));
  }
};

export const deleteDeal = (id) => {
  const deals = getDeals().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  window.dispatchEvent(new Event("storage"));
};
