# --- Standard and Third-Party Library Imports ---
import os
import re
import logging
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from bs4 import BeautifulSoup

# --- FastAPI and Pydantic Imports ---
# Used for creating the web server and defining data models
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# --- Environment Variable Loading ---
# For loading secrets like API keys from a .env file
from dotenv import load_dotenv

# --- Basic Setup ---
# Load environment variables from a .env file into the environment
load_dotenv()
# Configure basic logging to output informational messages
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# Create a logger instance for this specific application
logger = logging.getLogger('rhizocam_fastapi')

# --- FastAPI App Initialization ---
# Create an instance of the FastAPI application
app = FastAPI(
    title="RhizoCam Backend",
    description="A FastAPI backend for the PubMed Research Assistant.",
    version="2.0.0"
)

# Add Cross-Origin Resource Sharing (CORS) middleware
# This allows web applications from any origin to interact with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all HTTP methods
    allow_headers=["*"], # Allows all headers
)

# --- Constants ---
# URLs for the NCBI E-utils API for searching and fetching publication data
ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
# Base URL for accessing full-text articles on PubMed Central (PMC)
PMC_ARTICLE_URL = "https://www.ncbi.nlm.nih.gov/pmc/articles/"
# Headers to mimic a web browser when scraping, to avoid being blocked
SCRAPING_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
}
# Retrieve the Gemini API key from environment variables
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
# Ensure the API key is present; otherwise, raise an error
if not GEMINI_API_KEY:
    raise ValueError("A GEMINI_API_KEY is required. Please set it in a .env file.")
logger.info("Gemini API key loaded successfully.")


# --- Pydantic Models ---
# These models define the expected structure and data types for API requests and responses.

class IdeaRequest(BaseModel):
    """Defines the structure for a request to generate a search query."""
    idea: str

class Article(BaseModel):
    """Defines the data structure for a single publication article."""
    pmid: str
    title: str
    first_author: str
    authors: str
    year: str
    journal: Optional[str] = "N/A"
    abstract: str
    pmcid: Optional[str] = ""
    full_text: Optional[str] = "NOT_ATTEMPTED"

class AnalysisRequest(BaseModel):
    """Defines the structure for a request to analyze a list of articles."""
    articles: List[Article]

class SearchRequest(BaseModel):
    """Defines the parameters for a PubMed search request."""
    query: str
    start_date: str = "1900/01/01"
    stop_date: str = "3000/01/01"
    limit: int = 100
    chunk_size: int = 50
    exclude_preprints: bool = True
    free_full_text_only: bool = False
    fetch_full_text: bool = False

# --- Core Logic Functions ---

def search_pmids(query, start_date, stop_date, exclude_preprints, free_full_text_only):
    """Searches PubMed for article PMIDs based on a query and filters."""
    # Construct the search term with optional filters
    search_term = f"({query})"
    if exclude_preprints: search_term += " NOT preprint[pt]"
    if free_full_text_only: search_term += " AND free full text[filter]"
    
    # Set up parameters for the E-Search API call
    params = {'db': 'pubmed', 'term': search_term, 'retmode': 'json', 'retmax': '100000', 'mindate': start_date, 'maxdate': stop_date, 'datetype': 'pdat'}
    
    try:
        # Make the GET request to the NCBI E-Search API
        response = requests.get(ESEARCH_URL, params=params, timeout=30)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        data = response.json()
        pmids = data.get('esearchresult', {}).get('idlist', [])
        logger.info(f"E-Search found {len(pmids)} PMIDs for query: '{query[:50]}...'")
        return set(pmids) # Return a set to automatically handle duplicates
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error while fetching PMIDs: {e}")
        return set()

def get_details_for_pmids(pmids: List[str]):
    """Fetches detailed article information in XML format for a list of PMIDs."""
    if not pmids: return None
    # Set up parameters for the E-Fetch API call
    params = {'db': 'pubmed', 'retmode': 'xml', 'id': ','.join(pmids)}
    try:
        # Make a POST request to the NCBI E-Fetch API
        response = requests.post(EFETCH_URL, data=params, timeout=45)
        response.raise_for_status()
        return response.text # Return the raw XML response
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error while fetching article details: {e}")
        return None

