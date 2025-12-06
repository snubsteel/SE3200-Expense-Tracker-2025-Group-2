import React, { useState } from "react";

import "./ExpenseItem.css";
import ExpenseDate from "./ExpenseDate";
import Card from "../UI/Card";

// gonna learn about states now!

function ExpenseItem(props) {

  // const [title, setTitle] = useState(props.title);

  // const titleChangeHandler = () => {
  //   setTitle("Updated");
  // }
  // Allow inline category editing by toggling a select when the pill is clicked.
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [pendingCategoryId, setPendingCategoryId] = useState(props.categoryId || "");

  const categoryBudgetType = props.category ? props.category.budgetType : null;

  const handleCategoryChange = async (event) => {
    const value = event.target.value;
    setPendingCategoryId(value);
    if (props.onChangeCategory) {
      await props.onChangeCategory(props.id, value || null);
    }
    setIsEditingCategory(false);
  };

  return (
    <Card className="expense-item">
      <ExpenseDate date={props.date} />
      <div className="expense-item__description">
        <h2>{props.title}</h2>
        <div className="expense-item__price">${Number(props.amount).toFixed(2)}</div>
      </div>
      <div className="expense-item__category">
        {!isEditingCategory ? (
          <button
            type="button"
            className={`category-pill ${categoryBudgetType === "want" ? "pill-want" : "pill-need"} category-pill-clickable`}
            style={{backgroundColor: props.category?.color || undefined}}
            onClick={() => setIsEditingCategory(true)}
          >
            {props.category
              ? `${props.category.name} · ${categoryBudgetType ? categoryBudgetType.toUpperCase() : ""}`
              : "No category"}
          </button>
        ) : (
          <select
            value={pendingCategoryId}
            onChange={handleCategoryChange}
            disabled={props.isSavingCategory}
            className="category-select-inline"
          >
            <option value="">No category</option>
            {(props.categories || []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} {cat.budgetType ? `(${cat.budgetType})` : ""}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="expense-item__actions">
        <button
          type="button"
          className="delete-expense-button"
          onClick={() => props.onDeleteExpense?.(props.id)}
          disabled={props.isSavingCategory}
        >
          Delete
        </button>
      </div>
    </Card>
  );
}

export default ExpenseItem;
