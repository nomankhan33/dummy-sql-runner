// Predefined queries for the SQL Explorer - Focused on customers.csv

export const predefinedQueries = [
  {
    id: 'all-customers',
    name: 'All Customers',
    description: 'Get all customer records',
    query: 'SELECT * FROM customers;'
  },
  {
    id: 'german-customers',
    name: 'German Customers',
    description: 'Customers from Germany',
    query: 'SELECT customerID, companyName, contactName, city, phone FROM customers WHERE country = "Germany";'
  },
  {
    id: 'by-country',
    name: 'Customers by Country',
    description: 'Customers sorted by country',
    query: 'SELECT customerID, companyName, contactName, country, city FROM customers ORDER BY country;'
  },
  {
    id: 'uk-france-customers',
    name: 'UK/France Customers',
    description: 'Customers from UK or France',
    query: 'SELECT customerID, companyName, contactName, country, city, phone FROM customers WHERE country IN ("UK", "France");'
  },
  {
    id: 'company-search',
    name: 'Search by Company Name',
    description: 'Search with partial company name',
    query: 'SELECT * FROM customers WHERE companyName LIKE "%market%";'
  },
  {
    id: 'limited-results',
    name: 'Top 5 Customers',
    description: 'First 5 customers in database',
    query: 'SELECT customerID, companyName, contactName, country FROM customers LIMIT 5;'
  },
  {
    id: 'missing-fax',
    name: 'Missing Fax Numbers',
    description: 'Customers without fax numbers',
    query: 'SELECT customerID, companyName, contactName, phone, fax FROM customers WHERE fax IS NULL;'
  }
];