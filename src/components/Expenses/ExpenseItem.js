import React, { useState } from "react";

import "./ExpenseItem.css";
import ExpenseDate from "./ExpenseDate";
import Card from "../UI/Card";

// gonna learn about states now!

function ExpenseItem(props) {
  const [title, setTitle] = useState(props.title); // these are hooks

  const clickHandler = () => {
    setTitle("Updated!!");
    //console.log("Clicked!!!");
  };

  return (
    <Card className="expense-item">
      <ExpenseDate date={props.date} />
      <div className="expense-item__description">
        <h2>{title}</h2>
        <div className="expense-item__price">${props.amount}</div>
      </div>
      <button onClick={clickHandler}>Change Title</button>
      <br></br>
    </Card>
  );
}

export default ExpenseItem;
