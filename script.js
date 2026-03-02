const STORAGE_KEY = "expense-tracker-transactions-v1";

const transactionForm = document.getElementById("transactionForm");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const formError = document.getElementById("formError");

const addIncomeBtn = document.getElementById("addIncomeBtn");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const netIncomeEl = document.getElementById("netIncome");

const transactionListEl = document.getElementById("transactionList");
const emptyStateEl = document.getElementById("emptyState");
const categoryFilterEl = document.getElementById("categoryFilter");

let transactions = loadTransactions();
let editingTransactionId = null;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

initialize();

function initialize() {
  dateInput.value = new Date().toISOString().split("T")[0];
  renderAll();

  addIncomeBtn.addEventListener("click", () => addTransaction("income"));
  addExpenseBtn.addEventListener("click", () => addTransaction("expense"));
  saveEditBtn.addEventListener("click", saveEdit);
  cancelEditBtn.addEventListener("click", cancelEdit);
  categoryFilterEl.addEventListener("change", renderTransactionList);

  transactionForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

function addTransaction(type) {
  clearError();

  const payload = getValidatedFormData();
  if (!payload) {
    return;
  }

  const transaction = {
    id: crypto.randomUUID(),
    type,
    date: payload.date,
    description: payload.description,
    category: payload.category,
    amount: payload.amount,
    createdAt: Date.now(),
  };

  transactions.push(transaction);
  persistTransactions();
  resetForm();
  renderAll();
}

function saveEdit() {
  clearError();

  if (!editingTransactionId) {
    return;
  }

  const payload = getValidatedFormData();
  if (!payload) {
    return;
  }

  const index = transactions.findIndex((item) => item.id === editingTransactionId);
  if (index === -1) {
    showError("Could not find transaction to update.");
    return;
  }

  transactions[index] = {
    ...transactions[index],
    date: payload.date,
    description: payload.description,
    category: payload.category,
    amount: payload.amount,
  };

  persistTransactions();
  exitEditMode();
  resetForm();
  renderAll();
}

function startEdit(transactionId) {
  clearError();
  const transaction = transactions.find((item) => item.id === transactionId);

  if (!transaction) {
    showError("Could not find transaction to edit.");
    return;
  }

  editingTransactionId = transactionId;

  dateInput.value = transaction.date;
  descriptionInput.value = transaction.description;
  categoryInput.value = transaction.category;
  amountInput.value = transaction.amount.toFixed(2);

  addIncomeBtn.classList.add("hidden");
  addExpenseBtn.classList.add("hidden");
  saveEditBtn.classList.remove("hidden");
  cancelEditBtn.classList.remove("hidden");
}

function cancelEdit() {
  exitEditMode();
  resetForm();
}

function exitEditMode() {
  editingTransactionId = null;
  addIncomeBtn.classList.remove("hidden");
  addExpenseBtn.classList.remove("hidden");
  saveEditBtn.classList.add("hidden");
  cancelEditBtn.classList.add("hidden");
}

function deleteTransaction(transactionId) {
  transactions = transactions.filter((item) => item.id !== transactionId);
  persistTransactions();

  if (editingTransactionId === transactionId) {
    cancelEdit();
  }

  renderAll();
}

function getValidatedFormData() {
  const date = dateInput.value;
  const description = descriptionInput.value.trim();
  const category = categoryInput.value;
  const amount = Number.parseFloat(amountInput.value);

  if (!date) {
    showError("Please select a date.");
    return null;
  }

  if (!description || description.length < 2) {
    showError("Description must contain at least 2 characters.");
    return null;
  }

  if (!category) {
    showError("Please select a category.");
    return null;
  }

  if (Number.isNaN(amount) || amount <= 0) {
    showError("Amount must be a valid number greater than 0.");
    return null;
  }

  return {
    date,
    description,
    category,
    amount,
  };
}

function renderAll() {
  renderSummary();
  renderCategoryFilter();
  renderTransactionList();
}

function renderSummary() {
  const totals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += transaction.amount;
      } else {
        acc.expense += transaction.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const net = totals.income - totals.expense;

  totalIncomeEl.textContent = currencyFormatter.format(totals.income);
  totalExpenseEl.textContent = currencyFormatter.format(totals.expense);
  netIncomeEl.textContent = currencyFormatter.format(net);

  netIncomeEl.style.color = net < 0 ? "#e53935" : "#1e66f5";
}

function renderCategoryFilter() {
  const previous = categoryFilterEl.value;
  const categories = [...new Set(transactions.map((item) => item.category))].sort();

  categoryFilterEl.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.textContent = "All";
  categoryFilterEl.appendChild(allOption);

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilterEl.appendChild(option);
  });

  if (["All", ...categories].includes(previous)) {
    categoryFilterEl.value = previous;
  } else {
    categoryFilterEl.value = "All";
  }
}

function renderTransactionList() {
  const selectedCategory = categoryFilterEl.value || "All";
  const filtered =
    selectedCategory === "All"
      ? [...transactions]
      : transactions.filter((item) => item.category === selectedCategory);

  filtered.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) {
      return dateCompare;
    }
    return b.createdAt - a.createdAt;
  });

  transactionListEl.innerHTML = "";

  filtered.forEach((transaction) => {
    const row = document.createElement("tr");

    const formattedDate = new Date(transaction.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      timeZone: "UTC",
    });

    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${escapeHtml(transaction.description)}</td>
      <td>${escapeHtml(transaction.category)}</td>
      <td><span class="type ${transaction.type}">${transaction.type}</span></td>
      <td class="amount ${transaction.type}">${currencyFormatter.format(transaction.amount)}</td>
      <td>
        <div class="row-actions">
          <button class="btn edit" data-action="edit" data-id="${transaction.id}">Edit</button>
          <button class="btn delete" data-action="delete" data-id="${transaction.id}">Delete</button>
        </div>
      </td>
    `;

    transactionListEl.appendChild(row);
  });

  emptyStateEl.style.display = filtered.length ? "none" : "block";
}

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        (item.type === "income" || item.type === "expense") &&
        typeof item.date === "string" &&
        typeof item.description === "string" &&
        typeof item.category === "string" &&
        typeof item.amount === "number" &&
        Number.isFinite(item.amount)
    );
  } catch {
    return [];
  }
}

function persistTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function resetForm() {
  descriptionInput.value = "";
  categoryInput.value = "";
  amountInput.value = "";
  dateInput.value = new Date().toISOString().split("T")[0];
  clearError();
}

function showError(message) {
  formError.textContent = message;
}

function clearError() {
  formError.textContent = "";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

transactionListEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const action = target.dataset.action;
  const transactionId = target.dataset.id;

  if (!action || !transactionId) {
    return;
  }

  if (action === "edit") {
    startEdit(transactionId);
    return;
  }

  if (action === "delete") {
    deleteTransaction(transactionId);
  }
});
