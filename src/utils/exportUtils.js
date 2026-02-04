export const exportToCSV = (data, filename = "export.csv") => {
  if (!data || !data.length) {
    console.warn("No data to export");
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV format
  const csvContent = [
    headers.join(","), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle strings with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    )
  ].join("\n");

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
