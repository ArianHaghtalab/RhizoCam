// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Page Components
import StartPage from './pages/StartPage';
import IdeaPage from './pages/IdeaPage';
import QueryPage from './pages/QueryPage';
import SearchPage from './pages/SearchPage';

// Tailwind CSS output
import './output.css'; 

/**
 * Main App Component - Root component of the application
 * 
 * Responsibilities:
 * - Manages global state (search query)
 * - Sets up application routing
 * - Provides main layout structure
 * - Handles navigation between pages
 */
function App() {
  // Global state for search query that can be accessed across pages
  const [searchQuery, setSearchQuery] = useState('');

  return (
    // Main app container with full viewport height and brand background
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Router component to enable client-side routing */}
      <Router>
        
        {/* Main content area that grows to fill available space */}
        <main className="flex-grow container mx-auto py-8">
          {/* Route definitions for the application */}
          <Routes>
            {/* Landing page route */}
            <Route path="/" element={<StartPage />} />
            
            {/* Idea-based search entry route */}
            <Route 
              path="/idea" 
              element={<IdeaPage setSearchQuery={setSearchQuery} />} 
            />
            
            {/* Direct query entry route */}
            <Route 
              path="/query" 
              element={<QueryPage setSearchQuery={setSearchQuery} />} 
            />
            
            {/* Search results page with route protection */}
            <Route 
              path="/search" 
              element={
                // Only render SearchPage if we have a query, otherwise redirect to home
                searchQuery ? (
                  <SearchPage 
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery} 
                  />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
          </Routes>
        </main>

      </Router>
    </div>
  );
}

export default App;