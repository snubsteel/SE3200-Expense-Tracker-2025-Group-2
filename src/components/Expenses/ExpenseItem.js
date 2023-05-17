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

  return (
    <Card className="expense-item">
      <ExpenseDate date={props.date} />
      <div className="expense-item__description">
        <h2>{props.title}</h2>
        <div className="expense-item__price">${props.amount}</div>
      </div>
      <br></br>
    </Card>
  );
}

export default ExpenseItem;
