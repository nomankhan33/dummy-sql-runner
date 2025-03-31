# QueryMate

QueryMate is a lightweight SQL query explorer that allows users to execute SQL-like queries on CSV data. The application is built with React and Vite, and it features an interactive UI with a Monaco Editor for editing SQL queries, smooth dark mode toggling, dynamic result tables, and CSV export functionality.

## Table of Contents

- [Overview](#overview)
- [Technologies and Packages](#technologies-and-packages)
- [Installation](#installation)
- [Usage](#usage)
- [Performance and Optimizations](#performance-and-optimizations)
- [Deployment](#deployment)
- [License](#license)

## Overview

QueryMate enables users to:
- Execute SQL-like queries on CSV data.
- Edit and format queries using the Monaco Editor (with the help of `sql-formatter`).
- View results in a sortable, filterable table.
- Toggle between light and dark modes with smooth transitions.
- Export query results as CSV files.

## Technologies and Packages

- **React:** The primary JavaScript framework for building the UI.
- **Vite:** A fast build tool and development server.
- **Monaco Editor:** A powerful, in-browser code editor for SQL query editing.
- **Papaparse:** For parsing CSV files into JavaScript objects.
- **SQL-Formatter:** To format and beautify SQL queries.
- **LocalStorage API:** Used for persisting dark mode settings and query history.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/my-app.git
   cd my-app
