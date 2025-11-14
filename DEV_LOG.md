# Development Log — November 7, 2025

**Developer:** Seth Pederson

---

## Work Completed

- Verified PostgreSQL installation and configuration on local machine.
- Created database `tracker_db` and executed schema from `database/setup_db.sql`.
- Set up backend project structure under `/server` with Express, PostgreSQL pool, and environment-based configuration.
- Implemented and tested `/health` endpoint to confirm backend–DB connectivity.
- Integrated authentication system:
  - Added `/api/auth/register`, `/api/auth/login`, and `/api/auth/me`.
  - Implemented `bcrypt` password hashing and `jsonwebtoken` JWT handling.
  - Added `authRequired` middleware for protected routes.
  - Added Zod validation for request payloads.
  - Successfully tested user registration, login, and token-based authentication using PowerShell `Invoke-RestMethod`.
- Updated `.env`, `.gitignore`, and project folder structure for clean separation between backend and frontend.
- Added explanatory comments across core backend files (`index.js`, `db.js`, `error.js`, and new auth modules).

---

## Key Learnings / Notes

- `psql` command required adding PostgreSQL `bin` path to environment variables.
- Learned how JWT-based authentication and middleware chaining work in Express.
- Confirmed `BCRYPT_SALT_ROUNDS=12` gives balanced performance for hashing.

---

## Next Steps

1. Implement routes:
   - `/api/categories` → CRUD endpoints with validation.
   - `/api/expenses` → CRUD + filtering by date/category.
2. Add Zod validators for categories and expenses payloads.
3. Add rate-limiting for write endpoints (POST/PATCH/DELETE).
4. Test CRUD operations with PowerShell curl commands.
5. Prepare `/api/summary` route for expense totals by date and category.

---

# 2025-11-14 — Backend + Frontend Integration Completed

## Work Completed

- Finished full backend implementation: Express server, PostgreSQL pool, route structure, validation, and error handling.
- Added authentication flow (register, login, JWT handling, `/auth/me`) with bcrypt hashing and Joi validation.
- Added expenses API: create expense, list expenses (scoped to logged-in user), validation, and route protection with `authRequired`.
- Improved server security with `helmet`, `cors`, and rate-limiting; resolved rate-limit proxy warnings.
- Connected frontend to backend through new `src/api/client.js` with token storage and request helpers.
- Replaced dummy React state with live API data.
- Added logout support and token-based session restore on refresh.
- Updated year-filter logic and fixed dropdown behavior issues.
- Added frontend error handling for invalid passwords and registration problems.
- Added feedback messages surfacing backend validation errors.
- Verified persistent expense storage in PostgreSQL; tested with multiple accounts.

## Testing Done

- Ran backend `/health` check.
- Registered multiple accounts and confirmed validation behavior.
- Logged in/out and confirmed token persistence and clearing.
- Added expenses with various dates and verified DB entries.
- Reloaded pages to confirm auto-login and persistent expense display.
- Checked DB tables using pgAdmin and psql.

## Next Steps

- Begin Milestone 3 planning.