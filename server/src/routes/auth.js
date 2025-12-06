import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import pool from '../db.js';
import { authRequired } from '../middleware/authRequired.js';
import { loginSchema, registerSchema } from '../validators/authSchemas.js';

const router = Router();

// Allow tuning bcrypt cost in env while defaulting to a safe 12 round hash.
const configuredRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
const SALT_ROUNDS = Number.isInteger(configuredRounds) && configuredRounds >= 10 && configuredRounds <= 12 ? configuredRounds : 12;
const TOKEN_EXPIRY = '2h';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined before initializing auth routes.');
}

const JWT_SECRET = process.env.JWT_SECRET;

// Convert Zod issues to a light-weight array for the API error payload.
const mapValidationErrors = (issues) =>
  issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

// Handle user registration by validating input, hashing passwords, and storing the new record.
router.post('/register', async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Registration payload is invalid.',
        details: mapValidationErrors(parsed.error.issues),
      },
    });
  }

  const { email, password, name } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const insertResult = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email, passwordHash, name ?? null],
    );

    const user = insertResult.rows[0];

    return res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: {
          code: 'conflict',
          message: 'Email is already registered.',
        },
      });
    }

    return next(err);
  }
});

// Authenticate a user by confirming credentials and minting a short-lived JWT.
router.post('/login', async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Login payload is invalid.',
        details: mapValidationErrors(parsed.error.issues),
      },
    });
  }

  const { email, password } = parsed.data;

  try {
    const userResult = await pool.query('SELECT id, email, password_hash, name FROM users WHERE email = $1', [email]);

    if (userResult.rowCount === 0) {
      return res.status(401).json({
        error: {
          code: 'invalid_credentials',
          message: 'Email or password is incorrect.',
        },
      });
    }

    const user = userResult.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        error: {
          code: 'invalid_credentials',
          message: 'Email or password is incorrect.',
        },
      });
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    return res.status(200).json({ token });
  } catch (err) {
    return next(err);
  }
});

// Verify the current token and surface the associated profile info to the caller.
router.get('/me', authRequired, async (req, res, next) => {
  try {
    const userResult = await pool.query(
      'SELECT id, email, name, created_at, annual_income_cents FROM users WHERE id = $1',
      [req.auth.userId],
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        error: {
          code: 'user_not_found',
          message: 'User record could not be located.',
        },
      });
    }

    const user = userResult.rows[0];

    return res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      annualIncomeCents: user.annual_income_cents ?? null,
      createdAt: user.created_at,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
