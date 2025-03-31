import React from 'react';
import './QuerySelector.css';

const QuerySelector = ({ queries, selectedQueryId, onQuerySelect }) => {
  return (
    <div className="query-selector">
      <label htmlFor="predefined-queries" className="query-selector-label">Predefined Queries:</label>
      <select 
        id="predefined-queries"
        className="query-dropdown"
        value={selectedQueryId}
        onChange={(e) => onQuerySelect(e.target.value)}
      >
        {queries.map(query => (
          <option key={query.id} value={query.id}>
            {query.name} - {query.description}
          </option>
        ))}
      </select>
    </div>
  );
};

export default QuerySelector;