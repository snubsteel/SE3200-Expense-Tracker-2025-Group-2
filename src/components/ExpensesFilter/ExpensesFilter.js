import React from 'react';

import './ExpensesFilter.css';

const ExpensesFilter = (props) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({length: 6}, (_, index) => currentYear - index);

  const filterChangeHandler = (event) => {
    props.onFilterChange(event.target.value);
  }

  return (
    <div className='expenses-filter'>
      <div className='expenses-filter__control'>
        <label>Filter by year</label>
        <select value ={props.selected} onChange={filterChangeHandler}>
          {yearOptions.map((year) => (
            <option key={year} value={year.toString()}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ExpensesFilter;
