// src/pages/QueryPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// QueryPage component - Main entry point for search query input
// Props:
//   - setSearchQuery: Callback function to update the parent's search query state
const QueryPage = ({ setSearchQuery }) => {
  // Local state to manage the query input value
  const [query, setQuery] = useState('');
  
  // Navigation hook for programmatic routing
  const navigate = useNavigate();

  // Handles form submission with validation
  // Prevents empty queries and navigates to results page
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate query isn't just whitespace
    if (!query.trim()) {
      alert('Please enter a search query.');
      return;
    }
    
    // Lift query state up to parent component
    setSearchQuery(query);
    
    // Redirect to search results page
    navigate('/search');
  };

  // Render the query input form with helpful guidance
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Main heading for the query input section */}
        <h1 className="text-3xl font-bold text-brand-heading mb-6">
          Enter your search query
        </h1>
        
        {/* Query input form with submission handling */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            {/* Textarea label for accessibility */}
            <label htmlFor="query" className="block text-brand-body font-medium mb-2">
              Search Query:
            </label>
            
            {/* Controlled textarea component for query input */}
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-32 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-cta focus:outline-none font-mono text-sm"
              placeholder="(organoid intelligence[TIAB] OR brain organoid[TIAB]) AND stem cell[TIAB]"
            />
          </div>
          
          {/* Form action buttons with responsive layout */}
          <div className="flex justify-between">
            {/* Secondary back button to return to previous page */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Back
            </button>
            
            {/* Primary submit button to execute the search */}
            <button
              type="submit"
              className="bg-brand-cta hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Use This Query & Continue
            </button>
          </div>
        </form>
        
        {/* Help section with query syntax tips */}
        <div className="mt-8 bg-brand-bg-alt rounded-lg p-4">
          <h3 className="font-bold text-brand-heading mb-2">Query Syntax Tips:</h3>
          <ul className="list-disc pl-5 text-brand-body space-y-1 text-sm">
            <li>Use `[TIAB]` to search in Title and Abstract fields for more relevant results.</li>
            <li>Combine different concepts with `AND`, `OR`, `NOT`.</li>
            <li>Use parentheses `( )` to group concepts and control the order of operations.</li>
            <li>Use quotes `" "` for exact phrases, e.g., `"clinical trial"`.</li>
            <li>You can specify date ranges in the search settings on the next page.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QueryPage;