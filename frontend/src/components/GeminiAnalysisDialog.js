// src/components/GeminiAnalysisDialog.js
import React from 'react';

/**
 * A modal dialog to display the results of an analysis performed by the Gemini API.
 * It shows a loading state while waiting for the result and then displays the
 * formatted result text with an option to save it as a .txt file.
 *
 * @param {object} props - The component's properties.
 * @param {string | null} props.result - The analysis result text from Gemini. Null if loading.
 * @param {function} props.onClose - The function to call when the dialog should be closed.
 */
const GeminiAnalysisDialog = ({ result, onClose }) => {
  return (
    // Main wrapper for the modal, creating a semi-transparent overlay.
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* The main dialog card. */}
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Dialog Header */}
        <div className="bg-brand-accent-dark text-white p-4">
          <h2 className="text-xl font-bold">Gemini Analysis Results</h2>
        </div>
        
        {/* Main content area, which is scrollable. */}
        <div className="p-6 overflow-y-auto flex-grow">
          {/* Conditionally render content based on whether the result is available. */}
          {result ? (
            // If result exists, display it.
            <div className="prose max-w-none">
              {/* Using <pre> preserves whitespace and line breaks from the result string. */}
              <pre className="whitespace-pre-wrap font-sans">{result}</pre>
            </div>
          ) : (
            // If result is null, show a loading spinner.
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cta mx-auto"></div>
              <p className="mt-4 text-brand-body">Analyzing articles with Gemini...</p>
            </div>
          )}
        </div>
        
        {/* Dialog Footer with action buttons. */}
        <div className="bg-slate-100 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-brand-accent-dark hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mr-2 transition-colors"
          >
            Close
          </button>
          {/* The "Save Results" button only appears after the analysis is complete. */}
          {result && (
            <button
              onClick={() => {
                // Create a Blob (Binary Large Object) from the result text.
                const blob = new Blob([result], { type: 'text/plain' });
                // Create a temporary URL that points to the Blob in memory.
                const url = URL.createObjectURL(blob);
                // Create a hidden anchor element to trigger the download.
                const a = document.createElement('a');
                a.href = url;
                a.download = 'gemini-analysis-results.txt'; // Set the default filename.
                document.body.appendChild(a); // Add the anchor to the document.
                a.click(); // Programmatically click the anchor to start the download.
                document.body.removeChild(a); // Clean up by removing the anchor.
                URL.revokeObjectURL(url); // Free up memory by releasing the temporary URL.
              }}
              className="bg-brand-cta hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Save Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeminiAnalysisDialog;
