import ExpenseItem from "./ExpenseItem";
import "./DisplayExpenses.css";
import Card from "../UI/Card";

function DisplayExpenses(props) {
  return (
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
  );
}

export default DisplayExpenses;
