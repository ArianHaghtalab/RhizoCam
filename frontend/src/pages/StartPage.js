// src/pages/StartPage.js
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * StartPage Component - Entry point for the application
 * 
 * Presents users with two main options to begin their search:
 * 1. Start from an idea (AI-assisted query building)
 * 2. Start from a query (direct search input)
 * 
 * Features responsive design and visual icons for each option
 */
const StartPage = () => {
  return (
    // Main container with responsive padding and max-width
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* White card with shadow for content containment */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        
        {/* Main heading with responsive typography */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-brand-heading mb-10">
          How would you like to begin?
        </h1>
        
        {/* Grid layout for the two options (stacked on mobile, side-by-side on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Option 1: Start from an idea */}
          <Link 
            to="/idea" 
            className="bg-brand-bg-alt hover:bg-slate-200 transition-colors p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center"
            aria-label="Start from an idea with AI assistance"
          >
            {/* Icon container with brand accent color */}
            <div className="bg-brand-accent-dark text-white rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            
            {/* Option title */}
            <h3 className="text-xl font-bold text-brand-heading mb-2">
              Start from an idea
            </h3>
            
            {/* Option description */}
            <p className="text-brand-body">
              Describe your concept and let AI build a powerful query for you.
            </p>
          </Link>
          
          {/* Option 2: Start from a query */}
          <Link 
            to="/query" 
            className="bg-brand-bg-alt hover:bg-slate-200 transition-colors p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center"
            aria-label="Start with your own search query"
          >
            {/* Icon container with brand accent color */}
            <div className="bg-brand-accent-dark text-white rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Option title */}
            <h3 className="text-xl font-bold text-brand-heading mb-2">
              Start from a query
            </h3>
            
            {/* Option description */}
            <p className="text-brand-body">
              Enter your own search string to find and analyze articles directly.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StartPage;