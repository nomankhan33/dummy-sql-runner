import Papa from 'papaparse';

// Load customer data from the CSV file in the public folder
export const loadCustomersData = async () => {
  try {
    const response = await fetch('/customers.csv');
    
    if (!response.ok) {
      throw new Error(`Failed to load customers.csv: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing had errors:', results.errors);
          }
          const transformedData = transformCSVData(results.data, results.meta);
          resolve(transformedData);
        },
        error: (error) => {
          reject(new Error(`Error parsing CSV: ${error}`));
        }
      });
    });
  } catch (error) {
    console.error('Error loading CSV file:', error);
    throw new Error(`Failed to load customers.csv: ${error.message}`);
  }
};

const transformCSVData = (data, meta) => {
  if (!data || data.length === 0) {
    return {
      columns: [],
      rows: []
    };
  }
  
  const columnNames = meta.fields || Object.keys(data[0]);
  
  const columns = columnNames.map(name => {
    let type = 'string';
    
    for (const row of data) {
      const value = row[name];
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'number') {
          type = Number.isInteger(value) ? 'integer' : 'decimal';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'string') {
          if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value)) {
            type = 'date';
          }
        }
        break;
      }
    }
    
    return { name, type };
  });
  
  return {
    columns,
    rows: data
  };
};

export const exportToCSV = (data, filename = 'query_results.csv') => {
  if (!data || !data.columns || !data.rows || data.rows.length === 0) {
    throw new Error('No data to export');
  }
  
  const columnNames = data.columns.map(col => col.name);
  
  const csvContent = Papa.unparse({
    fields: columnNames,
    data: data.rows.map(row => {
      const rowData = {};
      columnNames.forEach(col => {
        rowData[col] = row[col];
      });
      return rowData;
    })
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const executeQuery = (query, data) => {
  if (!data || !data.rows || data.rows.length === 0) {
    return data;
  }
  
  const queryLower = query.toLowerCase().trim();

  // Validate basic SQL structure
  if (!queryLower.startsWith('select')) {
    throw new Error("Query must start with SELECT");
  }
  
  if (queryLower.includes('join')) {
    throw new Error("Unsupported SQL syntax. JOIN clauses are not supported.");
  }
  
  let filteredRows = [...data.rows];
  let selectedColumns = [...data.columns];
  
  // Handle column selection if not using SELECT *
  if (queryLower.includes('select') && !queryLower.includes('select *')) {
    try {
      const selectMatch = queryLower.match(/select\s+(.+?)\s+from/i);
      if (selectMatch && selectMatch[1]) {
        const selectedColumnsStr = selectMatch[1].trim();
        const columnNames = selectedColumnsStr
          .split(',')
          .map(col => col.trim())
          .filter(col => col !== '*');
        if (columnNames.length > 0) {
          const lowerColumnNames = columnNames.map(name => name.toLowerCase());
          selectedColumns = data.columns.filter(col => 
            lowerColumnNames.includes(col.name.toLowerCase())
          );
          if (selectedColumns.length === 0) {
            throw new Error("None of the selected columns match the dataset");
          }
        }
      }
    } catch (err) {
      console.error('Error parsing column selection:', err);
      selectedColumns = [...data.columns];
    }
  }
  
  // Process WHERE clause
  if (queryLower.includes('where')) {
    const whereClauseMatch = queryLower.match(/where\s+(.*?)(?:order by|group by|limit|$)/i);
    
    if (whereClauseMatch && whereClauseMatch[1]) {
      const condition = whereClauseMatch[1].trim();
      
      const equalsMatch = condition.match(/(\w+)\s*=\s*['"](.+?)['"]/i);
      const likeMatch = condition.match(/(\w+)\s+like\s+['"]%(.+)%['"]/i);
      const inMatch = condition.match(/(\w+)\s+in\s+\((.+)\)/i);
      
      if (equalsMatch) {
        const column = equalsMatch[1];
        const value = equalsMatch[2];
        filteredRows = filteredRows.filter(row => {
          if (row[column] === null || row[column] === undefined) return false;
          return String(row[column]).toLowerCase() === value.toLowerCase();
        });
      } 
      else if (likeMatch) {
        const column = likeMatch[1];
        const value = likeMatch[2];
        filteredRows = filteredRows.filter(row => {
          if (row[column] === null || row[column] === undefined) return false;
          return String(row[column]).toLowerCase().includes(value.toLowerCase());
        });
      }
      else if (inMatch) {
        const column = inMatch[1];
        const valuesString = inMatch[2];
        const valueMatches = valuesString.match(/['"](.+?)['"]/g) || [];
        const values = valueMatches.map(v => v.replace(/['"]/g, '').toLowerCase());
        filteredRows = filteredRows.filter(row => {
          if (row[column] === null || row[column] === undefined) return false;
          return values.includes(String(row[column]).toLowerCase());
        });
      }
    }
  }
  
  // Process ORDER BY clause
  if (queryLower.includes('order by')) {
    const orderByMatch = queryLower.match(/order by\s+(.*?)(?:limit|$)/i);
    
    if (orderByMatch && orderByMatch[1]) {
      const orderParts = orderByMatch[1].trim().split(/\s+/);
      const column = orderParts[0];
      const direction = orderParts[1]?.toLowerCase() === 'desc' ? -1 : 1;
      
      filteredRows.sort((a, b) => {
        if (a[column] === b[column]) return 0;
        if (a[column] === null || a[column] === undefined) return 1;
        if (b[column] === null || b[column] === undefined) return -1;
        return a[column] < b[column] ? -direction : direction;
      });
    }
  }
  
  // Process LIMIT clause
  if (queryLower.includes('limit')) {
    const limitMatch = queryLower.match(/limit\s+(\d+)/i);
    if (limitMatch && limitMatch[1]) {
      const limit = parseInt(limitMatch[1], 10);
      filteredRows = filteredRows.slice(0, limit);
    }
  }
  
  return {
    ...data,
    columns: selectedColumns,
    rows: filteredRows
  };
};