import React, {useMemo, useState} from "react";
import ExpenseItem from "./ExpenseItem";
import "./DisplayExpenses.css";
import Card from "../UI/Card";
import ExpensesFilter from "../ExpensesFilter/ExpensesFilter";
import ExpensesChart from "./ExpensesChart";

function DisplayExpenses(props) {
  // Default the filter to the current year to keep the list relevant on first load.
  const [filterYear, setFilteredYear] = useState(new Date().getFullYear().toString());

  const filterChangeHandler = year => {
    setFilteredYear(year);  
    // console.log("Year");
    // console.log(year);
  }

  const filteredExpenses = props.expenses_list.filter(
    (expense) => expense.date.getFullYear().toString() === filterYear,
  );
  const categoriesById = useMemo(() => {
    const map = new Map();
    (props.categories || []).forEach((cat) => {
      map.set(cat.id, cat);
    });
    return map;
  }, [props.categories]);

  return (
    <div>

      <Card className="expenses">

        <ExpensesFilter selected={filterYear} onFilterChange={filterChangeHandler}/>

        <ExpensesChart expenses={filteredExpenses} />

        {/* Show lightweight skeletons while expenses load */}
        {props.isLoading && (
          <div className="expenses-skeletons">
            {[1, 2, 3].map((key) => (
              <div key={key} className="skeleton skeleton-row" />
            ))}
          </div>
        )}

        {/* Friendly empty state when there are no expenses for the filtered year */}
        {!props.isLoading && filteredExpenses.length === 0 && (
          <p className="empty-state">No expenses found for {filterYear}. Try adding one or pick a different year.</p>
        )}
        
        {
          !props.isLoading &&
          filteredExpenses.length > 0 && 
          (filteredExpenses.map((i) => (
          <ExpenseItem
            key={i.id}
            id={i.id}
            title={i.title}
            amount={i.amount}
            date={i.date}
            // Surface category context so expenses clearly show how they roll into 50/30/20 buckets.
            category={categoriesById.get(i.categoryId)}
            categoryId={i.categoryId}
            categories={props.categories || []}
            onChangeCategory={props.onExpenseCategoryChange}
            isSavingCategory={props.savingExpenseId === i.id}
            onDeleteExpense={props.onDeleteExpense}
          /> 
        ))
        )}


      </Card>
    </div>
  );
}

export default DisplayExpenses;
