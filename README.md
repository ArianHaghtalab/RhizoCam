# RhizoCam

*RhizoCam is a smart tool that nears and traverses the extensive terrain of biological and healthcare literature to identify research gaps and generate new directions for your next discovery.*

---

## Table of Contents
- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [License](#license)

## About The Project

RhizoCam is a full-stack web application designed to serve as an intelligent research assistant for scientists, students, and healthcare professionals. Traditional literature searches can be cumbersome, often yielding thousands of articles that are difficult to sift through. RhizoCam streamlines this process by leveraging the power of Large Language Models (LLMs) and the comprehensive PubMed database.

This tool allows users to:
1.  Transform a simple research idea into a sophisticated, syntactically correct PubMed query.
2.  Perform advanced searches with fine-tuned parameters.
3.  Scrape the full text of open-access articles.
4.  Utilize Google's Gemini AI to analyze the collected literature and explicitly identify stated research gaps, helping to guide future research endeavors.

## Key Features

- **🤖 AI-Powered Query Generation**: Describe your research idea in plain English and let the AI build an effective PubMed query for you.
- **🔍 Advanced Search**: Filter PubMed results by date range, exclude preprints, and limit searches to free full-text articles.
- **📄 Full-Text Scraping**: Automatically scrapes the full text from available PubMed Central (PMC) articles for deeper analysis.
- **🔬 AI-Powered Gap Analysis**: Submits selected articles to the Google Gemini API to read and synthesize a list of potential research gaps.
- **📊 Interactive Results Table**: View, sort, and select articles from your search results. Includes a "Select All" feature for bulk actions.
- **📑 Detailed Article View**: Click on any article title to view its full abstract, authors, journal, and scraped full text in a clean, tabbed interface.
- **🗑️ Data Management**: A fully functional trash system allows you to remove irrelevant articles and restore them if needed.
- **📤 Data Export**: Export selected articles and their data to JSON or CSV formats.

## Tech Stack

This project is a modern full-stack application composed of a Python backend and a React frontend.

### Backend
- **Framework**: [Python 3](https://www.python.org/) with [FastAPI](https://fastapi.tiangolo.com/)
- **Server**: [Uvicorn](https://www.uvicorn.org/)
- **API Interaction**: [Requests](https://requests.readthedocs.io/en/latest/)
- **Web Scraping/Parsing**: [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) & [lxml](https://lxml.de/)
- **Environment Variables**: [python-dotenv](https://pypi.org/project/python-dotenv/)

### Frontend
- **Framework**: [React](https://reactjs.org/) (Create React App)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **API Communication**: [Axios](https://axios-http.com/)

### External APIs
- [NCBI E-utils API](https://www.ncbi.nlm.nih.gov/books/NBK25501/) (for PubMed)
- [Google Gemini API](https://ai.google.dev/)

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (which includes npm)
- [Python 3](https://www.python.org/downloads/)

### Installation & Setup

1.  **Clone the repository**
    ```sh
    git clone https://github.com/ArianHaghtalab/RhizoCam.git
    cd RhizoCam
    ```

2.  **Set up the Backend**
    ```sh
    # Navigate to the backend directory
    cd backend

    # Create a Python virtual environment
    python -m venv venv

    # Activate the virtual environment
    # On Windows:
    .\venv\Scripts\Activate.ps1
    # On macOS/Linux:
    # source venv/bin/activate

    # Install the required Python packages
    pip install -r requirements.txt

    # Create an environment file for your API key
    # Create a new file named .env in the 'backend' directory
    # and add your Google Gemini API key to it:
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```

3.  **Set up the Frontend**
    ```sh
    # From the root 'rhizocam' directory, navigate to the frontend
    cd ../frontend

    # Install the required npm packages
    npm install
    ```

---

## Running the Application

Because this is a full-stack project, you must run the backend and frontend servers simultaneously in **two separate terminals**.

1.  **Start the Backend Server**
    * Open your first terminal.
    * Navigate to the `backend` directory and activate the virtual environment.
    * Run the Uvicorn server:
    ```sh
    # Make sure you are in the /backend directory
    uvicorn main:app --reload --port 5001
    ```
    You should see a message indicating the server is running on `http://127.0.0.1:5001`. Leave this terminal running.

2.  **Start the Frontend Server**
    * Open your second terminal.
    * Navigate to the `frontend` directory.
    * Run the React development server:
    ```sh
    # Make sure you are in the /frontend directory
    npm start
    ```
    A browser tab should automatically open to `http://localhost:3000`.

3.  **Access the Application**
    * Interact with the web application at **`http://localhost:3000`**.
    * You can view the backend's automatic API documentation at **`http://localhost:5001/docs`**.

---

## License

This project is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License. You can place the full license text in a `LICENSE.txt` file.

