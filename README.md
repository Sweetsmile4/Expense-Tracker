# Expense Tracker

A responsive web application for tracking income and expenses using HTML, CSS, and JavaScript.

## Features

- Add **income** and **expense** transactions separately.
- Capture transaction **date**, **description**, **category**, and **amount**.
- View transactions in a table with category and type labels.
- Edit and delete existing transactions.
- Filter transactions by category.
- See live totals for:
	- Total income
	- Total expenses
	- Net income (income - expenses)
- Form validation with inline error messages.
- Persistent storage with `localStorage`.

## Project Structure

```text
.
├── index.html
├── styles.css
├── script.js
└── docs/
		└── ARCHITECTURE.md
```

## How to Run

1. Clone or download this repository.
2. Open the project folder.
3. Open `index.html` in your browser.

No build step or external dependencies are required.

## How to Use

1. Fill in the transaction form.
2. Click **Add Income** for income transactions, or **Add Expense** for expense transactions.
3. Use **Edit** to update a transaction and **Delete** to remove one.
4. Use the category filter to view a subset of transactions.
5. Review the summary cards to monitor total income, total expenses, and net income.

## Validation Rules

- Date is required.
- Description must be at least 2 characters.
- Category is required.
- Amount must be a number greater than 0.

## Persistence

Transactions are automatically saved in browser `localStorage`, so data remains after page refresh.

## Notes

- Built with vanilla HTML/CSS/JS.
- Designed to be responsive for desktop, tablet, and mobile screens.