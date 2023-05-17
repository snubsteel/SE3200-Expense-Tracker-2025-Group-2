import React, {useState} from "react";
import ExpenseForm from "./ExpenseForm";
import "./NewExpense.css";

const NewExpense = (props) => {

  const saveExpenseDataHandler = (enteredExpenseData) => {
    const expenseData ={
      ...enteredExpenseData,
      id: Math.random().toString()
    }

    props.onAddExpense(expenseData);
  }

  const [vis, setVis] = useState(false);

  const AddNewExpenseButtonHandler = () => {
    setVis(true);
  };

  return (
    <div className="new-expense">

        {!vis && (<button onClick={AddNewExpenseButtonHandler}>Add New Expense</button>)}
        
        {vis && <ExpenseForm visibility={setVis} onSaveExpenseData={saveExpenseDataHandler} />}
        
    </div>
  );
};

export default NewExpense;

