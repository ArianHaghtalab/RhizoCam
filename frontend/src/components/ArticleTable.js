import React from 'react';

/**
 * A component that displays a list of articles in a table format.
 * It provides functionality for selecting, viewing, and managing articles.
 *
 * @param {object} props - The component's properties.
 * @param {Array<object>} props.articles - The list of article objects to display.
 * @param {Array<string>} props.selectedArticles - An array of PMIDs for the currently selected articles.
 * @param {function} props.toggleSelectArticle - Function to select or deselect a single article.
 * @param {function} props.handleSelectAll - Function to select or deselect all articles.
 * @param {function} props.deleteSelected - Function to move selected articles to the trash.
 * @param {function} props.analyzeWithGemini - Function to trigger analysis of selected articles.
 * @param {number} props.trashCount - The number of articles currently in the trash.
 * @param {function} props.openTrash - Function to open the trash view.
 * @param {function} props.openExport - Function to open the export dialog for selected articles.
 * @param {function} props.handleViewArticle - Function to open the detailed view for a single article.
 */
const ArticleTable = ({
  articles,
  selectedArticles,
  toggleSelectArticle,
  handleSelectAll,
  deleteSelected,
  analyzeWithGemini,
  trashCount,
  openTrash,
  openExport,
  handleViewArticle
}) => {
  // Determines if all articles in the table are currently selected.
  const isAllSelected = articles.length > 0 && articles.length === selectedArticles.length;

  return (
    // Main container for the results table.
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header section with the title and total article count. */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-brand-heading">Results</h2>
        <div className="text-brand-body">{articles.length} articles found</div>
      </div>
      
      {/* Conditional rendering: Show a message if no articles are found. */}
      {articles.length === 0 ? (
        <div className="text-center py-12 text-brand-body">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <p className="mt-4">No articles found. Start a search to see results.</p>
        </div>
      ) : (
        // Render the table and action buttons if articles exist.
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {/* "Select All" checkbox in the table header. */}
                  <th scope="col" className="px-6 py-3">
                    <input
                      type="checkbox"
                      title="Select All"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-brand-cta focus:ring-brand-cta border-slate-300 rounded"
                    />
                  </th>
                  {/* Table column headers. */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-body uppercase tracking-wider">Paper Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-body uppercase tracking-wider">First Author</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-body uppercase tracking-wider">Year</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-body uppercase tracking-wider">PMCID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {/* Map over the articles array to create a table row for each one. */}
                {articles.map((article) => (
                  <tr key={article.pmid} className="hover:bg-brand-bg-alt">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Checkbox for selecting an individual article. */}
                      <input type="checkbox" checked={selectedArticles.includes(article.pmid)} onChange={() => toggleSelectArticle(article.pmid)} className="h-4 w-4 text-brand-cta focus:ring-brand-cta border-slate-300 rounded"/>
                    </td>
                    <td className="px-6 py-4">
                      {/* Clickable article title to open the detail view. Truncates long titles. */}
                      <button 
                        onClick={() => handleViewArticle(article)}
                        className="text-sm text-left font-medium text-brand-heading hover:text-brand-cta"
                        title={article.title}
                      >
                        {article.title.length > 100 ? `${article.title.substring(0, 100)}...` : article.title}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-body">{article.first_author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-body">{article.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-body">
                      {/* Link to the article on PMC if a PMCID is available. */}
                      {article.pmcid ? (<a href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${article.pmcid}/`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-cta">{article.pmcid}</a>) : ('N/A')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer section with action buttons for managing selected articles. */}
          <div className="mt-6 flex flex-wrap gap-3 justify-end items-center">
            <button onClick={openTrash} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Trash ({trashCount})
            </button>
            <button onClick={deleteSelected} disabled={selectedArticles.length === 0} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Move to Trash</button>
            <button onClick={openExport} disabled={selectedArticles.length === 0} className="bg-brand-accent-dark hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Export Selected</button>
            <button onClick={analyzeWithGemini} disabled={selectedArticles.length === 0} className="bg-brand-cta hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              Analyze
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ArticleTable;
