import React, {useState} from "react";
import ExpenseItem from "./ExpenseItem";
import "./DisplayExpenses.css";
import Card from "../UI/Card";
import ExpensesFilter from "../ExpensesFilter/ExpensesFilter";

function DisplayExpenses(props) {

  const [filterYear, setFilteredYear] = useState('2020');

  const filterChangeHandler = year => {
    setFilteredYear(year);  
    // console.log("Year");
    // console.log(year);
  }

  return (
    <div>

      <Card className="expenses">

        <ExpensesFilter selected={filterYear} onFilterChange={filterChangeHandler}/>

        <ExpenseItem
          title={props.expenses_list[0].title}
          amount={props.expenses_list[0].amount}
          date={props.expenses_list[0].date}
        />
        <ExpenseItem
          title={props.expenses_list[1].title}
          amount={props.expenses_list[1].amount}
          date={props.expenses_list[1].date}
        />
        <ExpenseItem
          title={props.expenses_list[2].title}
          amount={props.expenses_list[2].amount}
          date={props.expenses_list[2].date}
        />
        <ExpenseItem
          title={props.expenses_list[3].title}
          amount={props.expenses_list[3].amount}
          date={props.expenses_list[3].date}
        />
      </Card>
    </div>
  );
}

export default DisplayExpenses;
