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
