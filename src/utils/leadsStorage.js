import { leadsData } from '../data/mockData';

const STORAGE_KEY = 'crm_leads_data';

export const getLeads = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        // Initialize with mock data if storage is empty
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leadsData));
        return leadsData;
    }
    return JSON.parse(stored);
};

export const saveLead = (lead) => {
    const currentLeads = getLeads();
    const newLead = {
        ...lead,
        id: Date.now(), // Generate a simple unique ID
        // Add default values for fields not in the simple add form
        createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' - ' + new Date().toLocaleDateString('en-US', { weekday: 'short' }),
        website: lead.website || 'https://loom.com', // Default or from form if added
        platform: lead.platform || 'Linkedin',
        value: lead.value || '50,00,000',
        lastContacted: 'Just now'
    };
    
    const updatedLeads = [newLead, ...currentLeads];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    return newLead;
};

export const deleteLeads = (ids) => {
    const currentLeads = getLeads();
    const updatedLeads = currentLeads.filter(lead => !ids.includes(lead.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    return updatedLeads;
};
