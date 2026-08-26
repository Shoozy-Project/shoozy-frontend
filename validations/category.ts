import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(150, 'Name must be at most 150 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(180, 'Slug must be at most 180 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  description: z.string().max(2000, 'Description too long').nullable().optional(),
  imageUrl: z
    .string()
    .url('Must be a valid URL')
    .max(500)
    .nullable()
    .optional()
    .or(z.literal('')),
  sortOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean(),
  parentId: z.string().uuid('Invalid parent ID').nullable().optional(),
});

export type CategoryFormInput = z.infer<typeof categorySchema>;

