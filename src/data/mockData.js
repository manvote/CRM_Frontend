export const leadsData = Array(12).fill({
    name: "tamizh",
    company: "Techno",
    jobTitle: "Sales Rep",
    email: "tamizh@gmail.com",
    createdOn: "15/12/2025 - Mon",
    status: "Opened"
}).map((item, idx) => {
    const names = ['tamizh', 'suresh', 'magesh', 'kumar', 'jegan'];
    const companies = ['Techno', 'SoftSys', 'DataCorp', 'NetWorks', 'CloudNine'];
    const nameBase = names[idx % 5];

    return {
        ...item,
        id: idx + 1,
        name: `${nameBase} ${idx + 1}`,
        company: companies[idx % 5],
        email: `${nameBase.toLowerCase()}.${idx + 1}@gmail.com`,
        status: ['Opened', 'New', 'Interested', 'Rejected'][idx % 4],
        // New fields for Pipeline View
        website: 'https://loom.com',
        platform: 'Linkedin',
        value: '50,00,000',
        lastContacted: '2hrs ago'
    };
});
