import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Email must be valid.' })
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters.' })
  .max(72, { message: 'Password must be 72 characters or fewer.' });

const nameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Name cannot be empty.' })
  .max(50, { message: 'Name must be 50 characters or fewer.' })
  .optional();

// Registration payload validation keeps emails normalized and enforces password rules upfront.
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

// Login payload mirrors registration but only needs email/password.
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
