import { Router } from 'express';

import pool from '../db.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categorySchemas.js';

const router = Router();

const mapValidationErrors = (issues) =>
  issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

// GET /api/categories - return categories for the authenticated user with budget types.
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, name, color, budget_type, created_at
       FROM categories
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.auth.userId],
    );

    return res.status(200).json({ items: result.rows });
  } catch (err) {
    return next(err);
  }
});

// POST /api/categories - create a category and capture its need/want flag.
router.post('/', async (req, res, next) => {
  const parsed = createCategorySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Category payload is invalid.',
        details: mapValidationErrors(parsed.error.issues),
      },
    });
  }

  const { name, color, budget_type } = parsed.data;

  try {
    const insertResult = await pool.query(
      `INSERT INTO categories (user_id, name, color, budget_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, name, color, budget_type, created_at`,
      [req.auth.userId, name, color ?? null, budget_type],
    );

    return res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: {
          code: 'conflict',
          message: 'A category with this name already exists.',
        },
      });
    }

    return next(err);
  }
});

// PUT /api/categories/:id - update category attributes including need/want flag.
router.put('/:id', async (req, res, next) => {
  const categoryId = req.params.id;

  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(categoryId)) {
    return res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Category id must be a valid UUID.',
      },
    });
  }

  const parsed = updateCategorySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Category payload is invalid.',
        details: mapValidationErrors(parsed.error.issues),
      },
    });
  }

  const updates = [];
  const values = [];
  let idx = 1;

  if (parsed.data.name !== undefined) {
    updates.push(`name = $${idx++}`);
    values.push(parsed.data.name);
  }

  if (parsed.data.color !== undefined) {
    updates.push(`color = $${idx++}`);
    values.push(parsed.data.color);
  }

  if (parsed.data.budget_type !== undefined) {
    updates.push(`budget_type = $${idx++}`);
    values.push(parsed.data.budget_type);
  }

  values.push(categoryId);
  values.push(req.auth.userId);

  const updateSql = `
    UPDATE categories
    SET ${updates.join(', ')}
    WHERE id = $${idx++} AND user_id = $${idx}
    RETURNING id, user_id, name, color, budget_type, created_at
  `;

  try {
    const updateResult = await pool.query(updateSql, values);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Category not found.',
        },
      });
    }

    return res.status(200).json(updateResult.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: {
          code: 'conflict',
          message: 'A category with this name already exists.',
        },
      });
    }

    return next(err);
  }
});

// DELETE /api/categories/:id - remove a category; expenses fall back to null via FK ON DELETE SET NULL.
router.delete('/:id', async (req, res, next) => {
  const categoryId = req.params.id;

  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(categoryId)) {
    return res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Category id must be a valid UUID.',
      },
    });
  }

  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [categoryId, req.auth.userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Category not found.',
        },
      });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;
