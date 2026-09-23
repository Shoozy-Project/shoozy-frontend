import { z } from 'zod';
import type { Locale } from '@/lib/i18n';
import { translate } from '@/lib/messages';

export function createBrandSchema(locale: Locale = 'en') {
  const m = (key: string) => translate(locale, key);
  return z.object({
    name: z.string().min(1, m('validation.brandNameRequired')).max(150, m('validation.name150')),
    nameAr: z.string().trim().max(150, m('validation.arabicName150')).optional(),
    slug: z.string().min(1, m('validation.slugRequired')).max(180, m('validation.slug180')).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, m('validation.slugPattern')),
    description: z.string().max(2000, m('validation.descriptionLong')).nullable().optional(),
    descriptionAr: z.string().max(2000, m('validation.arabicDescriptionLong')).nullable().optional(),
    logoUrl: z.string().url(m('validation.imageUrlInvalid')).max(500).nullable().optional().or(z.literal('')),
    isActive: z.boolean(),
  });
}

export const brandSchema = createBrandSchema();
export type BrandFormInput = z.infer<ReturnType<typeof createBrandSchema>>;
