import { z } from 'zod';

const hexColorRegex = /^#([A-Fa-f0-9]{6})$/;

const budgetTypeEnum = z
  .string({ required_error: 'budget_type is required.' })
  .trim()
  .toLowerCase()
  .refine((value) => value === 'need' || value === 'want', {
    message: "budget_type must be either 'need' or 'want'.",
  });

// Schema for creating a category with explicit need/want designation.
export const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'name is required.' })
    .trim()
    .min(1, { message: 'name cannot be empty.' })
    .max(50, { message: 'name must be 50 characters or fewer.' }),
  color: z
    .string()
    .trim()
    .regex(hexColorRegex, { message: 'color must be a hex code like #33AA77.' })
    .optional()
    .nullable(),
  budget_type: budgetTypeEnum.optional().default('need'),
});

// Schema for partial category updates; at least one property must be supplied.
export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: 'name cannot be empty.' })
      .max(50, { message: 'name must be 50 characters or fewer.' })
      .optional(),
    color: z
      .string()
      .trim()
      .regex(hexColorRegex, { message: 'color must be a hex code like #33AA77.' })
      .optional()
      .nullable(),
    budget_type: budgetTypeEnum.optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.color !== undefined || data.budget_type !== undefined,
    {
    message: 'At least one field must be provided for update.',
    },
  );
