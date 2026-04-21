const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be at most 128 characters'),
});

const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .trim()
    .optional(),
  theme: z.enum(['light', 'dark']).optional(),
  currency: z.enum(['INR', 'USD']).optional(),
  budgetLimit: z.number().min(0).nullable().optional(),
});

module.exports = { registerSchema, loginSchema, updateProfileSchema };
