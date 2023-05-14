import DisplayExpenses from "./components/Expenses/DisplayExpenses";

import NewExpense from "./components/NewExpense/NewExpense";


const App = () => {

  const expenses = [
    {
      id: "e1",
      title: "Toilet Paper",
      amount: 94.12,
      date: new Date(2020, 7, 14),
    },
    {
      id: "e2",
      title: "New TV",
      amount: 799.49,
      date: new Date(2021, 6, 9),
    },
    {
      id: "e3",
      title: "Car Insurance",
      amount: 294.67,
      date: new Date(2020, 9, 29),
    },
    {
      id: "e4",
      title: "New Desk (wooden)",
      amount: 450,
      date: new Date(2020, 2, 12),
    },
  ];

  const addExpenseHandler = expense => {
    console.log('In App.js');
    console.log(expense);
  }

  return (
  <div>
     <NewExpense onAddExpense = {addExpenseHandler} />
     <DisplayExpenses expenses_list={expenses} />
  
  </div>
 );
};

export default App;
