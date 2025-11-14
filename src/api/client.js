const TOKEN_STORAGE_KEY = 'expenseTrackerToken';
const API_BASE_PATH = '/api';

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
