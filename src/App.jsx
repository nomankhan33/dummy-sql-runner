import React, { useState, useEffect } from 'react';
import './App.css';
import QueryEditor from './components/QueryEditor';
import QuerySelector from './components/QuerySelector';
import ResultsTable from './components/ResultsTable';
import Toolbar from './components/Toolbar';
import { predefinedQueries } from './data/queries';
import { loadCustomersData, executeQuery as processQuery, exportToCSV } from './services/dataService';

function App() {
  const [currentQuery, setCurrentQuery] = useState(predefinedQueries[0].query);
  const [queryResults, setQueryResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQueryId, setSelectedQueryId] = useState(predefinedQueries[0].id);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [customersData, setCustomersData] = useState(null);

  // Load customers data when the component mounts
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    // When a predefined query is selected, only update the current query without executing
    const selectedQuery = predefinedQueries.find(q => q.id === selectedQueryId);
    if (selectedQuery) {
      setCurrentQuery(selectedQuery.query);
    }
  }, [selectedQueryId]);

  // Save query to localStorage history
  const saveQueryToHistory = (query) => {
    const history = JSON.parse(localStorage.getItem('queryHistory')) || [];
    if (!history.includes(query)) {
      history.push(query);
      localStorage.setItem('queryHistory', JSON.stringify(history));
    }
  };

  // Load the initial customer data
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const data = await loadCustomersData();
      setCustomersData(data);
    } catch (err) {
      setError(`Error loading customer data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute the current SQL query
  const executeQuery = async (queryToExecute = currentQuery) => {
    if (!customersData) {
      setError("Customer data is not available");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Process the query on the customer data
      const results = processQuery(queryToExecute, customersData);
      setQueryResults(results);
      // Save the query to history for future reference
      saveQueryToHistory(queryToExecute);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueryChange = (newQuery) => {
    setCurrentQuery(newQuery);
  };

  const handleQuerySelect = (queryId) => {
    setSelectedQueryId(queryId);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const exportResultsToCSV = () => {
    if (queryResults) {
      exportToCSV(queryResults, 'customer_query_results.csv');
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>QueryMate</h1>
        <div className="header-controls">
          <button 
            className="theme-toggle-button" 
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div className={`toggle-track ${darkMode ? 'dark' : 'light'}`}>
              <div className="toggle-thumb"></div>
              <svg className="toggle-icon sun-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <svg className="toggle-icon moon-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </div>
          </button>
        </div>
      </header>

      <main className="app-content">
        <div className="query-controls">
          <QuerySelector 
            queries={predefinedQueries}
            selectedQueryId={selectedQueryId}
            onQuerySelect={handleQuerySelect}
          />
          
          <Toolbar 
            onExecute={() => executeQuery()} 
            isLoading={isLoading} 
            onExportCSV={exportResultsToCSV}
            hasResults={!!queryResults}
          />
        </div>
        
        <QueryEditor 
          query={currentQuery} 
          onChange={handleQueryChange} 
          darkMode={darkMode}
        />
        
        <div className="results-area">
          <div className={`results-area ${queryResults ? 'has-results' : ''}`}>
            {isLoading ? (
              <div className="loading-indicator">Running query...</div>
            ) : error ? (
              <div className="error-message" role="alert">{error}</div>
            ) : !queryResults ? (
              <div className="no-data-message">Click "Execute Query" to run the SQL query and see results</div>
            ) : (
              <ResultsTable 
                results={queryResults} 
                darkMode={darkMode} 
                onExportCSV={exportResultsToCSV}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;