import React, {useState, useEffect, useCallback} from "react";
import DisplayExpenses from "./components/Expenses/DisplayExpenses";
import NewExpense from "./components/NewExpense/NewExpense";
import {registerUser, loginUser, fetchExpenses, createExpense, getAuthToken, setAuthToken} from "./api/client";

// Converts API expense records into the shape the existing UI expects.
const mapApiExpenseToUi = (expense) => ({
  id: expense.id,
  title: expense.note || "Expense",
  amount: expense.amount_cents / 100,
  date: new Date(expense.occurred_on),
});

const App = () => {

  // Track the expenses rendered by the dashboard.
  const [expenses, setExpenses] = useState([]);
  // Holds the authenticated user's profile information.
  const [authUser, setAuthUser] = useState(null);
  // Surfaces authentication or API errors to the user.
  const [authError, setAuthError] = useState("");
  // Show loading state while auth endpoints are in flight.
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  // Show loading state while fetching the expenses list.
  const [isExpensesLoading, setIsExpensesLoading] = useState(false);
  // Toggle between register and login behavior in the inline auth form.
  const [authMode, setAuthMode] = useState("login");
  // Controlled inputs for the auth form.
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");

  // Fetch the authenticated user's expenses and project them into UI state.
  const fetchAndSetExpenses = useCallback(async () => {
    setIsExpensesLoading(true);
    try {
      const apiExpenses = await fetchExpenses();
      setExpenses(apiExpenses.map(mapApiExpenseToUi));
    } catch (err) {
      setAuthError(err.message || "Failed to load expenses.");
    } finally {
      setIsExpensesLoading(false);
    }
  }, []);

  // Restore the current user from a saved JWT (if available) on first render.
  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      return;
    }

    let isMounted = true;

    const restoreSession = async () => {
      setIsAuthLoading(true);
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session expired. Please log in again.");
        }

        const userProfile = await response.json();

        if (!isMounted) {
          return;
        }

        setAuthUser(userProfile);
        setAuthError("");
        await fetchAndSetExpenses();
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setAuthUser(null);
        setAuthError(err.message || "Please log in to continue.");
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [fetchAndSetExpenses]);

  // Format a JS Date into the YYYY-MM-DD string expected by the backend.
  const formatDateForApi = (date) => date.toISOString().split("T")[0];

  // Drive registration or login based on the current mode.
  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setIsAuthLoading(true);
    setAuthError("");

    try {
      if (authMode === "register") {
        await registerUser({email: authEmail, password: authPassword, name: authName});
      }

      const userProfile = await loginUser({email: authEmail, password: authPassword});
      setAuthUser(userProfile);
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      await fetchAndSetExpenses();
    } catch (err) {
      console.error('Auth error:', err);
      setAuthUser(null);
      const detailMessages = Array.isArray(err.body?.error?.details)
        ? err.body.error.details.map((detail) => detail.message).join(' ')
        : '';
      if (detailMessages) {
        setAuthError(detailMessages);
      } else if (err.message) {
        setAuthError(err.message);
      } else {
        setAuthError("Authentication failed. Please try again.");
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Toggle the auth form between login and registration.
  const toggleAuthMode = () => {
    setAuthMode((currentMode) => (currentMode === "login" ? "register" : "login"));
    setAuthError("");
  };

  // Clear local state and storage whenever the user chooses to log out.
  const handleLogout = () => {
    setAuthToken(null);
    setAuthUser(null);
    setExpenses([]);
    setAuthError("");
  };

  // Send new expenses to the backend before updating the local list.
  const addExpenseHandler = async (expense) => {
    if (!authUser) {
      setAuthError("Please log in before adding expenses.");
      return;
    }

    const payload = {
      amount_cents: Math.round(expense.amount * 100),
      currency: "USD",
      occurred_on: formatDateForApi(expense.date),
      category_id: null,
      note: expense.title,
    };

    try {
      const createdExpense = await createExpense(payload);
      setExpenses((prevExpenses) => [mapApiExpenseToUi(createdExpense), ...prevExpenses]);
    } catch (err) {
      setAuthError(err.message || "Unable to save the expense. Please try again.");
    }
  };

  return (
  <div>
     <section className="auth-panel">
       {authUser ? (
        <div>
          <p>Logged in as {authUser.email}</p>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
       ) : (
        <div>
          <div>
            <button type="button" onClick={toggleAuthMode}>
              Switch to {authMode === "login" ? "Register" : "Login"}
            </button>
          </div>
          {authError && <p>{authError}</p>}
          <form onSubmit={handleAuthSubmit}>
            <div>
              <label>Email</label>
              <input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} required />
            </div>
            <div>
              <label>Password</label>
              <input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} required />
            </div>
            {authMode === "register" && (
              <div>
                <label>Name</label>
                <input type="text" value={authName} onChange={(event) => setAuthName(event.target.value)} />
              </div>
            )}
            <button type="submit" disabled={isAuthLoading}>
              {isAuthLoading ? "Submitting..." : authMode === "login" ? "Login" : "Register"}
            </button>
          </form>
        </div>
       )}
       {isAuthLoading && authUser && <p>Loading account...</p>}
     </section>

     {authUser ? (
      <NewExpense onAddExpense = {addExpenseHandler} />
     ) : (
      <p>Please log in to add expenses.</p>
     )}

     {authError && authUser && <p>{authError}</p>}
     {isExpensesLoading && <p>Loading expenses...</p>}

     <DisplayExpenses expenses_list={expenses} />
  
  </div>
 );
};

export default App;
