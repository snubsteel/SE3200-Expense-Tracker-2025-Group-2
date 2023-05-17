import React, {useState} from "react";
import ExpenseItem from "./ExpenseItem";
import "./DisplayExpenses.css";
import Card from "../UI/Card";
import ExpensesFilter from "../ExpensesFilter/ExpensesFilter";
import ExpensesChart from "./ExpensesChart";

function DisplayExpenses(props) {

  const [filterYear, setFilteredYear] = useState('2020');

  const filterChangeHandler = year => {
    setFilteredYear(year);  
    // console.log("Year");
    // console.log(year);
  }

  const filteredExpenses = props.expenses_list.filter(expense => expense.date.getFullYear().toString() == filterYear);

  return (
    <div>

      <Card className="expenses">

        <ExpensesFilter selected={filterYear} onFilterChange={filterChangeHandler}/>

        <ExpensesChart expenses={filteredExpenses} />

        {filteredExpenses.length === 0 && (<p>Mo expenses found.</p>)}
        
        {
          filteredExpenses.length > 0 && 
          (filteredExpenses.map((i) => (
          <ExpenseItem
            key={i.id}
            title={i.title}
            amount={i.amount}
            date={i.date}
          /> 
        ))
        )}


      </Card>
    </div>
  );
}

export default DisplayExpenses;
