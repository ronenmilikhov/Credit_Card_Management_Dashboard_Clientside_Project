# Credit Card Expense Dashboard (HTML/CSS/JS + Chart.js, localStorage)

A front-end web app for tracking credit-card spending with a friendly dashboard and lightweight, client-side persistence. Users can sign up / log in, manage multiple cards, import transactions from CSV, and analyze monthly spend with interactive bar and pie charts. All data (users, cards, expenses) is stored in localStorage, so the app runs entirely in the browser—no backend required.

---

## ✨ Features

- **Accounts & Sessions**
  - Simple **Sign Up / Log In** flow with format validation
  - Stores last login timestamp for display on the dashboard

- **Cards**
  - Add and manage **multiple credit cards** per user
  - Validates card number and expiry (regex + basic checks)

- **Transactions**
  - **CSV Import**: upload transactions directly into a selected card
  - CSV → JSON parsing in the browser; persisted to `localStorage`

- **Analytics**
  - **Monthly selection** (fixed range e.g., 2024 → current)
  - **Bar chart**: compare totals for the selected month vs. previous months
  - **Pie chart**: current-month spend by **category**
  - Powered by **Chart.js**

- **UX**
  - Separate pages for `Login`, `SignUp`, `Dashboard`, `Charges`, `Actions`
  - Friendly prompts, input validation, and clear error messages
