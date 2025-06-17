import axios from 'axios';

// The base URL will default to the proxy in development (http://localhost:5001)
const api = axios.create({
  baseURL: '/', 
  timeout: 60000, // Increased timeout for potentially long searches
});

/**
 * Generate PubMed query from a research idea.
 * @param {string} idea - The user's research idea.
 * @returns {Promise} Axios promise
 */
export const generateQuery = (idea) => {
  return api.post('/generate-query', { idea });
};

/**
 * Search PubMed with a given query and parameters.
 * @param {object} params - The search parameters.
 * @returns {Promise} Axios promise
 */
export const searchPubMed = (params) => {
  return api.post('/search', params);
};

/**
 * Analyze a list of articles with Gemini.
 * @param {Array} articles - The articles to be analyzed.
 * @returns {Promise} Axios promise
 */
export const analyzeWithGemini = (articles) => {
  return api.post('/analyze', { articles });
};

export default api;