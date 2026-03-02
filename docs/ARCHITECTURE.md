# Expense Tracker - Code Structure

## Overview
The application is a client-side web app built with vanilla HTML, CSS, and JavaScript.

- `index.html`: Page structure and UI sections (summary, form, transaction table).
- `styles.css`: Visual design, responsive layout, and component styles.
- `script.js`: Application state, event handling, rendering, validation, persistence.

## JavaScript Structure (`script.js`)

### 1) State and constants
- `STORAGE_KEY`: localStorage key for persisted transactions.
- `transactions`: in-memory transaction array loaded from localStorage.
- `editingTransactionId`: tracks which transaction is being edited.

### 2) Initialization
- `initialize()` sets default date, renders UI, and wires event listeners.

### 3) Transaction operations
- `addTransaction(type)`: validates and creates income/expense transactions.
- `startEdit(id)`, `saveEdit()`, `cancelEdit()`: handles transaction editing flow.
- `deleteTransaction(id)`: removes transactions.

### 4) Validation
- `getValidatedFormData()` checks date, description, category, amount and returns clean payload.
- `showError()` and `clearError()` display validation feedback in the UI.

### 5) Rendering
- `renderAll()` updates summary, filter options, and transaction list.
- `renderSummary()` calculates income, expenses, and net income.
- `renderCategoryFilter()` builds dynamic category filter options.
- `renderTransactionList()` renders table rows (filtered and sorted).

### 6) Persistence
- `loadTransactions()` safely reads and validates data from localStorage.
- `persistTransactions()` writes current state to localStorage.

## Data Model
Each transaction is stored as:

```json
{
  "id": "uuid",
  "type": "income | expense",
  "date": "YYYY-MM-DD",
  "description": "string",
  "category": "string",
  "amount": 0,
  "createdAt": 0
}
```

## UI/UX Notes
- Desktop/tablet/mobile responsive layout via CSS media queries.
- Color coding for income (green) and expense (red).
- Empty state message when there are no visible transactions.
- Category filter helps isolate specific expense/income groups.
