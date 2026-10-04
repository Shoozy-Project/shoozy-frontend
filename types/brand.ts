import type { EntityTranslation, TranslationMap } from '@/types/localization';

// ─── Brand Types ────────────────────────────────────────────

export interface BrandDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  translations?: TranslationMap<EntityTranslation>;
}

export interface BrandListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'slug' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateBrandPayload {
  name: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
  translations?: TranslationMap<EntityTranslation>;
}

export type UpdateBrandPayload = Partial<CreateBrandPayload>;
