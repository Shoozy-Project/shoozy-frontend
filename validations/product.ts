import { z } from 'zod';

export const productOptionSchema = z.object({
  name: z.string().min(1, 'Option name is required'),
  values: z.array(z.string()).min(1, 'At least one option value is required'),
});

export const productVariantSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  title: z.string().min(1, 'Title is required'),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
  price: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().min(0, 'Price must be positive')
  ),
  barcode: z.string().optional(),
  isActive: z.boolean().default(true),
  colorImage: z.string().optional().nullable(),
  optionValues: z
    .array(
      z.object({
        optionName: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

export const productImageSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  isPrimary: z.boolean().default(false),
  colorName: z.string().optional().nullable(),
  variantId: z.string().optional().nullable(),
  position: z.number().default(0),
});

export const addProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(220, 'Name is too long'),
  slug: z.string().min(1, 'Slug is required').max(250, 'Slug is too long'),
  brandId: z.string().min(1, 'Please select a brand'),
  sizeGuideId: z.string().optional().nullable(),
  skuPrefix: z.string().optional().nullable(),
  shortDescription: z.string().max(500, 'Short description is too long').optional().nullable(),
  description: z.string().optional().nullable(),
  basePrice: z.preprocess(
    (val) => (val === '' || val === undefined ? 0 : Number(val)),
    z.number().min(0, 'Base price must be positive')
  ),
  compareAtPrice: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().min(0, 'Compare price must be positive').optional().nullable()
  ),
  material: z.string().max(150, 'Material is too long').optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'UNISEX'], {
    required_error: 'Please select a target gender',
  }),
  promoBadge: z.enum(['NONE', 'FEATURED', 'HOT_DEAL', 'LIMITED_EDITION', 'CUSTOM']).default('NONE'),
  customBadgeText: z.string().max(40, 'Custom badge text is too long').optional().nullable(),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'ACTIVE']).default('DRAFT'),
  categories: z.array(z.string()).min(1, 'Please select at least one category'),
  options: z.array(productOptionSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
  images: z.array(productImageSchema).default([]),
});

export type AddProductInput = z.infer<typeof addProductSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductOptionInput = z.infer<typeof productOptionSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
