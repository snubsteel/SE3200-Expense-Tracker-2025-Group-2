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

# Expense Tracker — Local Development Guide

This project is a full-stack expense tracker built with React, Express, and PostgreSQL.  
Users can register, log in, add expenses, and see their data persist.

---

## Features

- Register and log in with secure password hashing.
- JWT-based authentication with automatic session restore.
- Add expenses with date, and amount.
- Data saved to PostgreSQL.
- Filter expenses by year.
- Logout and clear session.
- Fully connected backend + frontend.

---

## Project Structure

/
├── server/ # Express backend
│ ├── src/
│ │ ├── routes/
│ │ ├── middleware/
│ │ ├── validators/
│ │ └── db.js
│ └── package.json
│
├── src/ # React frontend
│ ├── api/
│ ├── components/
│ └── App.js
│
├── database/
│ └── setup_db.sql # Creates DB + tables
│
├── README.md
└── DEV_LOG.md

---

## Getting Started (Local Setup)

Follow these steps to run both the frontend and backend locally.

---

### 1. Install Required Software

- Node.js (v18+)
- PostgreSQL 14+
- pgAdmin4 (optional)

---

### 2. Create the Database

**Using psql:**

```sh
psql -U postgres
CREATE DATABASE tracker_db;
\c tracker_db
\i database/setup_db.sql;
Or with pgAdmin:

Create database → name it tracker_db

Run setup_db.sql to create tables

3. Configure Environment Variables
Inside /server, create a .env file:

DATABASE_URL=postgres://postgres:pass@localhost:5432/tracker_db
JWT_SECRET=dev_secret_123
PORT=4000
Update the password

4. Install Dependencies
Frontend (root):
npm install
Backend:
cd server
npm install

5. Start the Backend
cd server
npm run dev
Backend runs at:
http://localhost:4000
Expected console output:
API listening on port 4000 (development)

6. Start the Frontend
In the project root:
npm start
Frontend runs at:
http://localhost:3000

Testing the Application

Register
Open app → Register
Enter email, password (8+ chars), and name
Expect:
Success message
Auto-login
No errors

Login
Use an existing account
Expect:
Successful login
Session persists after refresh
Data loads from DB

Add an Expense
Check DB:
SELECT * FROM expenses ORDER BY created_at DESC;
Expense should appear

Refresh browser → expense still displays

Logout
Click Logout

All expense data clears

Token removed from localStorage

Redirected to login screen

Technologies Used
Frontend: React

Backend: Express (Node.js)

Database: PostgreSQL

Auth: JWT + bcrypt

Validation: Joi

Security: helmet, cors, rate-limiting