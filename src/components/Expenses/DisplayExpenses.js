import React, {useState} from "react";
import ExpenseItem from "./ExpenseItem";
import "./DisplayExpenses.css";
import Card from "../UI/Card";
import ExpensesFilter from "../ExpenseFilter/ExpensesFilter";

function DisplayExpenses(props) {

  const [changedFilter, setChangedFilter] = useState(2020);

  const filterChangeHandler = year => {
    setChangedFilter(year);
  }

  return (
    <div>

      <ExpensesFilter onFilterChange={filterChangeHandler}/>

      <Card className="expenses">
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
