import React, { useState } from 'react';

/**
 * A modal dialog for exporting selected articles to different file formats.
 * It allows users to choose which data fields to include and the desired format (JSON or CSV).
 *
 * @param {object} props - The component's properties.
 * @param {Array<object>} props.articles - The array of selected article objects to be exported.
 * @param {function} props.onClose - The function to call to close the dialog.
 */
const ExportDialog = ({ articles, onClose }) => {
  // State to manage the selected export format ('json' or 'csv').
  const [format, setFormat] = useState('json');
  // State to manage which article fields are included in the export.
  const [includeFields, setIncludeFields] = useState({
    pmid: true,
    title: true,
    authors: true,
    year: true,
    abstract: true,
    full_text: false, // Full text is excluded by default.
    pmcid: true,
    first_author: true
  });

  /**
   * Toggles the inclusion of a specific field in the export.
   * @param {string} field - The name of the field to toggle (e.g., 'title', 'year').
   */
  const toggleField = (field) => {
    setIncludeFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  /**
   * Handles the main export logic. It prepares the data based on selected fields,
   * formats it as either JSON or CSV, and triggers a file download.
   */
  const handleExport = () => {
    // Filter the article data to include only the selected fields.
    const data = articles.map(article => {
      const exportedArticle = {};
      Object.keys(includeFields).forEach(field => {
        if (includeFields[field] && article[field] !== undefined) {
          exportedArticle[field] = article[field];
        }
      });
      return exportedArticle;
    });
    
    // Prevent exporting if no articles are selected.
    if (data.length === 0) {
      // NOTE: Using a custom modal/toast is better than alert() in a real app.
      alert("No articles selected to export.");
      return;
    }

    let content, fileName, mimeType;
    
    // Format the data as a JSON string.
    if (format === 'json') {
      content = JSON.stringify(data, null, 2); // Pretty-print with 2-space indentation.
      fileName = 'pubmed-export.json';
      mimeType = 'application/json';
    } 
    // Format the data as a CSV string.
    else if (format === 'csv') {
      // Create the header row from the selected fields.
      const headers = Object.keys(includeFields).filter(field => includeFields[field]).join(',');
      
      // Create a data row for each article.
      const rows = data.map(item => 
        Object.keys(includeFields)
          .filter(field => includeFields[field])
          .map(field => {
            const value = item[field] === undefined ? '' : item[field];
            // Enclose value in quotes and escape any existing quotes.
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(',')
      );
      content = [headers, ...rows].join('\n');
      fileName = 'pubmed-export.csv';
      mimeType = 'text/csv';
    } else {
      // This case should not be reachable due to the UI constraints.
      return;
    }
    
    // Create a Blob from the content and initiate a download.
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a); // Append the link to the DOM.
    a.click(); // Programmatically click the link to trigger download.
    document.body.removeChild(a); // Clean up by removing the link.
    URL.revokeObjectURL(url); // Release the object URL.
    
    onClose(); // Close the dialog after the export is complete.
  };

  return (
    // Main wrapper for the modal, creating a semi-transparent overlay.
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* The main dialog card. */}
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        {/* Dialog Header */}
        <div className="bg-brand-accent-dark text-white p-4">
          <h2 className="text-xl font-bold">Export Options</h2>
        </div>
        
        <div className="p-6">
          {/* Section for selecting which fields to include. */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-brand-heading mb-3">
              Select fields to export:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Generate a checkbox for each available field. */}
              {Object.entries(includeFields).map(([field, isIncluded]) => (
                <div key={field} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`field-${field}`}
                    checked={isIncluded}
                    onChange={() => toggleField(field)}
                    className="h-4 w-4 text-brand-cta focus:ring-brand-cta border-slate-300 rounded"
                  />
                  <label htmlFor={`field-${field}`} className="ml-2 text-sm text-brand-body capitalize">
                    {field.replace('_', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Section for selecting the export file format. */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-brand-heading mb-3">
              Export Format:
            </h3>
            <div className="flex space-x-4">
              {/* Generate a radio button for each available format. */}
              {['json', 'csv'].map((fmt) => (
                <div key={fmt} className="flex items-center">
                  <input
                    type="radio"
                    id={`format-${fmt}`}
                    name="export-format"
                    checked={format === fmt}
                    onChange={() => setFormat(fmt)}
                    className="h-4 w-4 text-brand-cta focus:ring-brand-cta border-slate-300"
                  />
                  <label htmlFor={`format-${fmt}`} className="ml-2 text-sm text-brand-body uppercase">
                    {fmt}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Dialog Footer with action buttons. */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="bg-brand-cta hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
