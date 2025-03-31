import React, { useState, useEffect } from 'react';
import './ResultsTable.css';

const ResultsTable = ({ results, darkMode, onExportCSV }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [sortedResults, setSortedResults] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  
  useEffect(() => {
    if (results && results.columns) {
      setVisibleColumns(results.columns.map(col => col.name));
    }
  }, [results]);

  useEffect(() => {
    if (!results || !results.rows) {
      setSortedResults(null);
      return;
    }

    let sortableResults = [...results.rows];
    
    if (sortConfig.key) {
      sortableResults.sort((a, b) => {
        if (a[sortConfig.key] === null) return 1;
        if (b[sortConfig.key] === null) return -1;
        
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        const isNumeric = !isNaN(valA) && !isNaN(valB);
        
        if (isNumeric) {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        } else {
          return sortConfig.direction === 'asc'
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
        }
      });
    }
    
    setSortedResults(sortableResults);
  }, [results, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (columnName) => {
    if (sortConfig.key !== columnName) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const toggleColumnVisibility = (columnName) => {
    setVisibleColumns(prevColumns => {
      if (prevColumns.includes(columnName)) {
        return prevColumns.filter(col => col !== columnName);
      } else {
        return [...prevColumns, columnName];
      }
    });
  };

  const handleColumnMenuToggle = () => {
    setColumnMenuOpen(!columnMenuOpen);
  };

  if (!results || !results.columns || !results.rows) {
    return <div className="no-results">No results to display</div>;
  }

  return (
    <div className="results-container">
      <div className="results-toolbar">
        <div className="results-info">
          {results.rows.length} rows returned
        </div>
        <div className="column-selector">
          <button 
            className="column-selector-button" 
            onClick={handleColumnMenuToggle}
            aria-label="Toggle column visibility"
          >
            Column visibility
          </button>
          {columnMenuOpen && (
            <div className="column-menu">
              {results.columns.map(column => (
                <label key={column.name} className="column-option">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(column.name)}
                    onChange={() => toggleColumnVisibility(column.name)}
                  />
                  {column.name}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="table-wrapper">
        <table className="results-table" role="table">
          <thead>
            <tr>
              {results.columns
                .filter(column => visibleColumns.includes(column.name))
                .map(column => (
                <th 
                  key={column.name}
                  onClick={() => requestSort(column.name)}
                  className={sortConfig.key === column.name ? 'sorted' : ''}
                  aria-sort={sortConfig.key === column.name ? sortConfig.direction : 'none'}
                  role="columnheader"
                >
                  {column.name}{getSortIndicator(column.name)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedResults && sortedResults.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {results.columns
                  .filter(column => visibleColumns.includes(column.name))
                  .map(column => (
                  <td key={`${rowIndex}-${column.name}`} role="cell">
                    {row[column.name] === null ? <span className="null-value">NULL</span> : String(row[column.name])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;