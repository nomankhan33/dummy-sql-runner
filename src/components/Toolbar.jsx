import React from 'react';
import './Toolbar.css';

const Toolbar = ({ onExecute, isLoading, onExportCSV, hasResults }) => {
  // Copy query results to clipboard
  const copyResultsToClipboard = () => {
    const tableElement = document.querySelector('.results-table');
    if (!tableElement) return;
    
    // Create a range and select the table
    const range = document.createRange();
    range.selectNode(tableElement);
    
    // Clear current selection and add our range
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    
    // Execute copy command
    document.execCommand('copy');
    
    // Clean up selection
    window.getSelection().removeAllRanges();
    
    // Provide feedback
    alert('Results copied to clipboard!');
  };

  return (
    <div className="toolbar">
      <button 
        onClick={onExecute} 
        disabled={isLoading}
        className="execute-button"
        title="Execute the current SQL query"
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Running...
          </>
        ) : (
          <>
            <span className="play-icon">▶</span>
            Execute Query
          </>
        )}
      </button>
      <div className="toolbar-actions">
        <button 
          className="action-button"
          onClick={copyResultsToClipboard}
          disabled={!hasResults}
          title={!hasResults ? 'No results to copy' : 'Copy results to clipboard'}
        >
          <span className="icon">📋</span>
          Copy Results
        </button>
        <button 
          className="action-button"
          onClick={onExportCSV}
          disabled={!hasResults}
          title={!hasResults ? 'No results to export' : 'Export results as CSV'}
        >
          <span className="icon">⬇️</span>
          Export CSV
        </button>
      </div>
    </div>
  );
};

export default Toolbar;