const TOKEN_STORAGE_KEY = 'expenseTrackerToken';
// API base: prefer env override for deployed frontend; fall back to hosted API domain, then same-origin proxy (/api).
const apiBaseFromEnv = (typeof process !== 'undefined' && process.env.REACT_APP_API_BASE) || '';
const DEFAULT_API_BASE = 'https://se3200-expense-tracker-2025-group-2-production.up.railway.app';
const API_BASE_PATH =
  apiBaseFromEnv.trim() ||
  (typeof window !== 'undefined' && window.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE;

let authToken = null; // Keeps the JWT in memory so we avoid repeated storage reads.

// Stores the JWT in memory and localStorage so future requests can stay authenticated.
export function setAuthToken(token) {
  authToken = token ?? null;

  if (authToken) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

// Reads the JWT from memory first and falls back to localStorage when the page reloads.
export function getAuthToken() {
  if (authToken) {
    return authToken;
  }

  const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  authToken = storedToken ?? null;
  return authToken;
}

// Base fetch helper that attaches headers, handles auth, and normalizes errors.
export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();
  const fetchOptions = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body !== undefined) {
    if (typeof options.body === 'string') {
      fetchOptions.body = options.body;
    } else {
      fetchOptions.body = JSON.stringify(options.body);
      headers.set('Content-Type', 'application/json');
    }
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_PATH}${path}`, fetchOptions);
  let responseBody = null;

  try {
    responseBody = await response.json();
  } catch (err) {
    // Empty bodies are fine; leave responseBody as null.
  }

  if (response.ok) {
    return responseBody;
  }

  const errorPayload = responseBody?.error;
  const message = errorPayload?.message || responseBody?.message || 'Request failed';

  const error = new Error(message);
  error.status = response.status;
  error.body = responseBody;
  error.code = errorPayload?.code;
  throw error;
}

// Registers a brand new user account against POST /api/auth/register.
export function registerUser({ email, password, name }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: { email, password, name },
  });
}

// Logs a user in, persists the returned token, and returns their profile data.
export async function loginUser({ email, password }) {
  const loginResponse = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (!loginResponse || !loginResponse.token) {
    // Guard against misconfigured API base or unexpected responses in production deploys.
    throw new Error('Login response did not include a token. Please verify the API base URL configuration.');
  }

  setAuthToken(loginResponse.token);

  // After storing the token we can ask the backend who the user is.
  return apiRequest('/auth/me');
}

// Retrieves the authenticated user's expenses list.
export async function fetchExpenses() {
  const response = await apiRequest('/expenses');
  return response?.items ?? [];
}

// Creates a new expense record with the payload that mirrors createExpenseSchema.
export function createExpense(payload) {
  return apiRequest('/expenses', {
    method: 'POST',
    body: payload,
  });
}

// Updates an expense (used here to change categories inline from the expenses list).
export function updateExpense(id, payload) {
  return apiRequest(`/expenses/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

// Deletes an expense record.
export function deleteExpense(id) {
  return apiRequest(`/expenses/${id}`, {
    method: 'DELETE',
  });
}

// Fetches the current user's profile, including budgeting metadata such as annual income.
export function getCurrentUser() {
  return apiRequest('/auth/me');
}

// Retrieves the authenticated user's categories, mapping budget_type -> budgetType for UI clarity.
export async function fetchCategories() {
  const response = await apiRequest('/categories');
  const items = response?.items ?? [];
  return items.map((category) => ({
    ...category,
    budgetType: category.budget_type || category.budgetType || 'need',
  }));
}

// Creates a category while translating the UI-friendly budgetType into the backend's budget_type column.
export function createCategory({ name, color, budgetType }) {
  return apiRequest('/categories', {
    method: 'POST',
    body: {
      name,
      color: color ?? null,
      budget_type: budgetType, // backend expects snake_case
    },
  });
}

// Updates a category and ensures the need/want flag is persisted using the backend's expected shape.
export function updateCategory(id, { name, color, budgetType }) {
  return apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: {
      ...(name !== undefined ? { name } : {}),
      ...(color !== undefined ? { color } : {}),
      ...(budgetType !== undefined ? { budget_type: budgetType } : {}),
    },
  });
}

// Deletes a category; expenses referencing it will fall back to null via FK ON DELETE SET NULL.
export function deleteCategory(id) {
  return apiRequest(`/categories/${id}`, {
    method: 'DELETE',
  });
}

// Stores the user's after-tax yearly income in dollars; backend persists cents to align with expenses.
export function setAnnualIncome(annualIncome) {
  return apiRequest('/budget/income', {
    method: 'PUT',
    body: { annualIncome },
  });
}

// Pulls the 50/30/20 budget summary for a given calendar year.
export function getBudgetSummary(year) {
  return apiRequest(`/budget/summary?year=${year}`);
}
