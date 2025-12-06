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

// PUT /api/expenses/:id - allow updating category assignment inline from the UI.
router.put('/:id', async (req, res, next) => {
  const expenseId = req.params.id;
  // Basic UUID validation to avoid malformed ids reaching the database.
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(expenseId)) {
    return res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Expense id must be a valid UUID.',
      },
    });
  }

  const { category_id } = req.body;

  // Ensure category_id is either null or a valid UUID; other fields remain unchanged.
  if (
    category_id !== null &&
    category_id !== undefined &&
    !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(category_id)
  ) {
    return res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'category_id must be a valid UUID or null.',
      },
    });
  }

  try {
    const result = await pool.query(
      `UPDATE expenses
       SET category_id = $1, updated_at = now()
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id, category_id, amount_cents, currency, occurred_on, note, created_at, updated_at`,
      [category_id ?? null, expenseId, req.auth.userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Expense not found.',
        },
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/expenses/:id - allow users to remove expenses from their list.
router.delete('/:id', async (req, res, next) => {
  const expenseId = req.params.id;

  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(expenseId)) {
    return res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Expense id must be a valid UUID.',
      },
    });
  }

  try {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [
      expenseId,
      req.auth.userId,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Expense not found.',
        },
      });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;
