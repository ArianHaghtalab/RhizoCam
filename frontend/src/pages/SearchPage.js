// src/pages/SearchPage.js
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPubMed, analyzeWithGemini as analyzeApi } from '../api';
import ArticleTable from '../components/ArticleTable';
import GeminiAnalysisDialog from '../components/GeminiAnalysisDialog';
import SearchSettings from '../components/SearchSettings';
import TrashDialog from '../components/TrashDialog';
import ExportDialog from '../components/ExportDialog';
import ArticleDetailDialog from '../components/ArticleDetailDialog';

/**
 * SearchPage Component - Main interface for executing PubMed searches and analyzing results
 * 
 * Manages search execution, article selection, and various dialog states
 * 
 * Props:
 *   - searchQuery: Current search query from parent state
 *   - setSearchQuery: Callback to update parent's search query
 */
const SearchPage = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  
  // Query state management
  const [editableQuery, setEditableQuery] = useState(searchQuery);

  // Sync editable query when parent searchQuery changes
  useEffect(() => {
    setEditableQuery(searchQuery);
  }, [searchQuery]);
  
  // --- Search Configuration State ---
  const [startDate, setStartDate] = useState('2022/01/01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0].replace(/-/g, '/'));
  const [maxArticles, setMaxArticles] = useState(100);
  const [chunkSize, setChunkSize] = useState(50);
  const [excludePreprints, setExcludePreprints] = useState(true);
  const [freeFullText, setFreeFullText] = useState(false);
  const [fetchFullText, setFetchFullText] = useState(false);
  
  // --- Search Execution State ---
  const [isSearching, setIsSearching] = useState(false);
  const [progressMessage, setProgressMessage] = useState('Status: Idle. Adjust settings and click "Start Search".');
  const [articles, setArticles] = useState([]);
  const [trash, setTrash] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);

  // --- Dialog Visibility States ---
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [viewingArticle, setViewingArticle] = useState(null);

  // --- Core Search Functions ---

  /**
   * Executes PubMed search with current parameters
   * Handles loading states, error messages, and results processing
   */
  const startSearch = useCallback(async () => {
    if (!editableQuery || !editableQuery.trim()) {
      alert('Search query is empty.');
      return;
    }
    
    // Initialize search state
    setSearchQuery(editableQuery);
    setIsSearching(true);
    setArticles([]);
    setSelectedArticles([]);
    setProgressMessage('Connecting to PubMed and fetching article IDs...');
    
    try {
      // Prepare search parameters
      const params = {
        query: editableQuery, startDate, endDate,
        limit: parseInt(maxArticles, 10),
        chunk_size: parseInt(chunkSize, 10),
        exclude_preprints: excludePreprints,
        free_full_text_only: freeFullText,
        fetch_full_text: fetchFullText,
      };
      
      // Execute API call
      const response = await searchPubMed(params);
      
      // Process results
      if (response.data && response.data.length > 0) {
        setArticles(response.data);
        setProgressMessage(`Search complete. Found ${response.data.length} articles.`);
      } else {
        setArticles([]);
        setProgressMessage('Search complete. No articles found for the given criteria.');
      }
    } catch (error) {
      console.error('Search failed:', error);
      const errorMessage = error.response?.data?.detail || 'An unexpected error occurred during the search.';
      setProgressMessage(`Error: ${errorMessage}`);
      setArticles([]);
    } finally {
      setIsSearching(false);
    }
  }, [editableQuery, startDate, endDate, maxArticles, chunkSize, excludePreprints, freeFullText, fetchFullText, setSearchQuery]);

  /**
   * Cancels an ongoing search operation
   */
  const stopSearch = () => {
    setIsSearching(false);
    setProgressMessage('Search stopped by user.');
  };
  
  /**
   * Resets search results while preserving current query and settings
   */
  const handleReset = () => {
    setArticles([]);
    setSelectedArticles([]);
    setProgressMessage('Search has been reset. You can now start a new search.');
  };

  // --- Article Selection Management ---

  /**
   * Toggles selection state for a single article
   * @param {string} pmid - PubMed ID of the article to toggle
   */
  const toggleSelectArticle = (pmid) => {
    setSelectedArticles(prev =>
      prev.includes(pmid) ? prev.filter(id => id !== pmid) : [...prev, pmid]
    );
  };

  /**
   * Selects/deselects all articles in current results
   */
  const handleSelectAll = () => {
    if (selectedArticles.length === articles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(articles.map(a => a.pmid));
    }
  };

  /**
   * Moves selected articles to trash bin
   */
  const deleteSelected = () => {
    if (selectedArticles.length === 0) {
      alert('Please select articles to move to trash.');
      return;
    }
    
    // Separate kept and trashed articles
    const toDelete = new Set(selectedArticles);
    const articlesToKeep = articles.filter(article => !toDelete.has(article.pmid));
    const articlesToTrash = articles.filter(article => toDelete.has(article.pmid));

    // Update state
    setArticles(articlesToKeep);
    setTrash(prevTrash => [...prevTrash, ...articlesToTrash]);
    setSelectedArticles([]);
  };

  // --- Analysis Functions ---

  /**
   * Sends selected articles to Gemini API for analysis
   */
  const analyzeWithGemini = async () => {
    if (selectedArticles.length === 0) {
      alert('Please select articles to analyze.');
      return;
    }
    
    // Prepare analysis state
    const articlesToAnalyze = articles.filter(article => selectedArticles.includes(article.pmid));
    setShowAnalysis(true);
    setIsAnalyzing(true);
    setAnalysisResult('');
    
    try {
      // Execute analysis API call
      const response = await analyzeApi(articlesToAnalyze);
      setAnalysisResult(response.data.result);
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error.response?.data?.detail || 'An unexpected error occurred during analysis.';
      setAnalysisResult(`Analysis Failed:\n\n${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Trash Management ---

  /**
   * Restores articles from trash back to main results
   * @param {Array} pmids - Array of PubMed IDs to restore
   */
  const restoreFromTrash = (pmids) => {
    const toRestore = new Set(pmids);
    const restored = trash.filter(article => toRestore.has(article.pmid));
    setArticles(prevArticles => [...prevArticles, ...restored]);
    setTrash(prevTrash => prevTrash.filter(article => !toRestore.has(article.pmid)));
  };

  /**
   * Permanently deletes articles from trash
   * @param {Array} pmids - Array of PubMed IDs to delete
   */
  const permanentlyDelete = (pmids) => {
    const toDelete = new Set(pmids);
    setTrash(prevTrash => prevTrash.filter(article => !toDelete.has(article.pmid)));
  };

  // --- Render ---
  return (
    <div className="container mx-auto px-4">
      {/* Main search configuration panel */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-brand-heading">Search & Analysis</h1>
          <button onClick={() => navigate('/')} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg transition-colors text-sm">&larr; Back</button>
        </div>
        
        {/* Query input section */}
        <div className="mb-6">
          <label htmlFor="active-query" className="text-lg font-semibold text-brand-heading mb-2 block">Active Query</label>
          <textarea 
            id="active-query" 
            value={editableQuery} 
            onChange={(e) => setEditableQuery(e.target.value)} 
            className="w-full h-24 p-2 border border-slate-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-brand-cta focus:outline-none"
          />
        </div>
        
        {/* Search settings component */}
        <SearchSettings 
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
          maxArticles={maxArticles} setMaxArticles={setMaxArticles}
          chunkSize={chunkSize} setChunkSize={setChunkSize}
          excludePreprints={excludePreprints} setExcludePreprints={setExcludePreprints}
          freeFullText={freeFullText} setFreeFullText={setFreeFullText}
          fetchFullText={fetchFullText} setFetchFullText={setFetchFullText}
          isSearching={isSearching}
          startSearch={startSearch}
          stopSearch={stopSearch}
          handleReset={handleReset}
        />
        
        {/* Search status indicator */}
        <div className="mt-6">
          <p className="text-brand-body font-medium">{progressMessage}</p>
          {isSearching && (
            <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
              <div className="bg-brand-cta h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Results table component */}
      <ArticleTable 
        articles={articles}
        selectedArticles={selectedArticles}
        toggleSelectArticle={toggleSelectArticle}
        handleSelectAll={handleSelectAll}
        deleteSelected={deleteSelected}
        analyzeWithGemini={analyzeWithGemini}
        trashCount={trash.length}
        openTrash={() => setShowTrash(true)}
        openExport={() => setShowExport(true)}
        handleViewArticle={setViewingArticle}
      />
      
      {/* Dialog Components */}
      {showAnalysis && (
        <GeminiAnalysisDialog 
          result={analysisResult} 
          isLoading={isAnalyzing} 
          onClose={() => { 
            setShowAnalysis(false); 
            setAnalysisResult(''); 
          }} 
        />
      )}
      
      {showTrash && (
        <TrashDialog 
          trash={trash} 
          onRestore={restoreFromTrash} 
          onDelete={permanentlyDelete} 
          onClose={() => setShowTrash(false)} 
        />
      )}
      
      {showExport && (
        <ExportDialog 
          articles={articles.filter(article => selectedArticles.includes(article.pmid))} 
          onClose={() => setShowExport(false)} 
        />
      )}
      
      {/* Article Detail Dialog */}
      {viewingArticle && (
        <ArticleDetailDialog 
          article={viewingArticle}
          onClose={() => setViewingArticle(null)}
        />
      )}
    </div>
  );
};

export default SearchPage;