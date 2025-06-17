// src/pages/IdeaPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuery } from '../api'; // Import the api function

/**
 * A page component where users can input a research idea.
 * The component sends the idea to the backend to generate a structured
 * PubMed query, then navigates the user to the search results page.
 *
 * @param {object} props - The component's properties.
 * @param {function} props.setSearchQuery - A function to update the search query in the parent state.
 */
const IdeaPage = ({ setSearchQuery }) => {
    // State to hold the user's research idea text.
    const [idea, setIdea] = useState('');
    // State to manage the loading status during the API call.
    const [isLoading, setIsLoading] = useState(false);
    // Hook from React Router for programmatic navigation.
    const navigate = useNavigate();

    /**
     * Handles the form submission.
     * It validates the input, calls the API to generate a query,
     * updates the parent state, and navigates to the search page.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior.
        if (!idea.trim()) {
            // NOTE: Using a custom modal/toast is better than alert() in a real app.
            alert('Please describe your research idea.');
            return;
        }
        setIsLoading(true);
        try {
            // Call the API function with the user's idea.
            const response = await generateQuery(idea);
            // Update the search query in the parent App component.
            setSearchQuery(response.data.query);
            // Navigate to the search page to display the results.
            navigate('/search');
        } catch (error) {
            console.error('Error generating query:', error);
            const errorMessage = error.response ? error.response.data.error : 'Failed to generate query. Please check the backend connection and try again.';
            alert(errorMessage);
        } finally {
            // Ensure loading is set to false after the API call completes or fails.
            setIsLoading(false);
        }
    };

    return (
        // Main container for the page content.
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-brand-heading mb-6">
                    Generate a Query from Your Idea
                </h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="idea" className="block text-brand-body font-medium mb-2">
                            Describe your research idea:
                        </label>
                        <textarea
                            id="idea"
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            className="w-full h-40 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-cta focus:outline-none"
                            placeholder="I want to find studies about organoid intelligence..."
                            disabled={isLoading}
                        />
                    </div>
                    {/* Action buttons for navigation and submission. */}
                    <div className="flex justify-between">
                        <button type="button" onClick={() => navigate('/')} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-6 rounded-lg transition-colors">
                            Back
                        </button>
                        <button type="submit" className="bg-brand-cta hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center" disabled={isLoading}>
                            {/* Conditionally render loading spinner and text. */}
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                'Generate Query & Continue'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IdeaPage;
