import { z } from 'zod';

// Incoming income is provided in dollars; we store cents.
export const incomeSchema = z.object({
  annualIncome: z
    .number({ required_error: 'annualIncome is required.' })
    .finite({ message: 'annualIncome must be a finite number.' })
    .positive({ message: 'annualIncome must be greater than 0.' }),
});

// Year can be omitted (defaults to current year) or supplied as a 4-digit string/number.
export const summaryQuerySchema = z.object({
  year: z
    .union([
      z
        .string()
        .trim()
        .regex(/^\d{4}$/, { message: 'year must be a 4-digit year.' })
        .transform((value) => Number(value)),
      z.number().int().gte(1900).lte(9999),
    ])
    .optional(),
});
