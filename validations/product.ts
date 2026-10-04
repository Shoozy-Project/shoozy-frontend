import { z } from 'zod';
import type { Locale } from '@/lib/i18n';
import { translate } from '@/lib/messages';

const messageFor = (locale: Locale) => (key: string) => translate(locale, key);

export function createProductOptionSchema(locale: Locale = 'en') {
  const m = messageFor(locale);
  return z.object({
    name: z.string().min(1, m('validation.optionNameRequired')),
    values: z.array(z.string()).min(1, m('validation.optionValueRequired')),
  });
}

export function createProductVariantSchema(locale: Locale = 'en') {
  const m = messageFor(locale);
  return z.object({
    id: z.string().uuid().optional(),
    sku: z.string().min(1, m('validation.skuRequired')),
    title: z.string().min(1, m('validation.titleRequired')),
    stockQuantity: z.number().int().min(0, m('validation.stockNonnegative')),
    price: z.preprocess(
      (value) => (value === '' || value === undefined ? undefined : Number(value)),
      z.number().min(0, m('validation.pricePositive')),
    ),
    barcode: z.string().optional(),
    isActive: z.boolean().default(true),
    colorImage: z.string().optional().nullable(),
    selectedOptionValueKeys: z.record(z.string(), z.string()).default({}),
    optionValues: z.array(z.object({ optionName: z.string(), value: z.string() })).optional(),
  });
}

export function createProductImageSchema(locale: Locale = 'en') {
  const m = messageFor(locale);
  return z.object({
    url: z.string().url(m('validation.urlInvalid')),
    isPrimary: z.boolean().default(false),
    colorName: z.string().optional().nullable(),
    variantId: z.string().optional().nullable(),
    position: z.number().default(0),
  });
}

export function createAddProductSchema(locale: Locale = 'en') {
  const m = messageFor(locale);
  return z.object({
    name: z.string().min(1, m('validation.productNameRequired')).max(220, m('validation.nameTooLong')),
    nameAr: z.string().trim().max(220, m('validation.arabicNameTooLong')).optional(),
    slug: z.string().min(1, m('validation.slugRequired')).max(250, m('validation.slugTooLong')),
    brandId: z.string().min(1, m('validation.selectBrand')),
    sizeGuideId: z.string().optional().nullable(),
    skuPrefix: z.string().optional().nullable(),
    shortDescription: z.string().max(500, m('validation.shortDescriptionTooLong')).optional().nullable(),
    shortDescriptionAr: z.string().max(500, m('validation.arabicShortDescriptionTooLong')).optional().nullable(),
    description: z.string().optional().nullable(),
    descriptionAr: z.string().max(50_000, m('validation.arabicDescriptionTooLong')).optional().nullable(),
    basePrice: z.preprocess((value) => (value === '' || value === undefined ? 0 : Number(value)), z.number().min(0, m('validation.basePricePositive'))),
    compareAtPrice: z.preprocess((value) => (value === '' || value === undefined ? undefined : Number(value)), z.number().min(0, m('validation.comparePricePositive')).optional().nullable()),
    material: z.string().max(150, m('validation.materialTooLong')).optional().nullable(),
    materialAr: z.string().max(150, m('validation.arabicMaterialTooLong')).optional().nullable(),
    seoTitle: z.string().max(255, m('validation.seoTitleTooLong')).optional().nullable(),
    seoTitleAr: z.string().max(255, m('validation.arabicSeoTitleTooLong')).optional().nullable(),
    seoDescription: z.string().max(500, m('validation.seoDescriptionTooLong')).optional().nullable(),
    seoDescriptionAr: z.string().max(500, m('validation.arabicSeoDescriptionTooLong')).optional().nullable(),
    gender: z.enum(['MALE', 'FEMALE', 'UNISEX'], { required_error: m('validation.selectGender') }),
    status: z.enum(['DRAFT', 'ACTIVE']).default('DRAFT'),
    categories: z.array(z.string()).min(1, m('validation.selectCategory')),
    options: z.array(createProductOptionSchema(locale)).default([]),
    variants: z.array(createProductVariantSchema(locale)).default([]),
    images: z.array(createProductImageSchema(locale)).default([]),
  }).superRefine((data, context) => {
    data.variants.forEach((variant, variantIndex) => {
      const selections = variant.selectedOptionValueKeys;
      const hasOneValidValuePerOption = Object.keys(selections).length === data.options.length && data.options.every((option, optionIndex) => {
        const selectedValueKey = selections[`option-${optionIndex}`];
        return option.values.some((_, valueIndex) => selectedValueKey === `value-${optionIndex}-${valueIndex}`);
      });
      if (!hasOneValidValuePerOption) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['variants', variantIndex, 'selectedOptionValueKeys'], message: m('validation.variantOption') });
      }
    });
  });
}

export const productOptionSchema = createProductOptionSchema();
export const productVariantSchema = createProductVariantSchema();
export const productImageSchema = createProductImageSchema();
export const addProductSchema = createAddProductSchema();

export type AddProductInput = z.infer<ReturnType<typeof createAddProductSchema>>;
export type ProductVariantInput = z.infer<ReturnType<typeof createProductVariantSchema>>;
export type ProductOptionInput = z.infer<ReturnType<typeof createProductOptionSchema>>;
export type ProductImageInput = z.infer<ReturnType<typeof createProductImageSchema>>;
