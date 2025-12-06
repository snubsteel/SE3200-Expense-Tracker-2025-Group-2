# Expense Tracker

![Screenshot 2023-05-17 at 7 14 42 PM](https://github.com/ReeveFernandes/Expense-Tracker/assets/92554845/552e0672-02b5-4464-87ba-7ec7755757b9)

Expense Tracker is a React + Express + PostgreSQL web app that helps you manage expenses, categorize spending, and stay aligned with budgeting goals (including the 50/30/20 model).

## Features

- Expense categories and history with filtering
- Add/delete expenses with persistent storage
- Income/expense summary and responsive UI
- Backend authentication and JWT-protected APIs
- Budgeting module using 50/30/20 (Needs/Wants/Savings) with variance highlights

## Deployed App

- Railway: https://se3200-expense-tracker.up.railway.app/

## Run Locally (Full Stack)

**Prerequisites:** Node.js 18+, PostgreSQL, npm.

1. Clone and install

```bash
git clone https://github.com/snubsteel/SE3200-Expense-Tracker-2025-Group-2.git
cd SE3200-Expense-Tracker-2025-Group-2
npm install               # frontend
cd server && npm install  # backend
```

2. Set up the database (psql example)

```bash
psql -U postgres
CREATE DATABASE tracker_db;
\c tracker_db
\i database/setup_db.sql;
```

Adjust the user/password/host if your Postgres config differs.

3. Configure backend env  
   Create `server/.env` (copy from `.env.example` to start):

```
DATABASE_URL=postgres://user:pass@localhost:5432/tracker_db
PORT=4000
JWT_SECRET=changeme
NODE_ENV=development
BCRYPT_SALT_ROUNDS=12
```

4. Run the servers

- Backend (terminal 1):
  ```bash
  cd server
  npm run dev   # http://localhost:4000
  ```
- Frontend (terminal 2 from project root):
  ```bash
  npm start     # http://localhost:3000
  ```
  The React dev server proxies API calls to `http://localhost:4000`.

## Technologies Used

- React 18
- Express / Node.js
- PostgreSQL
- JWT, bcrypt, helmet, cors
