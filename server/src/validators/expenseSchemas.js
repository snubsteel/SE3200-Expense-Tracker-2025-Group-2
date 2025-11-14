import { z } from 'zod';

// Schema normalizes incoming expense payloads before they reach the database layer.
export const createExpenseSchema = z.object({

  // Amount is captured in cents to avoid floating point issues and must be a positive integer.
  amount_cents: z
    .number({ required_error: 'amount_cents is required.' })
    .int()
    .gt(0, { message: 'amount_cents must be greater than 0.' }),

  // Currency codes follow ISO-4217 style three-letter identifiers and are uppercased for consistency.
  currency: z
    .string({ required_error: 'currency is required.' })
    .trim()
    .length(3, { message: 'currency must be a 3-letter code.' })
    .refine((value) => /^[A-Za-z]+$/.test(value), { message: 'currency must contain letters only.' })
    .transform((value) => value.toUpperCase()),

  // occurred_on tracks the calendar date the expense happened using a YYYY-MM-DD string.
  occurred_on: z
    .string({ required_error: 'occurred_on is required.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'occurred_on must be in YYYY-MM-DD format.' }),

  // Optional category_id lets clients associate expenses to categories when provided and validates UUID format.
  category_id: z
    .string()
    .uuid({ message: 'category_id must be a valid UUID.' })
    .optional()
    .nullable(),
    
  // Optional note captures extra context and is limited to 255 characters to match the database column.
  note: z
    .string()
    .trim()
    .max(255, { message: 'note must be 255 characters or fewer.' })
    .optional()
    .nullable(),
});