def scrape_full_text(pmcid: str):
    """Scrapes the full text of an article from the PMC website using its PMCID."""
    url = f"{PMC_ARTICLE_URL}{pmcid}/"
    logger.info(f"Scraping full text for PMCID: {pmcid}")
    try:
        # Make a GET request to the article's PMC page
        response = requests.get(url, headers=SCRAPING_HEADERS, timeout=20)
        response.raise_for_status()
        # Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(response.content, 'lxml')
        # Find the main article content container
        body = soup.find(attrs={'aria-label': 'Article content'})
        if not body: return "FULL_TEXT_CONTAINER_NOT_FOUND"
        # Extract and join the text from all paragraph tags
        full_text = ' '.join(p.get_text(strip=True) for p in body.find_all('p'))
        return full_text if full_text else "FULL_TEXT_EMPTY"
    except requests.exceptions.RequestException as e:
        # Return a specific error message if scraping fails
        return f"SCRAPING_FAILED: {str(e).splitlines()[0]}"

def parse_article_xml(article_xml_element: ET.Element) -> Optional[Article]:
    """Parses an XML element containing article data and returns an Article object."""
    # Helper function to safely extract text from an XML element
    def get_text(element, path):
        node = element.find(path)
        if node is not None and node.text is not None:
            return re.sub(r'\s+', ' ', node.text.strip()) # Clean up whitespace
        return ''

    try:
        pmid = get_text(article_xml_element, "./MedlineCitation/PMID")
        if not pmid: return None # Skip if there's no PMID

        # Extract various fields from the XML structure
        title = get_text(article_xml_element, "./MedlineCitation/Article/ArticleTitle") or "NO_TITLE"
        authors_list = [f"{get_text(a, 'ForeName') or ''} {get_text(a, 'LastName')}".strip() for a in article_xml_element.findall("./MedlineCitation/Article/AuthorList/Author") if get_text(a, 'LastName')]
        authors_str = ", ".join(authors_list) or "NO_AUTHORS"
        
        # Format the first author's name as "Lastname, F."
        first_author_display = "NO_AUTHOR"
        if authors_list:
            parts = authors_list[0].split()
            first_author_display = f"{parts[-1]}, {parts[0][0]}." if len(parts) > 1 and parts[0] else (parts[0] if len(parts) == 1 else "NO_AUTHOR")
        
        journal = get_text(article_xml_element, "./MedlineCitation/Article/Journal/Title") or "N/A"
        abstract = ' '.join([node.text for node in article_xml_element.findall("./MedlineCitation/Article/Abstract/AbstractText") if node.text]).strip() or "NO_ABSTRACT"
        year = get_text(article_xml_element.find("./MedlineCitation/Article/Journal/JournalIssue/PubDate"), "Year") or get_text(article_xml_element, ".//ArticleDate/Year") or "NO_YEAR"
        pmcid_node = article_xml_element.find("./PubmedData/ArticleIdList/ArticleId[@IdType='pmc']")
        pmcid = pmcid_node.text if pmcid_node is not None else ""
        
        # Return a structured Article object
        return Article(pmid=pmid, title=title, first_author=first_author_display, authors=authors_str, year=year, journal=journal, abstract=abstract, pmcid=pmcid)
    except Exception as e:
        logger.error(f"Error parsing an article's XML: {e}")
        return None

# --- API Endpoints ---
# These functions define the API routes and handle incoming requests.

@app.get("/health", tags=["Status"])
def health_check():
    """A simple endpoint to check if the service is running."""
    return {"status": "healthy", "service": "RhizoCam Backend (FastAPI)", "timestamp": datetime.utcnow().isoformat()}

