import React, { useState } from 'react';

/**
 * A modal dialog component to display the detailed information of a scientific article.
 * It features a tabbed interface to switch between the article's abstract and full text.
 *
 * @param {object} props - The component's properties.
 * @param {object} props.article - The article object containing details like title, authors, abstract, etc.
 * @param {function} props.onClose - The function to call when the dialog should be closed.
 */
const ArticleDetailDialog = ({ article, onClose }) => {
  // State to manage which tab ('abstract' or 'full_text') is currently active.
  const [activeTab, setActiveTab] = useState('abstract');

  // If no article data is provided, don't render anything.
  if (!article) return null;

  return (
    // Main wrapper for the modal, creating a semi-transparent overlay.
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      {/* The main dialog card with a white background and shadow. */}
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Dialog Header: Displays the article's title, authors, and journal information. */}
        <div className="bg-brand-heading text-white p-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-200">{article.title}</h2>
            <p className="text-sm text-slate-300 mt-1">
              {article.authors}
            </p>
            <p className="text-sm font-semibold text-slate-200 mt-2">
              {article.journal} ({article.year})
            </p>
          </div>
          {/* Close button for the dialog. */}
          <button onClick={onClose} className="text-2xl font-bold leading-none hover:text-slate-300">&times;</button>
        </div>

        {/* Tab Navigation: Buttons to switch between the abstract and full text views. */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('abstract')}
            className={`py-2 px-4 font-semibold ${activeTab === 'abstract' ? 'border-b-2 border-brand-cta text-brand-cta' : 'text-slate-500'}`}
          >
            Abstract
          </button>
          <button
            onClick={() => setActiveTab('full_text')}
            className={`py-2 px-4 font-semibold ${activeTab === 'full_text' ? 'border-b-2 border-brand-cta text-brand-cta' : 'text-slate-500'}`}
          >
            Full Text
          </button>
        </div>

        {/* Tab Content: Displays the content for the currently active tab. */}
        <div className="p-6 overflow-y-auto flex-grow prose max-w-none">
          {/* Conditional rendering for the Abstract tab. */}
          {activeTab === 'abstract' && <p>{article.abstract}</p>}
          
          {/* Conditional rendering for the Full Text tab. */}
          {activeTab === 'full_text' && (
            <div>
              {/* Check if full text exists and was successfully fetched. */}
              {article.full_text && !article.full_text.startsWith('NOT_ATTEMPTED') && !article.full_text.startsWith('SCRAPING_FAILED') ? (
                <p>{article.full_text}</p>
              ) : (
                // Display a fallback message if the full text is not available.
                <p className="text-slate-500 italic">
                  Full text was not fetched for this article. You can try fetching it by enabling the "Fetch Full Text" option and running the search again.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Dialog Footer: Contains action buttons. */}
        <div className="bg-slate-100 p-4 flex justify-end space-x-3">
          <button onClick={onClose} className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold py-2 px-4 rounded-lg transition-colors">
            Close
          </button>
          {/* Link to view the article on the official PubMed website. */}
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-cta hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Go to PubMed
          </a>
        </div>
      </div>
    </div>
  );
};

// Export the component for use in other parts of the application.
export default ArticleDetailDialog;
