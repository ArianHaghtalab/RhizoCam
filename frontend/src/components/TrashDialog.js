import React, { useState } from 'react';

/**
 * A modal dialog for managing trashed articles.
 * It allows users to view, select, restore, and permanently delete articles.
 *
 * @param {object} props - The component's properties.
 * @param {Array<object>} props.trash - An array of article objects currently in the trash.
 * @param {function} props.onRestore - Function to restore selected articles.
 * @param {function} props.onDelete - Function to permanently delete selected articles.
 * @param {function} props.onClose - Function to close the dialog.
 */
const TrashDialog = ({ trash, onRestore, onDelete, onClose }) => {
  // State to keep track of which articles are selected within the dialog.
  const [selected, setSelected] = useState([]);

  /**
   * Toggles the selection status of a single article by its PMID.
   * @param {string} pmid - The PMID of the article to select or deselect.
   */
  const toggleSelect = (pmid) => {
    if (selected.includes(pmid)) {
      // If already selected, remove it from the array.
      setSelected(selected.filter(itemId => itemId !== pmid));
    } else {
      // If not selected, add it to the array.
      setSelected([...selected, pmid]);
    }
  };

  /**
   * Calls the parent restore function with the selected items and clears the selection.
   */
  const handleRestore = () => {
    onRestore(selected);
    setSelected([]); // Reset selection after restoring.
  };

  /**
   * Confirms and calls the parent delete function.
   * If items are selected, it deletes only those. Otherwise, it targets all items (Empty Trash).
   */
  const handleDelete = () => {
    // Determine which items to delete based on the current selection.
    const itemsToDelete = selected.length > 0 ? selected : trash.map(a => a.pmid);
    const count = itemsToDelete.length;
    const itemType = count === 1 ? 'item' : 'items';

    // Use the browser's native confirm dialog. For a more polished UI,
    // this could be replaced with a custom confirmation modal.
    if (window.confirm(`Are you sure you want to permanently delete ${count} ${itemType}? This action cannot be undone.`)) {
      onDelete(itemsToDelete);
      setSelected([]); // Reset selection after deleting.
    }
  };

  return (
    // Main wrapper for the modal, creating a semi-transparent overlay.
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* The main dialog card. */}
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Dialog Header: Displays title, item count, and a close button. */}
        <div className="bg-brand-accent-dark p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Trash ({trash.length} items)</h2>
          <button onClick={onClose} className="text-2xl font-bold leading-none text-white hover:text-slate-300">&times;</button>
        </div>
        
        {/* Main content area, which is scrollable. */}
        <div className="p-6 overflow-y-auto flex-grow">
          {trash.length === 0 ? (
            // Display a message if the trash is empty.
            <div className="text-center py-16 text-brand-body">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <p className="mt-4">Trash is empty.</p>
            </div>
          ) : (
            // Display the table of trashed articles.
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-brand-body uppercase tracking-wider">Select</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-brand-body uppercase tracking-wider">Paper Title</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-brand-body uppercase tracking-wider">First Author</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-brand-body uppercase tracking-wider">Year</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {trash.map((article) => (
                  <tr key={article.pmid} className="hover:bg-brand-bg-alt">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input type="checkbox" checked={selected.includes(article.pmid)} onChange={() => toggleSelect(article.pmid)} className="h-4 w-4 text-brand-cta focus:ring-brand-cta border-slate-300 rounded"/>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-brand-heading" title={article.title}>
                        {article.title.length > 70 ? `${article.title.substring(0, 70)}...` : article.title}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-brand-body">{article.first_author}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-brand-body">{article.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Dialog Footer with action buttons. */}
        <div className="bg-slate-100 p-4 flex justify-between items-center flex-wrap gap-2">
          <button onClick={onClose} className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold py-2 px-4 rounded-lg transition-colors">Close</button>
          {/* Only show the Restore/Delete buttons if there are items in the trash. */}
          {trash.length > 0 && (
            <div className="space-x-2">
              <button onClick={handleRestore} disabled={selected.length === 0} className="bg-brand-accent-dark hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Restore Selected
              </button>
              <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                {/* Change button text based on whether items are selected. */}
                {selected.length > 0 ? 'Delete Selected' : 'Empty Trash'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrashDialog;
