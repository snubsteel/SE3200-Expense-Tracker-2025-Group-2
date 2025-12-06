import { Router } from 'express';

import pool from '../db.js';
import { incomeSchema, summaryQuerySchema } from '../validators/budgetSchemas.js';

const router = Router();

// Manual test flow (Postman/curl):
// 1) PUT /api/budget/income with { "annualIncome": 75000 } using an authenticated token to store income.
// 2) POST /api/categories with { "name": "Rent", "color": "#FFAA00", "budget_type": "need" } and another for a "want".
// 3) POST /api/expenses linking each category to create need vs want spending.
// 4) GET /api/budget/summary?year=2025 to verify needs/wants totals and savings align with the 50/30/20 split.

const mapValidationErrors = (issues) =>
  issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

const centsToDollars = (value) => Number((value / 100).toFixed(2));

const buildBucket = (incomeCents, budgetCents, actualCents) => {
  const diff = actualCents - budgetCents;
  const denominator = incomeCents === 0 ? 1 : incomeCents;

  return {
    budgetCents,
    actualCents,
    diffCents: diff,
    budgetPercent: Number(((budgetCents / denominator) * 100).toFixed(2)),
    actualPercent: Number(((actualCents / denominator) * 100).toFixed(2)),
  };
};

// PUT /api/budget/income - store after-tax yearly income for the current user.
router.put('/income', async (req, res, next) => {
  const parsed = incomeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Income payload is invalid.',
        details: mapValidationErrors(parsed.error.issues),
      },
    });
  }

  const annualIncomeCents = Math.round(parsed.data.annualIncome * 100);

  try {
    const updateResult = await pool.query(
      `UPDATE users
       SET annual_income_cents = $1
       WHERE id = $2
       RETURNING annual_income_cents`,
      [annualIncomeCents, req.auth.userId],
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({
        error: {
          code: 'user_not_found',
          message: 'User record could not be located.',
        },
      });
    }

    return res.status(200).json({
      income: {
        amountCents: updateResult.rows[0].annual_income_cents,
        amountDollars: centsToDollars(updateResult.rows[0].annual_income_cents),
      },
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/budget/summary?year=2025 - compute 50/30/20 budget versus actuals for the selected year.
router.get('/summary', async (req, res, next) => {
  const parsed = summaryQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Summary query params are invalid.',
        details: mapValidationErrors(parsed.error.issues),
      },
    });
  }

  const year = parsed.data.year ?? new Date().getFullYear();

  try {
    const userResult = await pool.query('SELECT annual_income_cents FROM users WHERE id = $1', [req.auth.userId]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        error: {
          code: 'user_not_found',
          message: 'User record could not be located.',
        },
      });
    }

    const incomeCents = userResult.rows[0].annual_income_cents;

    if (incomeCents === null || incomeCents === undefined) {
      return res.status(400).json({
        error: {
          code: 'income_missing',
          message: 'Annual income has not been set for this user.',
        },
      });
    }

    const needsBudget = Math.round(incomeCents * 0.5);
    const wantsBudget = Math.round(incomeCents * 0.3);
    const savingsBudget = incomeCents - needsBudget - wantsBudget;

    const spendingResult = await pool.query(
      `SELECT c.budget_type, COALESCE(SUM(e.amount_cents), 0) AS total_cents
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id AND c.user_id = $1
       WHERE e.user_id = $1
         AND EXTRACT(YEAR FROM e.occurred_on) = $2
         AND c.budget_type IN ('need', 'want')
       GROUP BY c.budget_type`,
      [req.auth.userId, year],
    );

    let needsActual = 0;
    let wantsActual = 0;

    for (const row of spendingResult.rows) {
      if (row.budget_type === 'need') {
        needsActual = Number(row.total_cents);
      } else if (row.budget_type === 'want') {
        wantsActual = Number(row.total_cents);
      }
    }

    const expensesTotal = needsActual + wantsActual;
    const savingsActual = incomeCents - expensesTotal;

    const needs = buildBucket(incomeCents, needsBudget, needsActual);
    const wants = buildBucket(incomeCents, wantsBudget, wantsActual);
    const savings = buildBucket(incomeCents, savingsBudget, savingsActual);

    return res.status(200).json({
      income: {
        amountCents: incomeCents,
        amountDollars: centsToDollars(incomeCents),
      },
      year,
      needs,
      wants,
      savings,
      totals: {
        expensesCents: expensesTotal,
        savingsCents: savingsActual,
      },
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
