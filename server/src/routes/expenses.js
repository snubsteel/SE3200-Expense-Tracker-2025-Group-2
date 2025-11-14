import { Router } from 'express';

import pool from '../db.js';
import { createExpenseSchema } from '../validators/expenseSchemas.js';

const router = Router();

// Convert detailed Zod issues to a compact array suitable for API error responses.
const mapValidationErrors = (issues) =>
  issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

// GET /api/expenses - fetch every expense for the authenticated user ordered by recency.
router.get('/', async (req, res, next) => {
  try {
    const expensesResult = await pool.query(
      `SELECT id, user_id, category_id, amount_cents, currency, occurred_on, note, created_at, updated_at
       FROM expenses
       WHERE user_id = $1
       ORDER BY occurred_on DESC, created_at DESC`,
      [req.auth.userId],
    );

    return res.status(200).json({ items: expensesResult.rows });
  } catch (err) {
    return next(err);
  }
});

// POST /api/expenses - validate the payload, store the new expense, and return the created record.
router.post('/', async (req, res, next) => {
  const parsed = createExpenseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Expense payload is invalid.',
        details: mapValidationErrors(parsed.error.issues),
      },
    });
  }

  const { amount_cents, currency, occurred_on, category_id, note } = parsed.data;

  try {
    const insertResult = await pool.query(
      `INSERT INTO expenses (user_id, category_id, amount_cents, currency, occurred_on, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, category_id, amount_cents, currency, occurred_on, note, created_at, updated_at`,
      [req.auth.userId, category_id ?? null, amount_cents, currency, occurred_on, note ?? null],
    );

    return res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    return next(err);
  }
});

export default router;
