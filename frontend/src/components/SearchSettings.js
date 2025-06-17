import React from 'react';

/**
 * A component that provides a user interface for configuring search parameters.
 * It includes date ranges, result limits, and various boolean toggles for the search.
 *
 * @param {object} props - The component's properties, consisting of state values and their setters.
 * @param {string} props.startDate - The starting date for the search.
 * @param {function} props.setStartDate - Function to update the start date.
 * @param {string} props.endDate - The ending date for the search.
 * @param {function} props.setEndDate - Function to update the end date.
 * @param {number} props.maxArticles - The maximum number of articles to fetch.
 * @param {function} props.setMaxArticles - Function to update the max articles limit.
 * @param {number} props.chunkSize - The number of articles to fetch per API request.
 * @param {function} props.setChunkSize - Function to update the chunk size.
 * @param {boolean} props.excludePreprints - Flag to exclude preprints from the search.
 * @param {function} props.setExcludePreprints - Function to toggle the exclude preprints flag.
 * @param {boolean} props.freeFullText - Flag to search for free full-text articles only.
 * @param {function} props.setFreeFullText - Function to toggle the free full-text flag.
 * @param {boolean} props.fetchFullText - Flag to enable scraping for full text.
 * @param {function} props.setFetchFullText - Function to toggle the fetch full-text flag.
 * @param {boolean} props.isSearching - Flag indicating if a search is currently in progress.
 * @param {function} props.startSearch - Function to initiate the search.
 * @param {function} props.stopSearch - Function to abort an ongoing search.
 * @param {function} props.handleReset - Function to reset all settings to their default values.
 */
const SearchSettings = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  maxArticles,
  setMaxArticles,
  chunkSize,
  setChunkSize,
  excludePreprints,
  setExcludePreprints,
  freeFullText,
  setFreeFullText,
  fetchFullText,
  setFetchFullText,
  isSearching,
  startSearch,
  stopSearch,
  handleReset
}) => {
  return (
    // Main container for the search settings panel.
    <div className="bg-brand-bg-alt rounded-lg p-6 border border-slate-200">
      <h2 className="text-lg font-semibold text-brand-heading mb-4">Search Settings</h2>
      
      {/* Grid layout for text-based input fields. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Start Date Input */}
        <div>
          <label className="block text-sm font-medium text-brand-body mb-1">
            Start Date (YYYY/MM/DD)
          </label>
          <input
            type="text"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-md"
          />
        </div>
        
        {/* End Date Input */}
        <div>
          <label className="block text-sm font-medium text-brand-body mb-1">
            End Date (YYYY/MM/DD)
          </label>
          <input
            type="text"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-md"
          />
        </div>
        
        {/* Max Articles Input */}
        <div>
          <label className="block text-sm font-medium text-brand-body mb-1">
            Max Articles
          </label>
          <input
            type="number"
            value={maxArticles}
            onChange={(e) => setMaxArticles(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-md"
          />
        </div>
        
        {/* Chunk Size Input */}
        <div>
          <label className="block text-sm font-medium text-brand-body mb-1">
            Chunk Size
          </label>
          <input
            type="number"
            value={chunkSize}
            onChange={(e) => setChunkSize(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-md"
          />
        </div>
      </div>
      
      {/* Grid layout for checkbox-based boolean options. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="excludePreprints"
            checked={excludePreprints}
            onChange={(e) => setExcludePreprints(e.target.checked)}
            className="h-4 w-4 text-brand-cta focus:ring-brand-cta border-slate-300 rounded"
          />
          <label htmlFor="excludePreprints" className="ml-2 block text-sm text-brand-body">
            Exclude Preprints
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="freeFullText"
            checked={freeFullText}
            onChange={(e) => setFreeFullText(e.target.checked)}
            className="h-4 w-4 text-brand-cta focus:ring-brand-cta border-slate-300 rounded"
          />
          <label htmlFor="freeFullText" className="ml-2 block text-sm text-brand-body">
            Free Full Text Only
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="fetchFullText"
            checked={fetchFullText}
            onChange={(e) => setFetchFullText(e.target.checked)}
            className="h-4 w-4 text-brand-cta focus:ring-brand-cta border-slate-300 rounded"
          />
          <label htmlFor="fetchFullText" className="ml-2 block text-sm text-brand-body">
            Fetch Full Text (Slow)
          </label>
        </div>
      </div>
      
      {/* Action buttons to control the search process. */}
      <div className="flex space-x-4">
        <button
          onClick={startSearch}
          disabled={isSearching}
          className="bg-brand-cta hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-75"
        >
          {isSearching ? 'Searching...' : 'Start Search'}
        </button>
        
        <button
          onClick={stopSearch}
          disabled={!isSearching}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-75"
        >
          Stop Search
        </button>

        <button
          onClick={handleReset}
          disabled={isSearching}
          className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-75"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default SearchSettings;