@app.post("/generate-query", tags=["Query"])
def generate_query_endpoint(request: IdeaRequest):
    """Generates a PubMed search query from a user's research idea using the Gemini API."""
    logger.info(f"Generating query for idea: {request.idea[:80]}...")
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"
    # A detailed prompt instructing the AI on how to formulate the query
    prompt = f"""Based on the user's research idea, create a concise and effective PubMed query. Instructions: 1. Identify key concepts. 2. Find synonyms. 3. Group with `OR` in parentheses, like `(concept[TIAB] OR synonym[TIAB])`. 4. Combine concepts with `AND`. 5. Confine search to title/abstract with `[TIAB]`. 6. Return ONLY the final query string. User's Idea: "{request.idea}" Example Output: (("air pollution"[TIAB]) AND ("asthma"[TIAB]) AND ("child"[TIAB]))"""
    payload = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.2}}
    
    try:
        response = requests.post(api_url, headers={'Content-Type': 'application/json'}, json=payload, timeout=60)
        response.raise_for_status()
        generated_query = response.json()['candidates'][0]['content']['parts'][0]['text'].strip()
        return {"query": generated_query}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Could not connect to the AI service: {e}")
    except (KeyError, IndexError):
        raise HTTPException(status_code=500, detail="Received an invalid response from the AI service.")

@app.post("/search", response_model=List[Article], tags=["Search"])
def search_endpoint(request: SearchRequest):
    """Performs a search on PubMed, fetches details, and optionally scrapes full text."""
    logger.info(f"Starting search with limit={request.limit}, fetch_full_text={request.fetch_full_text}")
    # Step 1: Get all matching PMIDs
    all_pmids = search_pmids(request.query, request.start_date, request.stop_date, request.exclude_preprints, request.free_full_text_only)
    pmid_list = list(all_pmids)[:request.limit] # Apply the user-defined limit
    if not pmid_list: return []
    
    articles_data = []
    # Step 2: Fetch details in chunks to avoid overwhelming the API
    for i in range(0, len(pmid_list), request.chunk_size):
        chunk = pmid_list[i:i + request.chunk_size]
        xml_data = get_details_for_pmids(chunk)
        if not xml_data: continue
        
        try:
            # Clean invalid XML characters before parsing
            safe_xml = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F]', '', xml_data)
            root = ET.fromstring(safe_xml)
            # Step 3: Parse each article's XML
            for article_xml in root.findall('./PubmedArticle'):
                article_details = parse_article_xml(article_xml)
                if article_details:
                    # Step 4: Optionally scrape full text if available
                    if request.fetch_full_text and article_details.pmcid:
                        article_details.full_text = scrape_full_text(article_details.pmcid)
                    articles_data.append(article_details)
        except ET.ParseError as e:
            logger.error(f"Skipping a chunk due to XML parsing error: {e}")
    return articles_data

@app.post("/analyze", tags=["Analysis"])
def analyze_endpoint(request: AnalysisRequest):
    """Analyzes a list of articles to synthesize research gaps using the Gemini API."""
    logger.info(f"Starting analysis of {len(request.articles)} articles...")
    # Prompt header to guide the AI's response format
    prompt_header = "You are a research assistant. Synthesize research gaps from the provided articles into a concise list. For each gap, cite the source in parentheses (First Author, Year).\n\nExample:\n- The efficacy of treatment Y has not been tested in pediatric populations (Jones, 2021).\n\n--- START OF ARTICLES ---\n"
    
    # Compile the text from all articles (full text if available, otherwise abstract)
    article_texts = []
    for idx, article in enumerate(request.articles):
        citation = f"({article.first_author}, {article.year})"
        text_content = article.full_text if article.full_text and 'NOT_ATTEMPTED' not in article.full_text else article.abstract
        article_texts.append(f"ARTICLE {idx+1} {citation}:\n{text_content[:3000]}...\n") # Truncate to manage prompt length
    
    full_prompt = (prompt_header + "\n".join(article_texts))[:30000] # Final truncation
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"
    payload = {"contents": [{"parts": [{"text": full_prompt}]}], "generationConfig": {"temperature": 0.3, "maxOutputTokens": 2048}}
    
    try:
        response = requests.post(api_url, headers={"Content-Type": "application/json"}, json=payload, timeout=300)
        response.raise_for_status()
        analysis_result = response.json()['candidates'][0]['content']['parts'][0]['text']
        return {"result": analysis_result}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Could not connect to the AI service: {e}")
    except (KeyError, IndexError) as e:
        raise HTTPException(status_code=500, detail="Received an invalid response from the AI service during analysis.")
