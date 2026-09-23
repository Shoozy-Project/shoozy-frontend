import { z } from 'zod';

export const brandSchema = z.object({
  name: z
    .string()
    .min(1, 'Brand name is required')
    .max(150, 'Name must be at most 150 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(180, 'Slug must be at most 180 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  description: z.string().max(2000, 'Description too long').nullable().optional(),
  logoUrl: z
    .string()
    .url('Must be a valid image URL')
    .max(500)
    .nullable()
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
});

export type BrandFormInput = z.infer<typeof brandSchema>;
