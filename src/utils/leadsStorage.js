const STORAGE_KEY = 'crm_leads_data';

const enrichLeadData = (lead) => ({
    ...lead,
    activities: lead.activities || [],
    deals: lead.deals || [],
    documents: lead.documents || [],
    street: lead.street || '',
    city: lead.city || '',
    state: lead.state || '',
    zipCode: lead.zipCode || '',
    country: lead.country || ''
});

export const getLeads = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map(enrichLeadData);
};

export const saveLead = (lead) => {
    const currentLeads = getLeads();
    const newLead = enrichLeadData({
        ...lead,
        id: Date.now(),
        createdOn: lead.createdOn || new Date().toLocaleDateString('en-GB')
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
