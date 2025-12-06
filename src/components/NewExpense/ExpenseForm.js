import React, {useState} from "react";

import "./ExpenseForm.css";

const ExpenseForm = (props) => {
    const [enteredTitle, setEnteredTitle] = useState('');
    const [enteredAmount, setEnteredAmount] = useState('');
    const [enteredDate, setEnteredDate] = useState('');
    // Capture selected category (id or empty for none) so expenses can be associated inline.
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const currentYear = new Date().getFullYear();
    const maxDate = `${currentYear + 1}-12-31`;

    // const [userInput, setUserInput] = useState({
    //     enteredTitle: '',
    //     enteredAmount: '',
    //     enteredDate: ''
    // });

    const titleChangeHandler = (event) => {
        setEnteredTitle(event.target.value);
        // setUserInput({
        //     ...userInput,
        //     enteredTitle: event.target.value,
        // });
    };

    const amountChangeHandler = event => {
        setEnteredAmount(event.target.value);
        //  setUserInput({
        //     ...userInput,
        //     enteredAmount: event.target.value,
        // });

        // setUserInput((prevState) => {
        //     return {...prevState, enteredTitle: event.target.value};
        // });
    };

    const dateChangeHandler = event => {
        setEnteredDate(event.target.value);
        //  setUserInput({
        //     ...userInput,
        //     enteredDate: event.target.value,
        // });
    };

    const submitHandler = (event) => {
        event.preventDefault();
        const expenseData ={
            title: enteredTitle,
            amount: +enteredAmount,
            date: new Date(enteredDate),
            categoryId: selectedCategoryId || null,
        };
        console.log(expenseData);
        props.onSaveExpenseData(expenseData);
        props.visibility(false);
        setEnteredAmount('');
        setEnteredDate('');
        setEnteredTitle('');
        setSelectedCategoryId('');

    };

    const cancelNewFormButtonHandler = () => {
        props.visibility(false);
        setEnteredAmount('');
        setEnteredDate('');
        setEnteredTitle('');
        setSelectedCategoryId('');
        
    };

    return <form onSubmit={submitHandler}>
        <div className="new-expense__controls">
            <div className="new-expense__control">
                <label>Title</label>
                <input type='text' value={enteredTitle} onChange={titleChangeHandler}/>
            </div>
            <div className="new-expense__control">
                <label>Amount</label>
                <input type='number' min="0.01" step="0.01" value={enteredAmount} onChange={amountChangeHandler}/>
            </div>
            <div className="new-expense__control">
                <label>Date</label>
                <input type='date' min="2019-01-01" max={maxDate} value={enteredDate} onChange={dateChangeHandler}/>
            </div>
            <div className="new-expense__control">
                <label>Category</label>
                <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
                    <option value=''>No category</option>
                    {(props.categories || []).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
        <div className="new-expense__actions">
            <button onClick={cancelNewFormButtonHandler}>Cancel</button>
            <button type="submit">Add Expense</button>
        </div>
    </form>
};

export default ExpenseForm;
