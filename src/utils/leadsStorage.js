import { leadsData } from '../data/mockData';

const STORAGE_KEY = 'crm_leads_data';

// Helper to ensure data structure
const enrichLeadData = (lead) => ({
    ...lead,
    activities: lead.activities || [
        {
            id: 'static-1',
            type: 'task',
            title: 'Task created Esther',
            desc: 'Prepare quote for john.',
            date: 'Today',
            time: '10:46AM',
            priority: 'High'
        },
        {
            id: 'static-2',
            type: 'email',
            title: 'Email Delivered: Proposal ent',
            desc: 'Proposal has been sent the message to the customer\'s email.',
            date: 'Today',
            time: '02:00PM'
        },
        {
            id: 'static-3',
            type: 'appointment',
            title: 'On-site estimate',
            with: 'Robbin',
            location: 'Guindy,chennai-600057',
            date: 'December 15,2025',
            time: '10AM - 11AM'
        }
    ],
    deals: lead.deals || [
        {
            id: 'static-deal-1',
            title: 'Web Development',
            value: '₹10,00,000',
            closingDate: '31 Dec 2025'
        }
    ],
    documents: lead.documents || [
        {
            id: 'static-doc-1',
            name: 'Document.pdf',
            size: '2mb'
        }
    ],
    // Default address if missing
    street: lead.street || 'No. 45, OMR Road',
    city: lead.city || 'Chennai',
    state: lead.state || 'Tamil Nadu',
    zipCode: lead.zipCode || '600096',
    country: lead.country || 'India'
});

export const getLeads = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // If storage is empty, initialize with enriched mock data
    if (!stored) {
        const enriched = leadsData.map(enrichLeadData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
        return enriched;
    }
    
    // If stored data exists, make sure it has the structure we need (migrations)
    const parsed = JSON.parse(stored);
    return parsed.map(enrichLeadData);
};

export const saveLead = (lead) => {
    const currentLeads = getLeads();
    const newLead = enrichLeadData({
        ...lead,
        id: Date.now(),
        createdOn: new Date().toLocaleDateString('en-GB')
    });
    
    const updatedLeads = [newLead, ...currentLeads];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    return newLead;
};

export const updateLead = (updatedLead) => {
    const currentLeads = getLeads();
    const index = currentLeads.findIndex(l => l.id.toString() === updatedLead.id.toString());
    
    if (index !== -1) {
        currentLeads[index] = { ...currentLeads[index], ...updatedLead };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLeads));
        return currentLeads[index];
    }
    return null;
};

export const deleteLeads = (ids) => {
    const currentLeads = getLeads();
    const updatedLeads = currentLeads.filter(lead => !ids.includes(lead.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    return updatedLeads;
};
