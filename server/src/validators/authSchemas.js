const { z } = require('zod');

// Reusable strict email validator
const strictEmail = z
  .string()
  .email('Invalid email address')
  .toLowerCase()
  .trim()
  .refine((email) => {
    const localPart = email.split('@')[0];
    // Must start with a letter
    if (!/^[a-zA-Z]/.test(localPart)) return false;
    // Local part must be at least 5 characters
    if (localPart.length < 5) return false;
    // Must not be all digits
    if (/^\d+$/.test(localPart)) return false;
    return true;
  }, {
    message: 'Please enter a valid email (e.g. john.doe@gmail.com). The username must start with a letter and be at least 5 characters.',
  });

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  email: strictEmail,
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be at most 128 characters'),
});

const loginSchema = z.object({
  email: strictEmail,
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
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters')
    .max(128)
    .optional(),
});

module.exports = { registerSchema, loginSchema, updateProfileSchema };
