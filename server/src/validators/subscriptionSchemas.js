const { z } = require('zod');

const createSubscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
  cost: z.number().min(0, 'Cost cannot be negative'),
  billingCycle: z.enum(['monthly', 'yearly', 'custom']),
  customCycleDays: z.number().min(1).nullable().optional(),
  startDate: z.string().or(z.date()).optional(),
  nextPaymentDate: z.string().or(z.date()).optional(),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.enum(['active', 'trial', 'expiring', 'paused', 'cancelled']).optional(),
  trialEndDate: z.string().or(z.date()).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
});

const updateSubscriptionSchema = createSubscriptionSchema.partial();

module.exports = { createSubscriptionSchema, updateSubscriptionSchema };
