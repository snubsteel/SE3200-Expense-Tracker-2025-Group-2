# Expense Tracker

![Screenshot 2023-05-17 at 7 14 42 PM](https://github.com/ReeveFernandes/Expense-Tracker/assets/92554845/552e0672-02b5-4464-87ba-7ec7755757b9)


Welcome to Expense Tracker, a web application built with React.js that helps you keep track of your expenses. This expense tracker provides a simple and intuitive interface for managing your financial transactions and monitoring your spending habits.

## Features

- **Expense Categories:** Categorize your expenses for better organization and analysis.
- **Add and Delete Expenses:** Easily add new expenses.
- **Transaction History:** View a list of all your transactions along with the date.
- **Filter and Search:** Filter expenses by category and search for specific transactions.
- **Expense Summary:** Get a quick overview of your total income and expenses.
- **Responsive Design:** Enjoy a seamless experience across different devices and screen sizes.

## Live Demo

You can access the live demo of the Expense Tracker by clicking [here](https://my-expense-tracker.onrender.com/).

## Getting Started

To run the application locally and explore its codebase, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/ReeveFernandes/Expense-Tracker.git
```

2. Navigate to the project directory:

```bash
cd Expense-Tracker
```

3. Install the dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm start
```

5. Open your browser and visit [http://localhost:3000](http://localhost:3000) to see the application in action.

## Technologies Used

- React: [^17.0.2](https://reactjs.org/)

## Acknowledgements

- The Expense Tracker project is based on the React - The Complete Guide (incl Hooks, React Router, Redux) course by Academind by Maximilian Schwarzmüller on Udemy.

Enjoy tracking your expenses with Expense Tracker!

---

Quick Setup Guide for Running the Project Locally

1. Install the Required Tools

Node.js (version 18 or newer)

PostgreSQL

pgAdmin (optional)

2. Clone the Repo
git clone https://github.com/snubsteel/SE3200-Expense-Tracker-2025-Group-2
cd SE3200-Expense-Tracker-2025-Group-2

3. Set Up the Database
Option A — Using psql
psql -U postgres
CREATE DATABASE tracker_db;
\c tracker_db
\i database/setup_db.sql;

Option B — Using pgAdmin

Open pgAdmin

Create a database named tracker_db

Open database/setup_db.sql and run it

4. Create Your Backend .env File

Inside the server folder, create a file named .env:

DATABASE_URL=postgres://postgres:pass@localhost:5432/tracker_db
JWT_SECRET=dev_secret_123
PORT=4000
BCRYPT_SALT_ROUNDS=12

If your Postgres password isn’t pass, change it.

5. Install Dependencies
Frontend:
npm install

Backend:
cd server
npm install

6. Start the Servers

Backend:
cd server
npm run dev
Runs on: http://localhost:4000

Frontend:
Open a second terminal:
npm start
Runs on: http://localhost:3000

How to Test the App
1. Register

Click "Switch to Register"

Enter name, email, and a password (8+ characters)

2. Log In

Use the account you just created

After login, the app should load your expenses

3. Add an Expense

Click "Add New Expense"

Enter a title, amount, and date

It should appear immediately and also be saved to the database

4. Refresh the Page

You should still be logged in

All your expenses should re-load automatically

5. Logout

Click the Logout button

Expenses clear and login form returns