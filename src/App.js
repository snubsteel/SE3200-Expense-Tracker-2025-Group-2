import React, {useState, useEffect, useCallback} from "react";
import "./App.css";
import DisplayExpenses from "./components/Expenses/DisplayExpenses";
import NewExpense from "./components/NewExpense/NewExpense";
import {
  registerUser,
  loginUser,
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getAuthToken,
  setAuthToken,
  getCurrentUser,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setAnnualIncome,
  getBudgetSummary,
} from "./api/client";

// Converts API expense records into the shape the existing UI expects, including category metadata.
const mapApiExpenseToUi = (expense) => ({
  id: expense.id,
  title: expense.note || "Expense",
  amount: expense.amount_cents / 100,
  date: new Date(expense.occurred_on),
  categoryId: expense.category_id,
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
  // Capture confirm password for registration to avoid accidental mismatches.
  const [confirmPassword, setConfirmPassword] = useState("");
  // Controlled inputs for the auth form.
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  // Track which section of the app is visible (expenses, categories, budget).
  const [activeView, setActiveView] = useState("expenses");
  // Keep the user's after-tax annual income (dollars) for the 50/30/20 model.
  const [incomeInput, setIncomeInput] = useState("");
  const [incomeStatus, setIncomeStatus] = useState("");
  const [incomeError, setIncomeError] = useState("");
  const [isSavingIncome, setIsSavingIncome] = useState(false);
  // Manage categories and their 50/30 flags (need/want).
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  // Fixed color palette replaces free-text hex entry to keep the UI consistent.
  const presetCategoryColors = [
    { label: "Green", value: "#10b981" },
    { label: "Blue", value: "#2563eb" },
    { label: "Purple", value: "#7c3aed" },
    { label: "Orange", value: "#f97316" },
    { label: "Red", value: "#ef4444" },
  ];
  const [categoryColor, setCategoryColor] = useState(presetCategoryColors[0].value);
  const [categoryBudgetType, setCategoryBudgetType] = useState("need");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryDeleteError, setCategoryDeleteError] = useState("");
  // Budget summary state for the 50/30/20 breakdown.
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [budgetError, setBudgetError] = useState("");
  const [isBudgetLoading, setIsBudgetLoading] = useState(false);
  const [expenseCategorySavingId, setExpenseCategorySavingId] = useState(null);
  const [expenseCategoryError, setExpenseCategoryError] = useState("");
  // Build a focused year list (last 5 + next 1) for the dropdown; keeps UI tidy on mobile.
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, idx) => currentYear + 1 - idx);

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
        const userProfile = await getCurrentUser();

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
        // Prevent submitting if passwords differ; keeps register API untouched but guards UX.
        if (authPassword !== confirmPassword) {
          setAuthError("Passwords do not match.");
          setIsAuthLoading(false);
          return;
        }
        await registerUser({email: authEmail, password: authPassword, name: authName});
      }

      const userProfile = await loginUser({email: authEmail, password: authPassword});
      setAuthUser(userProfile);
      // Prefill income input when the backend returns annual_income_cents (converted to dollars).
      if (userProfile.annualIncomeCents !== undefined && userProfile.annualIncomeCents !== null) {
        setIncomeInput((userProfile.annualIncomeCents / 100).toString());
      } else {
        setIncomeInput("");
      }
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

  // Delete an expense and refresh list.
  const handleDeleteExpense = async (expenseId) => {
    setExpenseCategoryError("");
    try {
      await deleteExpense(expenseId);
      await fetchAndSetExpenses();
      await loadBudgetSummary(selectedYear); // Keep budget summary current after deletions.
    } catch (err) {
      setExpenseCategoryError(err.message || "Unable to delete expense.");
    }
  };

  // Toggle the auth form between login and registration.
  const toggleAuthMode = () => {
    setAuthMode((currentMode) => (currentMode === "login" ? "register" : "login"));
    setAuthError("");
    setConfirmPassword("");
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
      category_id: expense.categoryId || null,
      note: expense.title,
    };

    try {
      const createdExpense = await createExpense(payload);
      setExpenses((prevExpenses) => [mapApiExpenseToUi(createdExpense), ...prevExpenses]);
      await loadBudgetSummary(selectedYear); // Refresh budget summary when expenses change.
    } catch (err) {
      setAuthError(err.message || "Unable to save the expense. Please try again.");
    }
  };

  // Load categories for the authenticated user and surface the need/want designation.
  const loadCategories = useCallback(async () => {
    if (!authUser) {
      return;
    }
    setIsCategoriesLoading(true);
    setCategoriesError("");
    try {
      const items = await fetchCategories();
      setCategories(items);
    } catch (err) {
      setCategoriesError(err.message || "Unable to load categories.");
    } finally {
      setIsCategoriesLoading(false);
    }
  }, [authUser]);

  // Save or update the user's after-tax yearly income for 50/30/20 calculations.
  const handleIncomeSave = async () => {
    if (!authUser) {
      setIncomeError("Please log in to set income.");
      return;
    }
    setIncomeStatus("");
    setIncomeError("");
    setIsSavingIncome(true);
    const incomeValue = Number(incomeInput);
    if (Number.isNaN(incomeValue) || incomeValue <= 0) {
      setIncomeError("Please enter a valid yearly income (dollars).");
      setIsSavingIncome(false);
      return;
    }
    try {
      const response = await setAnnualIncome(incomeValue);
      setIncomeStatus("Income saved for budgeting.");
      setAuthUser((prev) => ({
        ...prev,
        annualIncomeCents: response.income.amountCents,
      }));
      // Refresh budget summary with the new income.
      await loadBudgetSummary(selectedYear);
    } catch (err) {
      setIncomeError(err.message || "Unable to save income.");
    } finally {
      setIsSavingIncome(false);
    }
  };

  // Handle create/update of categories with the need/want flag so the budget summary can split spending.
  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    setCategoriesError("");
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, {
          name: categoryName,
          color: categoryColor,
          budgetType: categoryBudgetType,
        });
      } else {
        await createCategory({
          name: categoryName,
          color: categoryColor,
          budgetType: categoryBudgetType,
        });
      }
      setCategoryName("");
      setCategoryColor(presetCategoryColors[0].value);
      setCategoryBudgetType("need");
      setEditingCategoryId(null);
      await loadCategories();
      // Refresh the budget summary to reflect updated need/want groupings.
      await loadBudgetSummary(selectedYear);
    } catch (err) {
      setCategoriesError(err.message || "Unable to save category.");
    }
  };

  // Load a category into the form for editing so its need/want setting can be changed.
  const startEditingCategory = (category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    // Preselect matching preset; fallback to first preset when no match.
    const match = presetCategoryColors.find((c) => c.value === category.color);
    setCategoryColor(match ? match.value : presetCategoryColors[0].value);
    setCategoryBudgetType(category.budgetType || "need");
  };

  // Delete category from Categories page; expenses auto-null via FK.
  const handleDeleteCategory = async (categoryId) => {
    setCategoryDeleteError("");
    try {
      await deleteCategory(categoryId);
      await loadCategories();
      await fetchAndSetExpenses(); // Refresh expenses in case any lost their category.
    } catch (err) {
      setCategoryDeleteError(err.message || "Unable to delete category.");
    }
  };

  // Update an expense's category inline from the expenses list.
  const handleExpenseCategoryChange = async (expenseId, categoryId) => {
    setExpenseCategoryError("");
    setExpenseCategorySavingId(expenseId);
    try {
      await updateExpense(expenseId, { category_id: categoryId || null });
      await fetchAndSetExpenses();
      await loadBudgetSummary(selectedYear); // Category changes can shift need/want totals.
    } catch (err) {
      setExpenseCategoryError(err.message || "Unable to update expense category.");
    } finally {
      setExpenseCategorySavingId(null);
    }
  };

  // Pull the 50/30/20 budget summary for the selected year.
  const loadBudgetSummary = useCallback(
    async (year) => {
      if (!authUser) {
        return;
      }
      setIsBudgetLoading(true);
      setBudgetError("");
      try {
        const summary = await getBudgetSummary(year);
        setBudgetSummary(summary);
      } catch (err) {
        const message = err.body?.error?.message || err.message || "Unable to load budget summary.";
        setBudgetError(message);
        setBudgetSummary(null);
      } finally {
        setIsBudgetLoading(false);
      }
    },
    [authUser],
  );

  // When the authenticated user changes, load categories and budget summary, and prefill income input.
  useEffect(() => {
    if (!authUser) {
      return;
    }
    if (authUser.annualIncomeCents !== undefined && authUser.annualIncomeCents !== null) {
      setIncomeInput((authUser.annualIncomeCents / 100).toString());
    } else {
      setIncomeInput("");
    }
    loadCategories();
    loadBudgetSummary(selectedYear);
  }, [authUser, loadBudgetSummary, loadCategories, selectedYear]);

  // Format cents into a USD-friendly display.
  const formatCurrency = (cents) => `$${(cents / 100).toFixed(2)}`;

  return (
  <div className={`app-shell ${!authUser ? "auth-page" : ""}`}>
     {/* Replaces the old helper text with a centered project title above the auth card */}
     {!authUser && <div className="app-title">Expense Tracker</div>}
     <section className="auth-panel dark-panel auth-card">
       {authUser ? (
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap"}}>
          <p style={{margin: 0}}>Logged in as {authUser.email}</p>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
       ) : (
        <div>
          {authError && <p>{authError}</p>}
          <form onSubmit={handleAuthSubmit} className="auth-form">
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} required />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} required />
            </div>
            {authMode === "register" && (
              <>
                {/* Place confirm password directly under password for clearer pairing */}
                <div className="form-field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Name</label>
                  <input type="text" value={authName} onChange={(event) => setAuthName(event.target.value)} />
                </div>
              </>
            )}
            <button type="submit" disabled={isAuthLoading}>
              {isAuthLoading ? "Submitting..." : authMode === "login" ? "Login" : "Register"}
            </button>
            {/* Toggle links live under the primary button to replace the old switch control */}
            {authMode === "login" ? (
              <p style={{fontSize: "0.9rem"}}>
                Need an account?{" "}
                <button type="button" onClick={toggleAuthMode} style={{background: "transparent", color: "#93c5fd", border: "none", cursor: "pointer"}}>
                  Register here.
                </button>
              </p>
            ) : (
              <p style={{fontSize: "0.9rem"}}>
                Already have an account?{" "}
                <button type="button" onClick={toggleAuthMode} style={{background: "transparent", color: "#93c5fd", border: "none", cursor: "pointer"}}>
                  Log in here.
                </button>
              </p>
            )}
          </form>
        </div>
       )}
       {isAuthLoading && authUser && <p>Loading account...</p>}
     </section>

     {authUser && (
      // Replaces the old buttons with a polished, centered top navigation that highlights the active view.
      <div className="top-nav" style={{marginTop: "1rem"}}>
        {["expenses", "categories", "budget"].map((view) => (
          <button
            key={view}
            className={activeView === view ? "active" : ""}
            onClick={() => setActiveView(view)}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>
     )}

     {authUser && activeView === "expenses" && (
      <section className="section">
        <h2>Expenses</h2>
        <p>Track transactions and keep the visuals in sync with the budget cards.</p>
        <NewExpense onAddExpense = {addExpenseHandler} categories={categories} />
        {authError && <p>{authError}</p>}
        {expenseCategoryError && <p>{expenseCategoryError}</p>}
        <DisplayExpenses
          expenses_list={expenses}
          isLoading={isExpensesLoading}
          categories={categories}
          onExpenseCategoryChange={handleExpenseCategoryChange}
          savingExpenseId={expenseCategorySavingId}
          onDeleteExpense={handleDeleteExpense}
        />
      </section>
     )}

     {authUser && activeView === "categories" && (
      <section className="section">
        <h2>Categories (Need vs Want)</h2>
        <p>
          Categories marked as <strong>Need</strong> count toward the 50% bucket, and <strong>Want</strong> categories
          count toward the 30% bucket in the 50/30/20 budget.
        </p>
        <form onSubmit={handleCategorySubmit} style={{marginBottom: "1rem", display: "grid", gap: "0.5rem"}}>
          <div>
            <label>Name</label>
            <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
          </div>
          <div>
            <label>Color</label>
            {/* Preset color buttons replace free-form hex input to keep palette consistent */}
            <div className="color-options">
              {presetCategoryColors.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`color-option ${categoryColor === option.value ? "selected" : ""}`}
                  onClick={() => setCategoryColor(option.value)}
                  aria-label={`Select ${option.label} color`}
                >
                  <span className="color-swatch" style={{backgroundColor: option.value}} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <span style={{marginRight: "0.5rem"}}>Budget Type</span>
            <label style={{marginRight: "0.5rem"}}>
              <input
                type="radio"
                name="budgetType"
                value="need"
                checked={categoryBudgetType === "need"}
                onChange={() => setCategoryBudgetType("need")}
              />
              Need
            </label>
            <label>
              <input
                type="radio"
                name="budgetType"
                value="want"
                checked={categoryBudgetType === "want"}
                onChange={() => setCategoryBudgetType("want")}
              />
              Want
            </label>
          </div>
          <div style={{display: "flex", gap: "0.5rem", flexWrap: "wrap"}}>
            <button type="submit">{editingCategoryId ? "Update Category" : "Add Category"}</button>
            {editingCategoryId && (
              <button type="button" onClick={() => setEditingCategoryId(null)}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
          {categoriesError && <p>{categoriesError}</p>}
          {categoryDeleteError && <p>{categoryDeleteError}</p>}
          {isCategoriesLoading && (
            <div className="category-list">
              {[1, 2, 3].map((key) => (
                <div key={key} className="skeleton skeleton-row" />
              ))}
          </div>
        )}
        {!isCategoriesLoading && categories.length === 0 && (
          <div className="empty-state">No categories yet. Add a Need or Want to start budgeting.</div>
        )}
        {!isCategoriesLoading && categories.length > 0 && (
          <div className="category-list">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <div className="category-left">
                  <div
                    className="category-color"
                    style={{backgroundColor: category.color || presetCategoryColors[0].value}}
                    aria-label={`Color swatch for ${category.name}`}
                  />
                  <div>
                    <div style={{fontWeight: 700, color: "#f1f5f9"}}>{category.name}</div>
                    <div style={{fontSize: "0.9rem", color: "#cbd5e1"}}>{category.color || "No color set"}</div>
                  </div>
                  <span className={`category-pill ${category.budgetType === "need" ? "pill-need" : "pill-want"}`}>
                    {category.budgetType === "need" ? "Need" : "Want"}
                  </span>
                  </div>
                  <div className="category-actions">
                    <button onClick={() => startEditingCategory(category)}>Edit</button>
                    <button onClick={() => handleDeleteCategory(category.id)} style={{marginLeft: "0.5rem"}}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>
     )}

     {authUser && activeView === "budget" && (
      <section className="section">
        <h2>50/30/20 Budget</h2>
        <p>This view tracks after-tax yearly income and splits spending into Needs (50%), Wants (30%), and Savings (20%).</p>

        <div style={{marginBottom: "1rem"}}>
          <h3>Income Settings</h3>
          <p>Enter your after-tax yearly income so the backend can compute 50/30/20 budgets.</p>
          <div style={{display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center"}}>
            <input
              type="number"
              min="0"
              step="100"
              value={incomeInput}
              onChange={(e) => setIncomeInput(e.target.value)}
              placeholder="e.g. 75000"
            />
            <button type="button" onClick={handleIncomeSave} disabled={isSavingIncome}>
              {isSavingIncome ? "Saving..." : "Save Income"}
            </button>
          </div>
          {incomeStatus && <p>{incomeStatus}</p>}
          {incomeError && <p>{incomeError}</p>}
        </div>

        <div style={{marginBottom: "1rem"}}>
          <h3>Budget Summary</h3>
          <label>
            Year
            <select
              value={selectedYear}
              onChange={(e) => {
                const yearValue = Number(e.target.value);
                setSelectedYear(yearValue);
                loadBudgetSummary(yearValue);
              }}
              style={{marginLeft: "0.5rem"}}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          {isBudgetLoading && (
            <div className="budget-grid" style={{marginTop: "0.75rem"}}>
              {[1, 2, 3].map((key) => (
                <div key={key} className="skeleton skeleton-card" />
              ))}
            </div>
          )}
          {budgetError && <p>{budgetError}</p>}

          {budgetSummary && !budgetError && (
            <div style={{marginTop: "1rem"}}>
              <p>Income: {formatCurrency(budgetSummary.income.amountCents)}</p>
              <div className="budget-grid">
                {["needs", "wants", "savings"].map((key) => {
                  const bucket = budgetSummary[key];
                  const title = key.charAt(0).toUpperCase() + key.slice(1);
                  return (
                    <div key={key} className="budget-card">
                      <h4>{title}</h4>
                      <p className="budget-figure">Budget: {formatCurrency(bucket.budgetCents)}</p>
                      <p className="budget-figure">Actual: {formatCurrency(bucket.actualCents)}</p>
                      <p className="budget-small">Diff: {formatCurrency(bucket.diffCents)}</p>
                      <p className="budget-small">Budget %: {bucket.budgetPercent}%</p>
                      <p className="budget-small">Actual %: {bucket.actualPercent}%</p>
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap"}}>
                <div className="budget-card" style={{flex: "1 1 220px"}}>
                  <h4>Totals</h4>
                  <p className="budget-figure">Total Expenses: {formatCurrency(budgetSummary.totals.expensesCents)}</p>
                  <p className="budget-figure">Total Savings: {formatCurrency(budgetSummary.totals.savingsCents)}</p>
                </div>
              </div>
            </div>
          )}

          {!isBudgetLoading && !budgetSummary && !budgetError && (
            <div className="empty-state">Set an income to see your 50/30/20 breakdown.</div>
          )}
        </div>
      </section>
     )}
  </div>
 );
};

export default App;
